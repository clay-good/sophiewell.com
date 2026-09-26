// spec-v1513: renderers for mpr-gap-days, med-sync-plan.

import { el, clear } from '../lib/dom.js';
import * as AD from '../lib/adherence-v1513.js';
import { resultRow } from '../lib/result-copy.js';

function textareaField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('textarea', { id, rows: '6', autocomplete: 'off', placeholder }));
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
  'mpr-gap-days'(root) {
    const pairs = [['mpr-fills', 'fills'], ['mpr-start', 'periodStart'], ['mpr-end', 'periodEnd'], ['mpr-gap', 'gapDays']];
    textareaField(root, 'Fills of one drug, one per line: fill date, days supply', 'mpr-fills', '2026-01-05, 30');
    dateInput(root, 'Period start (blank for the first fill)', 'mpr-start', 'date');
    dateInput(root, 'Period end (blank for December 31)', 'mpr-end', 'date');
    numField(root, 'List gaps longer than this many days (optional)', 'mpr-gap', 'e.g. 7', '365', '1');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = AD.mprGapDays(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Adherence', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  'med-sync-plan'(root) {
    const pairs = [['sync-meds', 'meds'], ['sync-date', 'syncDate']];
    textareaField(root, 'Medications, one per line: name, last fill date, days supply, units a day', 'sync-meds', 'lisinopril 10 mg, 2026-09-20, 30, 1');
    dateInput(root, 'Sync date (blank for the earliest practical)', 'sync-date', 'date');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = AD.medSyncPlan(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: null }, { label: 'Sync', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
