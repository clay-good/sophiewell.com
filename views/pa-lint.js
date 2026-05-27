// Group P (Revenue cycle & utilization) — spec-v52 wave 52-1b.
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

const MAX_FILE_BYTES = 50 * 1024 * 1024; // 50 MB per file, per spec-v52 §4.3
const MAX_TOTAL_BYTES = 200 * 1024 * 1024; // 200 MB packet ceiling

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

function renderFinding(file, hash, error) {
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
  return li;
}

async function processFiles(fileList, resultsList, statusNode) {
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
  let i = 0;
  for (const file of files) {
    i += 1;
    statusNode.textContent = 'Hashing ' + i + ' of ' + files.length + ': ' + file.name;
    if (file.size > MAX_FILE_BYTES) {
      resultsList.appendChild(renderFinding(file, null, 'File exceeds 50 MB per-file ceiling (spec-v52 §4.3).'));
      continue;
    }
    try {
      const buf = await file.arrayBuffer();
      const hash = await sha256Hex(buf);
      resultsList.appendChild(renderFinding(file, hash));
    } catch (err) {
      resultsList.appendChild(renderFinding(file, null, 'Read failed: ' + (err && err.message ? err.message : String(err))));
    }
  }
  statusNode.textContent = 'Done. ' + files.length + ' file' + (files.length === 1 ? '' : 's')
    + ' hashed. The deterministic rule engine ships in the next wave (spec-v52 §4.5).';
}

export const renderers = {
  'pa-lint'(root) {
    root.appendChild(el('p', { class: 'notice', text:
      'Wave 52-1b: dropzone + SHA-256 audit trail. The 60-rule core ruleset, '
      + 'the PDF / DOCX parsers, and the DOCX report ship in the next wave '
      + '(spec-v52 §4.5, §5.2, §4.6). Your packet stays in this tab; no '
      + 'network, no storage, no AI.' }));

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
      if (files && files.length) processFiles(files, results, status);
    });
    picker.addEventListener('change', () => {
      if (picker.files && picker.files.length) processFiles(picker.files, results, status);
    });
  },
};
