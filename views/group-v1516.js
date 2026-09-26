// spec-v1516: renderers for denial-next-step.

import { el, clear } from '../lib/dom.js';
import * as DN from '../lib/denial-next-step-v1516.js';
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
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = DN.appealWorklist(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Worklist', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
