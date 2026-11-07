// spec-v1698: read a VCF in the browser without uploading it or loading it whole.
// vcf-variant-lookup, vcf-qc-summary. The reading runs in lib/vcf-worker.js; Stop terminates it.

import { el, clear } from '../lib/dom.js';
import { dropzone } from '../lib/components.js';
import { resultRow } from '../lib/result-copy.js';
import { renderReceipt } from './receipt.js';
import { acceptVia } from '../lib/hand-off.js';

const workerUrl = new URL('../lib/vcf-worker.js', import.meta.url);
const ACCEPT = '.vcf,.gz,.bgz,text/plain,text/x-vcf,application/gzip,application/x-gzip,application/octet-stream';

function textField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  // Every field here stays out of the share link: a sample name can name a person, and which variant someone
  // looks up in their own genome is health information (lib/private-fields.js).
  wrap.appendChild(el('input', { id, type: 'text', autocomplete: 'off', spellcheck: 'false', placeholder, 'data-private': '' }));
  root.appendChild(wrap);
}
const val = (id) => { const n = document.getElementById(id); return n ? n.value : ''; };
const mb = (n) => `${(n / 1048576).toLocaleString('en-US', { maximumFractionDigits: 1 })} MB`;

// One file reader: a dropzone, the fields, Read and Stop buttons, a status line and the result.
function vcfReader(root, { tool, prefix, fields, buttonText, autoRun, args }) {
  root.appendChild(el('p', { class: 'muted', text: 'The file is read in this tab, a piece at a time, and never uploaded. Plain .vcf and bgzipped .vcf.gz or .vcf.bgz files of any size are read; a large file shows its progress and can be stopped.' }));
  const input = el('input', { id: `${prefix}-file`, type: 'file', accept: ACCEPT });
  const wrap = el('p');
  wrap.appendChild(el('label', { for: input.id, text: 'Choose a VCF file' }));
  wrap.appendChild(el('br'));
  wrap.appendChild(dropzone(input));
  root.appendChild(wrap);
  for (const [label, id, placeholder] of fields) textField(root, label, id, placeholder);
  const actions = el('p');
  const run = el('button', { id: `${prefix}-run`, type: 'button', text: buttonText });
  const stop = el('button', { id: `${prefix}-stop`, type: 'button', text: 'Stop', disabled: 'disabled' });
  actions.appendChild(run);
  actions.appendChild(document.createTextNode(' '));
  actions.appendChild(stop);
  root.appendChild(actions);
  const status = el('p', { id: `${prefix}-status`, class: 'muted', role: 'status', 'aria-live': 'polite' });
  root.appendChild(status);
  const results = el('div', { id: 'q-results', 'aria-live': 'polite' });
  root.appendChild(results);

  let worker = null;
  const finish = () => { if (worker) worker.terminate(); worker = null; stop.disabled = true; run.disabled = false; };
  stop.addEventListener('click', () => { finish(); status.textContent = 'Stopped. Nothing was kept from the part that was read.'; });
  const start = () => {
    const file = input.files && input.files[0];
    clear(results);
    if (!file) { status.textContent = 'Choose a VCF file first.'; return; }
    finish();
    status.textContent = `Reading ${file.name}...`;
    run.disabled = true; stop.disabled = false;
    worker = new window.Worker(workerUrl, { type: 'module' });
    worker.addEventListener('error', () => { finish(); status.textContent = 'The file could not be read.'; });
    worker.addEventListener('message', (event) => {
      const m = event.data || {};
      if (m.type === 'progress') {
        status.textContent = `Reading ${file.name}: ${mb(m.bytesRead)} of ${mb(m.size)} (${Math.min(100, Math.round((m.bytesRead / Math.max(1, m.size)) * 100))}%).`;
        return;
      }
      finish();
      if (m.type === 'error') { status.textContent = m.message; return; }
      const r = m.result;
      if (!r.valid) { status.textContent = r.message; return; }
      status.textContent = `${file.name} read.`;
      resultRow(results, [{ text: r.band, cls: null }]);
      const ul = el('ul');
      for (const t of r.notes) ul.appendChild(el('li', { text: t }));
      results.appendChild(ul);
      renderReceipt(results, m);
    });
    worker.postMessage({ type: 'run', tool, file, ...args() });
  };
  run.addEventListener('click', start);
  input.addEventListener('change', () => { if (autoRun()) start(); else { clear(results); status.textContent = input.files && input.files[0] ? `${input.files[0].name} chosen.` : ''; } });
}

export const renderers = {
  'vcf-variant-lookup'(root) {
    vcfReader(root, {
      tool: 'vcf-variant-lookup', prefix: 'vcfl', buttonText: 'Look up',
      fields: [
        ['Chromosome, as the file writes it', 'vcfl-chrom', '20 or chr20'],
        ['Position (1-based)', 'vcfl-pos', '14370'],
        ['Reference allele (optional)', 'vcfl-ref', 'G'],
        ['Alternate allele (optional)', 'vcfl-alt', 'A'],
        ['Or an ID from the ID column, in place of a position', 'vcfl-id', 'rs6054257'],
        ['Sample name (blank: the first sample)', 'vcfl-sample', ''],
      ],
      autoRun: () => Boolean(val('vcfl-pos') || val('vcfl-id')),
      args: () => ({ query: { chrom: val('vcfl-chrom'), pos: val('vcfl-pos'), ref: val('vcfl-ref'), alt: val('vcfl-alt'), id: val('vcfl-id') }, sample: val('vcfl-sample') }),
    });
  },
  'vcf-qc-summary'(root) {
    vcfReader(root, {
      tool: 'vcf-qc-summary', prefix: 'vcfs', buttonText: 'Summarize',
      fields: [['Sample name (blank: the first sample)', 'vcfs-sample', '']],
      autoRun: () => true,
      args: () => ({ sample: val('vcfs-sample') }),
    });
  },
};

export const acceptFiles = {
  'vcf-variant-lookup': acceptVia('vcfl-file'),
  'vcf-qc-summary': acceptVia('vcfs-file'),
};
