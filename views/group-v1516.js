// spec-v1516: renderers for denial-next-step.

import { el, clear } from '../lib/dom.js';
import * as DN from '../lib/denial-next-step-v1516.js';
import { resultRow } from '../lib/result-copy.js';
import { MAX_FILE_BYTES } from '../lib/upload-intake.js';
import { uploadWorkbench } from './upload-workbench.js';

const NA = { value: '', text: '— choose —' };
const analysisWorkerUrl = new URL('../lib/remittance-analysis-worker.js', import.meta.url);
const APPEAL_FIELDS = [
  { id: 'reference', label: 'Claim reference', required: true, sensitive: true, synonyms: ['claim reference', 'claim id', 'patient account'] },
  { id: 'payer', label: 'Payer type', required: true, synonyms: ['payer'] },
  { id: 'denial_date', label: 'Denial date', required: true, synonyms: ['remittance date', 'denial date'] },
  { id: 'amount', label: 'Amount', required: true, synonyms: ['denied amount', 'adjusted amount'] },
  { id: 'window_days', label: 'Window days', required: false, synonyms: ['appeal window', 'appeal days'] },
];
function selectField(root, label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const opt of [NA, ...options]) s.appendChild(el('option', { value: opt.value, text: opt.text }));
  wrap.appendChild(s);
  root.appendChild(wrap);
}
function numField(root, label, id, placeholder, max, step) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', max, step, inputmode: 'decimal', placeholder }));
  root.appendChild(wrap);
}
function dateInput(root, label, id, type) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type }));
  root.appendChild(wrap);
}
function textareaField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('textarea', { id, rows: '6', autocomplete: 'off', placeholder }));
  root.appendChild(wrap);
}
function list(root, items) {
  if (!items || !items.length) return;
  const ul = el('ul');
  for (const t of items) ul.appendChild(el('li', { text: t }));
  root.appendChild(ul);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

function resultTable(root, preview) {
  if (!preview.rows.length) return;
  const wrap = el('div', { class: 'upload-mapping-scroll' }); const table = el('table', { class: 'upload-mapping-table' });
  table.appendChild(el('caption', { text: preview.total > preview.rows.length ? `First ${preview.rows.length} of ${preview.total} appeal candidates` : 'Appeal candidates' }));
  table.appendChild(el('thead', null, [el('tr', null, preview.headers.map((header) => el('th', { scope: 'col', text: header })))]));
  const body = el('tbody');
  preview.rows.forEach((values) => body.appendChild(el('tr', null, values.map((value) => el('td', { text: String(value) })))));
  table.appendChild(body); wrap.appendChild(table); root.appendChild(wrap);
}

function appeal835(root, show) {
  root.appendChild(el('hr'));
  root.appendChild(el('p', { class: 'notice', text: 'Or choose one or more 835 files. Only positive authorization, medical-necessity and timely-filing adjustments enter the worklist. Files stay in this tab.' }));
  const input = el('input', { id: 'aw-835-files', type: 'file', multiple: true, accept: '.835,.txt,text/plain,application/octet-stream' });
  const status = el('p', { id: 'aw-835-status', class: 'muted', role: 'status', 'aria-live': 'polite' });
  const mapping = el('div', { id: 'aw-835-mapping', hidden: true }); const results = el('div', { id: 'aw-835-results', 'aria-live': 'polite' });
  root.appendChild(el('label', { for: 'aw-835-files', text: 'Choose 835 remittance files' })); root.appendChild(input); root.appendChild(status); root.appendChild(mapping); root.appendChild(results);
  let worker = null;
  const download = (message) => { const url = window.URL.createObjectURL(message.blob); const anchor = el('a', { href: url, download: message.filename }); anchor.click(); window.setTimeout(() => window.URL.revokeObjectURL(url), 0); };
  input.addEventListener('change', async () => {
    if (worker) worker.terminate(); clear(mapping); clear(results); mapping.hidden = true;
    const files = [...(input.files || [])]; if (!files.length) return;
    if (files.some((file) => file.size > MAX_FILE_BYTES)) { status.textContent = 'Each file must be 50 MB or smaller.'; return; }
    status.textContent = 'Reading the remittances locally...';
    const payload = await Promise.all(files.map(async (file) => ({ name: file.name, buffer: await file.arrayBuffer() })));
    worker = new window.Worker(analysisWorkerUrl, { type: 'module' });
    worker.addEventListener('error', () => { status.textContent = 'The remittances could not be analyzed.'; });
    worker.addEventListener('message', (event) => {
      const message = event.data || {};
      if (message.type === 'error') { status.textContent = message.message; return; }
      if (message.type === 'download') { download(message); return; }
      if (message.type === 'appeal-payers') {
        if (!message.claimCount) { worker.postMessage({ type: 'map-appeal-payers', mapping: {}, asOf: val('aw-asof') }); return; }
        mapping.hidden = false; clear(mapping);
        mapping.appendChild(el('p', { text: `${message.claimCount.toLocaleString('en-US')} appeal ${message.claimCount === 1 ? 'candidate needs' : 'candidates need'} payer rules. The 835 payer name does not identify the plan type.` }));
        for (const [index, payerName] of message.payers.entries()) {
          const row = el('fieldset'); row.appendChild(el('legend', { text: payerName }));
          const select = el('select', { id: `aw-835-payer-${index}`, 'data-payer-name': payerName, 'aria-label': `Payer type for ${payerName}` });
          select.appendChild(el('option', { value: '', text: 'Choose payer type' })); DN.PAYERS.forEach((payer) => select.appendChild(el('option', { value: payer.value, text: payer.text })));
          row.appendChild(select); row.appendChild(el('label', { for: `aw-835-window-${index}`, text: ' Window days for Medicaid or other: ' }));
          row.appendChild(el('input', { id: `aw-835-window-${index}`, type: 'number', min: '1', max: '730', step: '1', inputmode: 'numeric' })); mapping.appendChild(row);
        }
        const use = el('button', { type: 'button', text: `Build worklist for ${message.claimCount.toLocaleString('en-US')} ${message.claimCount === 1 ? 'claim' : 'claims'}` });
        use.addEventListener('click', () => worker.postMessage({
          type: 'map-appeal-payers', asOf: val('aw-asof'),
          mapping: Object.fromEntries(message.payers.map((payerName, index) => [payerName, { payer: val(`aw-835-payer-${index}`), windowDays: val(`aw-835-window-${index}`) }])),
        }));
        mapping.appendChild(use); status.textContent = 'Choose the payer type for each 835 payer name.'; return;
      }
      if (message.type !== 'appeal-result') return;
      mapping.hidden = true; clear(results); show(message.result); status.textContent = `${message.preview.total.toLocaleString('en-US')} appeal ${message.preview.total === 1 ? 'candidate is' : 'candidates are'} in the worklist.`;
      resultTable(results, message.preview);
      if (message.preview.total) for (const [flavor, label] of [['full', 'Download 835 worklist CSV'], ['redacted', 'Download redacted 835 worklist CSV']]) {
        const button = el('button', { type: 'button', text: label }); button.addEventListener('click', () => worker.postMessage({ type: 'download', flavor })); results.appendChild(el('p', null, [button]));
      }
    });
    worker.postMessage({ type: 'parse-remittances', tool: 'appeal-worklist', files: payload }, payload.map((file) => file.buffer));
  });
}

export const renderers = {
  'denial-next-step'(root) {
    const pairs = [['dn-group', 'group'], ['dn-carc', 'carc'], ['dn-payer', 'payer'], ['dn-remit', 'remitDate'], ['dn-dos', 'serviceDate'], ['dn-window', 'windowDays']];
    selectField(root, 'Group code', 'dn-group', DN.GROUPS);
    numField(root, 'Claim adjustment reason code (the number)', 'dn-carc', 'e.g. 50', '999', '1');
    selectField(root, 'Payer type', 'dn-payer', DN.PAYERS);
    dateInput(root, 'Remittance date', 'dn-remit', 'date');
    dateInput(root, 'Date of service (optional)', 'dn-dos', 'date');
    numField(root, 'Appeal window in days, for Medicaid or other payers (optional)', 'dn-window', 'e.g. 90', '730', '1');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = DN.denialNextStep(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Category', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  'appeal-worklist'(root) {
    const pairs = [['aw-claims', 'claims'], ['aw-asof', 'asOf']];
    note(root, 'One denied claim per line: reference, payer type (medicare, ma, partd, medicaid, employer, marketplace or other), denial date, amount, and for medicaid or other the appeal window in days.');
    textareaField(root, 'Denied claims', 'aw-claims', 'C-100, medicare, 2026-08-01, 1200');
    dateInput(root, 'As of (blank for today)', 'aw-asof', 'date');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    const show = (r) => {
      clear(o);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Worklist', value: r.bandLabel }]);
      list(o, r.notes); note(o, r.note);
    };
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(DN.appealWorklist(args));
    }));
    uploadWorkbench(root, {
      id: 'aw-upload', fields: APPEAL_FIELDS, label: 'Run a claim CSV or TSV', compute: 'appeal-worklist',
      getInput: () => ({ asOf: val('aw-asof') }), onResult: show,
    });
    appeal835(root, show);
  },
};
