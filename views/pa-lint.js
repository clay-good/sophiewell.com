// Group P (Revenue cycle & utilization) -- spec-v52 wave 52-1b.
//
// Prior-Auth Packet Linter (`pa-lint`). v52 introduces a new tile shape:
// "document-linter" (§3.2). The user drops one or more documents on the
// dropzone and Sophie returns a deterministic findings report. The full
// pipeline (PDF/DOCX parse + classify + extract + rule engine + DOCX
// report) is the multi-wave build in spec-v52 §4.3 and §9.
//
// This wave (52-1b) ships the tile shell with the minimum that satisfies
// spec-v29 §3's scope test: the user provides input (the dropped files),
// and the tile computes a deterministic output (per-file SHA-256, size,
// MIME). That output is the audit-trail spine of every future rule
// finding (spec-v52 §4.3 ingest step, §4.10 determinism guarantees) and
// is already useful on its own as a "did the packet I e-submitted match
// the one I think I e-submitted" check. The rule engine, the parsers,
// the payer overlays, and the DOCX report all land in subsequent waves
// and slot into the same dropzone UI.
//
// Posture invariants ([spec-v50](../docs/spec-v50.md) §3) all hold:
// - No network. Files are read via FileReader; hashes via crypto.subtle.
// - No storage. Files exist only as in-memory ArrayBuffers for the
//   duration of the hash and are dropped on "Start over".
// - No third-party fetch. The parsers vendored in later waves live under
//   /vendored/ and load lazily from same-origin.
// - No AI. SHA-256 is deterministic.

import { el, clear } from '../lib/dom.js';
import { buildBundle, runEngine, summarizeFindings } from '../lib/pa/engine.js';
import { buildJsonReport, buildRedactedJsonReport, buildDocxReport, buildRedactedDocxReport } from '../lib/pa/report.js';
import { disabledSourceMap } from '../lib/pa/staleness.js';
import { PA_STALENESS_LEDGER } from '../lib/pa/staleness-ledger.js';
import { isImageFile, isOcrCandidate, ocrDocument, createOcrRunner } from '../lib/pa/ocr.js';

const MAX_FILE_BYTES = 50 * 1024 * 1024; // 50 MB per file, per spec-v52 §4.3
const MAX_TOTAL_BYTES = 200 * 1024 * 1024; // 200 MB packet ceiling

// spec-v52 §5.2, §5.4: pdf.js vendored under /vendored/pdfjs/. Lazy-
// loaded on first PDF drop so the tile page's idle weight stays under
// the §4.9 budget. The dynamic import resolves the absolute path so
// the same code works from the SPA home route (#pa-lint) and from any
// pre-rendered /tools/pa-lint/index.html the build emits later.
let pdfjsPromise = null;
function loadPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import('/vendored/pdfjs/build/pdf.mjs').then((mod) => {
      const lib = mod.default || mod;
      if (lib.GlobalWorkerOptions && !lib.GlobalWorkerOptions.workerSrc) {
        lib.GlobalWorkerOptions.workerSrc = '/vendored/pdfjs/build/pdf.worker.mjs';
      }
      return lib;
    });
  }
  return pdfjsPromise;
}

// spec-v52 §5.2: mammoth.js vendored under /vendored/mammoth/ for
// DOCX text extraction. Upstream ships as a UMD bundle so we inject a
// same-origin classic <script> on first DOCX drop and resolve on load
// to `window.mammoth`. Memoized -- only one network/disk hit per session.
let mammothPromise = null;
function loadMammoth() {
  if (!mammothPromise) {
    mammothPromise = new Promise((resolve, reject) => {
      if (typeof window !== 'undefined' && window.mammoth) {
        resolve(window.mammoth);
        return;
      }
      const s = document.createElement('script');
      s.src = '/vendored/mammoth/mammoth.browser.min.js';
      s.async = true;
      s.onload = () => {
        if (window.mammoth) resolve(window.mammoth);
        else reject(new Error('mammoth loaded but window.mammoth was not set'));
      };
      s.onerror = () => reject(new Error('failed to load /vendored/mammoth/mammoth.browser.min.js'));
      document.head.appendChild(s);
    });
  }
  return mammothPromise;
}

async function extractDocxText(arrayBuffer) {
  const mammoth = await loadMammoth();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return { text: String(result && result.value || '') };
}

// spec-v52 §4.3.1 / §5.3: tesseract.js OCR engine, vendored under
// /vendored/tesseract/. UMD bundle injected as a same-origin classic
// <script> on the first "Run on-device OCR" click and resolved to
// `window.Tesseract`. Memoized -- the ~9 MB engine loads at most once per
// session and only when the user opts in (idle page weight unaffected,
// spec-v10 §6). No third-party origin; no auto-load.
let tesseractPromise = null;
function loadTesseract() {
  if (!tesseractPromise) {
    tesseractPromise = new Promise((resolve, reject) => {
      if (typeof window !== 'undefined' && window.Tesseract) {
        resolve(window.Tesseract);
        return;
      }
      const s = document.createElement('script');
      s.src = '/vendored/tesseract/tesseract.min.js';
      s.async = true;
      s.onload = () => {
        if (window.Tesseract) resolve(window.Tesseract);
        else reject(new Error('tesseract.js loaded but window.Tesseract was not set'));
      };
      s.onerror = () => reject(new Error('failed to load /vendored/tesseract/tesseract.min.js'));
      document.head.appendChild(s);
    });
  }
  return tesseractPromise;
}

// OCR a scanned (image-only) PDF by rendering each page to a canvas with the
// already-vendored pdf.js, then recognizing the canvas. Re-reads the file so
// the buffer pdf.js may neuter at parse time is never reused.
async function ocrScannedPdf(file, runner, onPage) {
  const pdfjs = await loadPdfjs();
  const buf = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buf), isEvalSupported: false }).promise;
  let text = '';
  for (let p = 1; p <= doc.numPages; p += 1) {
    if (onPage) onPage(p, doc.numPages);
    const page = await doc.getPage(p);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext('2d');
    await page.render({ canvasContext: ctx, viewport }).promise;
    text += (await runner.recognize(canvas)) + '\n';
    page.cleanup();
  }
  await doc.cleanup();
  await doc.destroy();
  return text;
}

async function extractPdfText(arrayBuffer) {
  const pdfjs = await loadPdfjs();
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(arrayBuffer),
    // Disable side-channel network fetches: pdf.js sometimes pulls CMap
    // tables from a remote URL for non-Latin scripts. Sophie ships no
    // CMaps in v52 (vendored/pdfjs/_vendored.md "what is omitted"), so
    // disable the lookup entirely to keep the no-network guarantee.
    disableFontFace: false,
    isEvalSupported: false,
    useSystemFonts: false,
  });
  const doc = await loadingTask.promise;
  const pageCount = doc.numPages;
  let combined = '';
  for (let p = 1; p <= pageCount; p += 1) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    const pageText = content.items.map((it) => (it.str || '')).join(' ');
    combined += pageText + '\n';
    page.cleanup();
  }
  await doc.cleanup();
  await doc.destroy();
  return { pageCount, text: combined };
}

function formatBytes(n) {
  if (n < 1024) return n + ' B';
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
  return (n / (1024 * 1024)).toFixed(2) + ' MB';
}

async function sha256Hex(buffer) {
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  const bytes = new Uint8Array(digest);
  let out = '';
  for (let i = 0; i < bytes.length; i += 1) {
    out += bytes[i].toString(16).padStart(2, '0');
  }
  return out;
}

function renderFinding(file, opts) {
  const { hash, error, extract } = opts || {};
  const li = el('li', { class: 'pa-finding', 'data-severity': error ? 'flag' : 'info' });
  li.appendChild(el('span', { class: 'pa-finding-label visually-hidden',
    text: (error ? 'Flag: ' : 'Info: ') + file.name }));
  li.appendChild(el('p', { class: 'pa-finding-name', text: file.name }));
  const meta = el('p', { class: 'pa-finding-meta' });
  meta.appendChild(document.createTextNode(formatBytes(file.size) + ' · '));
  meta.appendChild(document.createTextNode(file.type || 'application/octet-stream'));
  li.appendChild(meta);
  if (error) {
    li.appendChild(el('p', { class: 'pa-finding-err', text: error }));
  } else {
    li.appendChild(el('p', { class: 'pa-finding-hash', text: 'sha256: ' + hash }));
  }
  if (extract && extract.kind === 'IMAGE') {
    li.appendChild(el('p', { class: 'pa-finding-extract',
      text: 'Image · no embedded text layer · on-device OCR available below' }));
  } else if (extract) {
    const kind = extract.kind || 'Document';
    const parts = [kind + ' parsed'];
    if (typeof extract.pageCount === 'number') {
      parts.push(extract.pageCount + ' page' + (extract.pageCount === 1 ? '' : 's'));
    }
    parts.push(extract.text.length + ' characters of extractable text');
    if (opts && opts.scanned) parts.push('looks like a scan · on-device OCR available below');
    li.appendChild(el('p', { class: 'pa-finding-extract', text: parts.join(' · ') }));
  }
  return li;
}

function isPdf(file) {
  return (file.type === 'application/pdf')
    || /\.pdf$/i.test(file.name || '');
}

function isDocx(file) {
  return (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    || /\.docx$/i.test(file.name || '');
}

function isTxt(file) {
  return (file.type === 'text/plain') || /\.txt$/i.test(file.name || '');
}

function renderFindingsPanel(panel, findings, counts, bundle) {
  clear(panel);
  if (!findings.length) return;
  const headline = el('h3', { class: 'pa-findings-headline',
    text: 'Findings (' + findings.length + ' rules, ' + counts.block + ' block / '
      + counts.flag + ' flag / ' + counts.pass + ' pass'
      + (counts.error ? ' / ' + counts.error + ' error' : '') + ')' });
  panel.appendChild(headline);
  // spec-v52 §4.3: render the detected payer bucket + the per-document
  // role tags so the user can verify the classifier picked the right
  // payer overlay path. The payer-selector UI per §4.2 step 4 lands
  // when the first payer overlay rule ships.
  if (bundle) {
    panel.appendChild(el('p', { class: 'pa-payer-line',
      text: 'Detected payer: ' + bundle.payer
        + ' · ' + bundle.documents.length + ' document'
        + (bundle.documents.length === 1 ? '' : 's') + ' classified.' }));
    const roleList = el('ul', { class: 'pa-role-list', 'aria-label': 'Document roles' });
    for (const d of bundle.documents) {
      roleList.appendChild(el('li', { text: d.name + ': ' + d.role + ' (payer ' + d.payer + ')' }));
    }
    panel.appendChild(roleList);
  }
  const list = el('ul', { class: 'pa-findings-list', 'aria-label': 'Rule findings' });
  for (const f of findings) {
    const li = el('li', { class: 'pa-rule', 'data-status': f.status, 'data-rule': f.ruleId });
    li.appendChild(el('span', { class: 'pa-rule-label visually-hidden',
      text: f.status.toUpperCase() + ': ' + f.description }));
    const head = el('p', { class: 'pa-rule-head' });
    head.appendChild(el('span', { class: 'pa-rule-id', text: f.ruleId }));
    head.appendChild(document.createTextNode(' '));
    head.appendChild(el('span', { class: 'pa-rule-status', text: f.status.toUpperCase() }));
    head.appendChild(document.createTextNode(' -- '));
    head.appendChild(document.createTextNode(f.description));
    li.appendChild(head);
    if (f.note) li.appendChild(el('p', { class: 'pa-rule-note', text: f.note }));
    if (f.evidence) li.appendChild(el('p', { class: 'pa-rule-evidence', text: f.evidence }));
    li.appendChild(el('p', { class: 'pa-rule-citation', text: f.citation }));
    list.appendChild(li);
  }
  panel.appendChild(list);
  // spec-v52 §4.6: per-§4.2 step 5, the results panel offers downloads.
  // Wave 52-6a shipped the JSON report (full + PHI-redacted); wave 52-6b
  // adds the human-facing DOCX report as the third button. The packet
  // stays in the tab: each button serializes from the in-memory bundle /
  // findings and writes a Blob via URL.createObjectURL. No network call.
  if (bundle) {
    // spec-v59 §3.1: the DEFAULT export is PHI-redacted. The raw-extract export
    // (which echoes patientName / dob / memberId / SSN counts) is reached only
    // by explicitly ticking the labeled "include PHI" box first -- a nurse who
    // clicks "Download report" to attach or share never gets full PHI by default.
    const downloads = el('div', { class: 'pa-downloads', role: 'group',
      'aria-label': 'Download report' });

    const phiToggleWrap = el('p', { class: 'pa-phi-toggle' });
    const phiToggle = el('input', { id: 'pa-include-phi', type: 'checkbox' });
    phiToggleWrap.appendChild(phiToggle);
    phiToggleWrap.appendChild(el('label', { for: 'pa-include-phi',
      text: ' Include raw PHI in the export (internal use only — the report will contain patient name, DOB, and member ID)' }));

    const includePhi = () => phiToggle.checked;

    const docxBtn = el('button', { type: 'button', class: 'pa-download-btn',
      'data-flavor': 'docx', text: 'Download report (.docx)' });
    docxBtn.addEventListener('click', () => downloadDocx(bundle, findings,
      includePhi() ? 'pa-report.with-phi.docx' : 'pa-report.docx', includePhi()));
    const jsonBtn = el('button', { type: 'button', class: 'pa-download-btn',
      'data-flavor': 'json', text: 'Download report (.json)' });
    jsonBtn.addEventListener('click', () => downloadReport(bundle, findings,
      includePhi() ? 'pa-report.with-phi.json' : 'pa-report.json', includePhi()));

    downloads.appendChild(docxBtn);
    downloads.appendChild(jsonBtn);
    panel.appendChild(phiToggleWrap);
    panel.appendChild(downloads);
  }
}

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Defer revoke so Safari has time to start the download.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// spec-v52 §4.10 + §8.3 follow-up: capture one timestamp at report-generation
// time. It populates the cover-page / audit-trail "generated at" and lets the
// audit trail surface live per-source dataset staleness from the bundled
// ledger. Capturing `new Date()` here (in the view, on a user click) keeps it
// out of the deterministic compute path -- the builders default to null.
// spec-v59 §3.1: redacted by default. `includePhi` (the explicit opt-in) routes
// to the raw-extract builder; otherwise the redacted builder is used.
function downloadDocx(bundle, findings, filename, includePhi) {
  const opts = { generatedAt: new Date().toISOString() };
  const bytes = includePhi
    ? buildDocxReport(bundle, findings, opts)
    : buildRedactedDocxReport(bundle, findings, opts);
  const blob = new Blob([bytes], { type: DOCX_MIME });
  triggerDownload(blob, filename);
}

function downloadReport(bundle, findings, filename, includePhi) {
  const opts = { generatedAt: new Date().toISOString() };
  const report = includePhi
    ? buildJsonReport(bundle, findings, opts)
    : buildRedactedJsonReport(bundle, findings, opts);
  const json = JSON.stringify(report, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  triggerDownload(blob, filename);
}

async function processFiles(fileList, resultsList, statusNode, findingsPanel) {
  clear(resultsList);
  const files = Array.from(fileList);
  if (files.length === 0) {
    statusNode.textContent = '';
    return;
  }
  const totalBytes = files.reduce((sum, f) => sum + f.size, 0);
  if (totalBytes > MAX_TOTAL_BYTES) {
    statusNode.textContent = 'Packet exceeds 200 MB ceiling (spec-v52 §4.3). Drop a smaller set.';
    return;
  }
  statusNode.textContent = 'Hashing ' + files.length + ' file' + (files.length === 1 ? '' : 's') + '...';
  const documents = [];
  const ocrCandidates = [];
  let i = 0;
  for (const file of files) {
    i += 1;
    statusNode.textContent = 'Hashing ' + i + ' of ' + files.length + ': ' + file.name;
    if (file.size > MAX_FILE_BYTES) {
      resultsList.appendChild(renderFinding(file, { error: 'File exceeds 50 MB per-file ceiling (spec-v52 §4.3).' }));
      continue;
    }
    let buf;
    try {
      buf = await file.arrayBuffer();
    } catch (err) {
      resultsList.appendChild(renderFinding(file, { error: 'Read failed: ' + (err && err.message ? err.message : String(err)) }));
      continue;
    }
    let hash;
    try {
      hash = await sha256Hex(buf);
    } catch (err) {
      resultsList.appendChild(renderFinding(file, { error: 'Hash failed: ' + (err && err.message ? err.message : String(err)) }));
      continue;
    }
    let extract = null;
    let parseLabel = null;
    try {
      if (isPdf(file)) {
        parseLabel = 'PDF';
        const out = await extractPdfText(buf);
        extract = { kind: 'PDF', pageCount: out.pageCount, text: out.text };
      } else if (isDocx(file)) {
        parseLabel = 'DOCX';
        const out = await extractDocxText(buf);
        extract = { kind: 'DOCX', text: out.text };
      } else if (isTxt(file)) {
        parseLabel = 'TXT';
        const text = new TextDecoder('utf-8').decode(buf);
        // spec-v59 §3.3 U-3: a binary / non-UTF8 file decoded as text is a run
        // of U+FFFD replacement chars. Running the full ~40-rule engine over
        // that garbage is wasted work and yields meaningless findings; pre-gate
        // on the replacement-char ratio and treat the file as non-text instead.
        let replacements = 0;
        for (let i = 0; i < text.length; i += 1) if (text.charCodeAt(i) === 0xfffd) replacements += 1;
        if (text.length && replacements / text.length > 0.3) {
          extract = { kind: 'TXT', text: '', parseError: 'binary or non-UTF8 content (skipped)' };
        } else {
          extract = { kind: 'TXT', text };
        }
      } else if (isImageFile(file)) {
        // spec-v52 §4.3.1: images carry no embedded text. The deterministic
        // pipeline cannot lint them until OCR runs; mark them as OCR candidates.
        parseLabel = 'IMAGE';
        extract = { kind: 'IMAGE', text: '' };
      }
    } catch (err) {
      // Render hash + a parse-failed note rather than dropping the
      // file entirely. Common causes: encrypted PDF, malformed file,
      // or password-protected DOCX. One bad file should not lose the
      // audit trail for the rest of the packet.
      const message = err && err.message ? err.message : String(err);
      const li = renderFinding(file, { hash });
      li.appendChild(el('p', { class: 'pa-finding-err',
        text: parseLabel + ' text extraction failed: ' + message }));
      resultsList.appendChild(li);
      // spec-v52 wave 52-1k: push a stub document into the engine
      // bundle so R-PA-043 (password / encrypted) and R-PA-044 (parse
      // error / zero content) can fire deterministically on the
      // packet rather than silently dropping the failed file.
      documents.push({ name: file.name, sha256: hash, kind: parseLabel || '', text: '', parseError: message });
      continue;
    }
    const scanned = isOcrCandidate(file, extract) && extract && extract.kind === 'PDF';
    resultsList.appendChild(renderFinding(file, { hash, extract, scanned }));
    if (extract && extract.text) {
      documents.push({ name: file.name, sha256: hash, kind: extract.kind, text: extract.text });
    }
    // spec-v52 §4.3.1: collect OCR candidates (images, scanned PDFs). The
    // File reference is kept (not the buffer) so OCR re-reads it fresh.
    if (isOcrCandidate(file, extract)) {
      ocrCandidates.push({ file, hash, kind: extract && extract.kind === 'PDF' ? 'pdf' : 'image' });
    }
  }

  // spec-v52 §4.5: run the starter ruleset over the aggregated text bundle and
  // render the findings panel. Extracted into a closure so the OCR path can
  // re-run it after adding OCR-sourced text to `documents`.
  function runAndRender() {
    if (!findingsPanel) return;
    if (documents.length) {
      const bundle = buildBundle(documents, { totalBytes });
      // spec-v52 §4.5.6: skip rules whose source the maintainer disabled in the
      // bundled ledger (no runtime fetch). The shipped ledger disables none.
      const findings = runEngine(bundle, undefined, { disabledSources: disabledSourceMap(PA_STALENESS_LEDGER) });
      const counts = summarizeFindings(findings);
      renderFindingsPanel(findingsPanel, findings, counts, bundle);
      statusNode.textContent = 'Done. ' + files.length + ' file'
        + (files.length === 1 ? '' : 's') + ' processed; '
        + findings.length + ' rule' + (findings.length === 1 ? '' : 's')
        + ' evaluated (' + counts.block + ' block, ' + counts.flag + ' flag, '
        + counts.pass + ' pass'
        + (counts.error ? ', ' + counts.error + ' error' : '') + ').';
    } else {
      clear(findingsPanel);
      statusNode.textContent = 'Done. ' + files.length + ' file'
        + (files.length === 1 ? '' : 's')
        + ' processed; no extractable text -- drop a text-bearing file or run OCR below.';
    }
  }

  if (documents.length) {
    statusNode.textContent = 'Running rule engine over ' + documents.length
      + ' parsed document' + (documents.length === 1 ? '' : 's') + '...';
  }
  runAndRender();

  // spec-v52 §4.3.1: if any dropped file is an image or a scanned PDF, offer a
  // single user-triggered, on-device OCR control. Nothing loads or runs until
  // the user clicks it (lazy ~9 MB engine; spec-v10 §6 budget). Each OCR'd file
  // contributes a `kind: 'OCR'` document and the engine re-runs.
  if (ocrCandidates.length) {
    renderOcrControl(resultsList, ocrCandidates, documents, runAndRender, statusNode);
  }
}

// Render the OCR affordance + wire the on-device OCR run. Kept in the view
// (browser-only) and dependency-injects window.Tesseract.createWorker into the
// pure runner from lib/pa/ocr.js.
function renderOcrControl(resultsList, candidates, documents, runAndRender, statusNode) {
  const n = candidates.length;
  const wrap = el('div', { class: 'pa-ocr', role: 'group', 'aria-label': 'On-device OCR' });
  wrap.appendChild(el('p', { class: 'pa-ocr-note', text:
    n + ' file' + (n === 1 ? '' : 's') + ' (image or scanned PDF) carr'
    + (n === 1 ? 'ies' : 'y') + ' no embedded text. Run optical character '
    + 'recognition on this device to extract it — nothing leaves the tab, no '
    + 'network, no AI service. The ~9 MB engine downloads once on first use.' }));
  const btn = el('button', { type: 'button', class: 'pa-ocr-btn',
    text: 'Run on-device OCR on ' + n + ' file' + (n === 1 ? '' : 's') });
  const status = el('p', { class: 'pa-ocr-status', role: 'status', 'aria-live': 'polite' });
  btn.addEventListener('click', async () => {
    btn.disabled = true;
    status.textContent = 'Loading the OCR engine (first use only)…';
    let runner;
    try {
      const tesseract = await loadTesseract();
      runner = createOcrRunner(tesseract.createWorker);
    } catch (err) {
      status.textContent = 'Could not load the OCR engine: ' + (err && err.message ? err.message : String(err));
      btn.disabled = false;
      return;
    }
    let done = 0;
    for (const c of candidates) {
      done += 1;
      status.textContent = 'OCR ' + done + ' of ' + n + ': ' + c.file.name + '…';
      try {
        const text = c.kind === 'pdf'
          ? await ocrScannedPdf(c.file, runner, (p, total) => {
              status.textContent = 'OCR ' + done + ' of ' + n + ': ' + c.file.name + ' (page ' + p + '/' + total + ')…';
            })
          : await runner.recognize(c.file);
        documents.push(ocrDocument(c.file, c.hash, text));
      } catch (err) {
        status.textContent = 'OCR failed for ' + c.file.name + ': ' + (err && err.message ? err.message : String(err));
      }
    }
    try { await runner.terminate(); } catch { /* best effort */ }
    status.textContent = 'OCR complete — re-running the rule engine over the extracted text.';
    runAndRender();
    wrap.setAttribute('data-ocr-done', 'true');
  });
  wrap.appendChild(btn);
  wrap.appendChild(status);
  resultsList.parentNode.insertBefore(wrap, resultsList.nextSibling);
}

export const renderers = {
  'pa-lint'(root) {
    root.appendChild(el('p', { class: 'notice', text:
      'Drop a prior-authorization packet — PDF, DOCX, or TXT, or a scanned PDF or '
      + 'image for optional, on-device OCR. Sophie hashes each file locally, '
      + 'extracts the text (pdf.js / mammoth.js, both vendored), classifies every '
      + 'document by role and payer, and runs its full deterministic ruleset: a '
      + 'core set plus Medicare FFS, Medicare Advantage, and Medicaid overlays, '
      + 'specialty overlays (radiology, infusion, surgery, behavioral health, '
      + 'genetic testing), and payer-specific overlays for 23 commercial payers '
      + 'and 14 state Medicaid programs. Each overlay self-gates on the detected '
      + 'payer, so an off-payer packet simply sees those rules pass. You get three '
      + 'downloadable reports — a full JSON report, a PHI-redacted JSON report, and '
      + 'a human-readable DOCX — all built in this tab, and the audit trail flags '
      + 'any stale data source. Scanned files carry no text layer; the optional, '
      + 'user-triggered OCR (vendored tesseract.js) loads on demand and runs '
      + 'entirely in the tab. Your packet never leaves this tab: no network, no '
      + 'storage, no AI.' }));

    const trust = el('ul', { class: 'pa-trust-strip' });
    for (const line of [
      'Your packet stays in this tab. We never see your patients.',
      'No AI. Every future finding will cite a rule ID and a payer-policy URL.',
      'Free forever. MIT. Runs offline after first load.',
    ]) trust.appendChild(el('li', { text: line }));
    root.appendChild(trust);

    const dropzone = el('div', {
      class: 'pa-dropzone',
      tabindex: '0',
      role: 'button',
      'aria-label': 'Drop PA packet files here, or activate to choose files',
    });
    dropzone.appendChild(el('p', { class: 'pa-dropzone-headline',
      text: 'Drop PDF / DOCX / TXT — or a scanned PDF / image — here, or click to select.' }));
    dropzone.appendChild(el('p', { class: 'pa-dropzone-sub',
      text: 'Per-file ceiling 50 MB; per-packet ceiling 200 MB. Scans and images offer on-device OCR.' }));

    const picker = el('input', {
      type: 'file',
      id: 'pa-file-picker',
      multiple: 'multiple',
      accept: '.pdf,.docx,.txt,.jpg,.jpeg,.png',
      'aria-label': 'Upload prior-authorization files (PDF, DOCX, TXT, or image)',
    });
    picker.style.position = 'absolute';
    picker.style.left = '-9999px';
    dropzone.appendChild(picker);

    root.appendChild(dropzone);

    const status = el('p', { class: 'pa-status', role: 'status', 'aria-live': 'polite' });
    root.appendChild(status);

    const results = el('ul', { class: 'pa-results', 'aria-label': 'Per-file audit results' });
    root.appendChild(results);

    // spec-v52 §4.2 step 5: findings panel. Hidden when empty; populated
    // by processFiles() after the starter ruleset has run.
    const findingsPanel = el('section', { class: 'pa-findings-panel',
      'aria-label': 'Rule findings' });
    root.appendChild(findingsPanel);

    function openPicker() { picker.click(); }
    dropzone.addEventListener('click', (ev) => {
      if (ev.target !== picker) openPicker();
    });
    dropzone.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        openPicker();
      }
    });
    dropzone.addEventListener('dragover', (ev) => {
      ev.preventDefault();
      dropzone.classList.add('pa-dropzone-hot');
    });
    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('pa-dropzone-hot');
    });
    dropzone.addEventListener('drop', (ev) => {
      ev.preventDefault();
      dropzone.classList.remove('pa-dropzone-hot');
      const files = ev.dataTransfer && ev.dataTransfer.files;
      if (files && files.length) processFiles(files, results, status, findingsPanel);
    });
    picker.addEventListener('change', () => {
      if (picker.files && picker.files.length) processFiles(picker.files, results, status, findingsPanel);
    });
  },
};
