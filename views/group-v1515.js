// spec-v1515: local X12 file workbenches.
import { el, clear } from '../lib/dom.js';
import { MAX_FILE_BYTES } from '../lib/upload-intake.js';
import { resultRow } from '../lib/result-copy.js';

const workerUrl = new URL('../lib/x12-835-worker.js', import.meta.url);

function table(root, caption, headers, rows) {
  const wrap = el('div', { class: 'upload-mapping-scroll' });
  const node = el('table', { class: 'upload-mapping-table' });
  node.appendChild(el('caption', { text: caption }));
  const head = el('tr');
  headers.forEach((header) => head.appendChild(el('th', { scope: 'col', text: header })));
  node.appendChild(el('thead', null, [head]));
  const body = el('tbody');
  rows.forEach((values) => {
    const row = el('tr');
    values.forEach((value) => row.appendChild(el('td', { text: value == null ? '' : String(value) })));
    body.appendChild(row);
  });
  node.appendChild(body); wrap.appendChild(node); root.appendChild(wrap);
}

function reader835(root) {
  root.appendChild(el('p', { class: 'notice', text: 'Reads X12 835 version 5010 remittances locally, checks each service line and claim, then reconciles claim payments and provider-level adjustments to BPR02. Raw adjustment codes are preserved.' }));
  root.appendChild(el('p', { class: 'muted', text: 'Choose one or more X12 text files, up to 50 MB each. Files stay in this tab.' }));
  const input = el('input', { id: 'x835-files', type: 'file', multiple: true, accept: '.835,.txt,text/plain,application/octet-stream' });
  const status = el('p', { id: 'x835-status', class: 'muted', role: 'status', 'aria-live': 'polite' });
  const results = el('div', { id: 'q-results', 'aria-live': 'polite' });
  root.appendChild(el('label', { for: 'x835-files', text: 'Choose remittance files' })); root.appendChild(input); root.appendChild(status); root.appendChild(results);
  let worker = null;
  const stop = () => { if (worker) worker.terminate(); worker = null; };

  input.addEventListener('change', async () => {
    stop(); clear(results);
    const files = [...(input.files || [])];
    if (!files.length) { status.textContent = ''; return; }
    const tooLarge = files.find((file) => file.size > MAX_FILE_BYTES);
    if (tooLarge) { status.textContent = `${tooLarge.name} exceeds the 50 MB limit.`; return; }
    status.textContent = `Reading ${files.length.toLocaleString('en-US')} ${files.length === 1 ? 'file' : 'files'} locally...`;
    try {
      const payload = await Promise.all(files.map(async (file) => ({ name: file.name, buffer: await file.arrayBuffer() })));
      worker = new window.Worker(workerUrl, { type: 'module' });
      worker.addEventListener('error', () => { status.textContent = 'The remittance could not be read. Choose it again.'; stop(); });
      worker.addEventListener('message', (event) => {
        const message = event.data || {};
        if (message.type === 'error') { status.textContent = message.message; return; }
        if (message.type === 'download') {
          const url = window.URL.createObjectURL(message.blob); const anchor = el('a', { href: url, download: message.filename });
          anchor.click(); window.setTimeout(() => window.URL.revokeObjectURL(url), 0); return;
        }
        if (message.type !== 'parsed') return;
        const t = message.totals; const allClaims = t.balancedClaims === t.claims; const allPayments = t.balancedPayments === t.transactions;
        status.textContent = `${t.files.toLocaleString('en-US')} ${t.files === 1 ? 'file' : 'files'} read.`;
        resultRow(results, [
          { text: `${t.balancedClaims.toLocaleString('en-US')} of ${t.claims.toLocaleString('en-US')} claims balance; ${t.balancedPayments.toLocaleString('en-US')} of ${t.transactions.toLocaleString('en-US')} payments reconcile.`, cls: allClaims && allPayments ? null : 'warn' },
          { label: 'Patient responsibility', value: `$${(t.patientResponsibilityCents / 100).toFixed(2)}` },
        ]);
        results.appendChild(el('p', { class: 'muted', text: `${t.lines.toLocaleString('en-US')} service lines; ${t.balancedLines.toLocaleString('en-US')} balance. A claim residual includes its claim-level and service-line CAS adjustments.` }));
        const shown = message.preview.rows.length;
        results.appendChild(el('p', { class: 'muted', text: message.preview.total > shown ? `Showing the first ${shown} of ${message.preview.total} claims. Downloads include every claim.` : `Showing all ${shown} claims.` }));
        table(results, 'Remittance claims', message.preview.headers, message.preview.rows);
        for (const [flavor, label] of [['full', 'Download claims CSV'], ['redacted', 'Download redacted CSV']]) {
          const wrap = el('p'); const button = el('button', { type: 'button', text: label });
          button.addEventListener('click', () => worker.postMessage({ type: 'download', flavor }));
          wrap.appendChild(button); results.appendChild(wrap);
        }
        results.appendChild(el('p', { class: 'muted', text: 'Structural and arithmetic checks only. Raw X12 code values are shown without proprietary code-list descriptions.' }));
      });
      worker.postMessage({ type: 'parse', files: payload }, payload.map((file) => file.buffer));
    } catch (error) { status.textContent = error instanceof Error ? error.message : 'The remittance could not be read.'; stop(); }
  });
}

export const renderers = { 'x12-835-reader': reader835 };
