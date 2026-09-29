// spec-v1604: renderers for dpc-hsa-check.

import { el, clear } from '../lib/dom.js';
import * as DP from '../lib/dpc-hsa-check.js';
import { resultRow } from '../lib/result-copy.js';

const NA = { value: '', text: '— choose —' };
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

export const renderers = {
  'dpc-hsa-check'(root) {
    const pairs = [['dpc-year', 'year'], ['dpc-covers', 'covers'], ['dpc-period', 'period'], ['dpc-fee', 'fee'], ['dpc-prac', 'practitioners'], ['dpc-fixed', 'fixedFee'], ['dpc-anes', 'anesthesia'], ['dpc-drugs', 'drugs'], ['dpc-labs', 'labs'], ['dpc-payer', 'payer'], ['dpc-limit', 'limit']];
    numField(root, 'Year', 'dpc-year', 'e.g. 2026', '2100', '1');
    selectField(root, 'The arrangement covers', 'dpc-covers', DP.COVERS);
    selectField(root, 'The fee is billed every', 'dpc-period', DP.PERIODS);
    numField(root, 'Fee for that period, dollars (all your direct primary care arrangements together)', 'dpc-fee', 'e.g. 120', '1000000', '0.01');
    selectField(root, 'Is the care given only by primary care physicians, nurse practitioners, clinical nurse specialists or physician assistants?', 'dpc-prac', DP.YES_NO);
    selectField(root, 'Is the fee the only charge for its services (nothing billed to you or your insurance on top)?', 'dpc-fixed', DP.YES_NO);
    selectField(root, 'Does it include procedures that need general anesthesia?', 'dpc-anes', DP.YES_NO);
    selectField(root, 'Does it include prescription drugs other than vaccines?', 'dpc-drugs', DP.YES_NO);
    selectField(root, 'Does it include lab services beyond what an office primary care practice does?', 'dpc-labs', DP.YES_NO);
    selectField(root, 'Who pays the fee? (optional)', 'dpc-payer', DP.PAYERS);
    numField(root, 'Monthly limit for a year not listed, dollars (optional)', 'dpc-limit', 'e.g. 150', '10000', '0.01');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = DP.dpcHsaCheck(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'HSA', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
