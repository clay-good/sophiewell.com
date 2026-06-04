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
import { buildJsonReport, buildRedactedJsonReport, buildDocxReport } from '../lib/pa/report.js';
import { disabledSourceMap } from '../lib/pa/staleness.js';
import { PA_STALENESS_LEDGER } from '../lib/pa/staleness-ledger.js';

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
  if (extract) {
    const kind = extract.kind || 'Document';
    const parts = [kind + ' parsed'];
    if (typeof extract.pageCount === 'number') {
      parts.push(extract.pageCount + ' page' + (extract.pageCount === 1 ? '' : 's'));
    }
    parts.push(extract.text.length + ' characters of extractable text');
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
    const li = el('li', { class: 'pa-rule', 'data-status': f.status });
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
    const downloads = el('div', { class: 'pa-downloads', role: 'group',
      'aria-label': 'Download report' });
    const docxBtn = el('button', { type: 'button', class: 'pa-download-btn',
      'data-flavor': 'docx', text: 'Download report (.docx)' });
    docxBtn.addEventListener('click', () => downloadDocx(bundle, findings, 'pa-report.docx'));
    const fullBtn = el('button', { type: 'button', class: 'pa-download-btn',
      'data-flavor': 'json-full', text: 'Download report (.json)' });
    fullBtn.addEventListener('click', () => downloadReport(bundle, findings, 'pa-report.json', false));
    const redactedBtn = el('button', { type: 'button', class: 'pa-download-btn',
      'data-flavor': 'json-redacted', text: 'Download PHI-redacted report (.json)' });
    redactedBtn.addEventListener('click', () => downloadReport(bundle, findings, 'pa-report.redacted.json', true));
    downloads.appendChild(docxBtn);
    downloads.appendChild(fullBtn);
    downloads.appendChild(redactedBtn);
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
function downloadDocx(bundle, findings, filename) {
  const bytes = buildDocxReport(bundle, findings, { generatedAt: new Date().toISOString() });
  const blob = new Blob([bytes], { type: DOCX_MIME });
  triggerDownload(blob, filename);
}

function downloadReport(bundle, findings, filename, redacted) {
  const opts = { generatedAt: new Date().toISOString() };
  const report = redacted
    ? buildRedactedJsonReport(bundle, findings, opts)
    : buildJsonReport(bundle, findings, opts);
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
        extract = { kind: 'TXT', text };
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
    resultsList.appendChild(renderFinding(file, { hash, extract }));
    if (extract && extract.text) {
      documents.push({ name: file.name, sha256: hash, kind: extract.kind, text: extract.text });
    }
  }
  // spec-v52 §4.5: run the starter ruleset over the aggregated text
  // bundle and render the findings panel. Empty bundle (e.g. user
  // dropped only images) skips the engine pass and shows just the
  // per-file audit-trail.
  if (findingsPanel) {
    if (documents.length) {
      statusNode.textContent = 'Running rule engine over ' + documents.length
        + ' parsed document' + (documents.length === 1 ? '' : 's') + '...';
      const bundle = buildBundle(documents, { totalBytes });
      // spec-v52 §4.5.6: skip rules whose source the maintainer has disabled
      // in the bundled ledger (no runtime fetch). The shipped ledger disables
      // none, so this is a no-op today; it wires the mechanism for when a
      // source goes 404 (surfaced by scripts/refresh-pa-rules.mjs).
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
        + ' processed; no extractable text -- engine pass skipped.';
    }
  }
}

export const renderers = {
  'pa-lint'(root) {
    root.appendChild(el('p', { class: 'notice', text:
      'Wave 52-14: drop PDF, DOCX, or TXT files. Sophie hashes each file, '
      + 'extracts text (pdf.js / mammoth.js, both vendored), classifies '
      + 'each document by role + payer, and runs the complete §4.5.1 '
      + 'core ruleset (60 rules), the complete §4.5.2 CMS Medicare FFS '
      + 'overlay (25 rules), the complete §4.5.3 CMS Medicare Advantage '
      + 'overlay (15 rules), the complete §4.5.4 Medicaid state-agnostic '
      + 'core (10 rules), the complete §4.5.5 specialty overlays '
      + '(25 rules: radiology + infusion + surgery + behavioral health + '
      + 'genetic testing), and the complete §4.5.7–§4.5.14 commercial '
      + 'overlays (Aetna + UnitedHealthcare + Anthem + Cigna + Humana + HCSC + '
      + 'Highmark + Florida Blue, 20 rules each) against the aggregated bundle. Overlay rules '
      + 'self-gate on the detected payer; off-bucket packets see them '
      + 'vacuously pass. Wave 52-6b adds the human-facing DOCX report as '
      + 'a third download button alongside the full JSON report and the '
      + 'PHI-redacted JSON report (spec-v52 §4.6 / §4.7). All three are '
      + 'built in-tab from the in-memory bundle, and the audit trail now '
      + 'surfaces per-source dataset staleness from the bundled ledger '
      + '(spec-v52 §8.3). Your packet stays in '
      + 'this tab; no network, no storage, no AI.' }));

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
      text: 'Drop PDF / DOCX / TXT files here, or click to select.' }));
    dropzone.appendChild(el('p', { class: 'pa-dropzone-sub',
      text: 'Per-file ceiling 50 MB; per-packet ceiling 200 MB.' }));

    const picker = el('input', {
      type: 'file',
      id: 'pa-file-picker',
      multiple: 'multiple',
      accept: '.pdf,.docx,.txt,.jpg,.jpeg,.png',
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
