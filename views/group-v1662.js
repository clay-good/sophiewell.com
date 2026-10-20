// spec-v1662: T-MACS.

import { el, clear } from '../lib/dom.js';
import { resultRow } from '../lib/result-copy.js';
import * as TM from '../lib/t-macs-v1662.js';

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
function numField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: 'any', inputmode: 'decimal', placeholder }));
  root.appendChild(wrap);
}
function areaField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('textarea', { id, rows: '4', placeholder }));
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
function show(r, o) {
  if (!r.valid) { note(o, r.message); return; }
  resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Result', value: r.bandLabel }]);
  list(o, r.notes);
  note(o, r.note);
}
function tool(root, pairs, compute) {
  const o = out(); root.appendChild(o);
  wire(pairs.map(([d]) => d), () => safe(o, () => {
    const args = {};
    for (const [dom, arg] of pairs) args[arg] = val(dom);
    show(compute(args), o);
  }));
}

const YES_NO = [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }];

export const renderers = {
  't-macs'(root) {
    selectField(root, 'ECG ischaemia', 'tm-ecg', YES_NO);
    selectField(root, 'Worsening or crescendo angina', 'tm-angina', YES_NO);
    selectField(root, 'Pain radiating to the right arm or shoulder', 'tm-arm', YES_NO);
    selectField(root, 'Pain associated with vomiting', 'tm-vomit', YES_NO);
    selectField(root, 'Sweating observed', 'tm-sweat', YES_NO);
    selectField(root, 'Hypotension (systolic below 100 mm Hg)', 'tm-hypo', YES_NO);
    numField(root, 'High-sensitivity troponin T on arrival (ng/L)', 'tm-tnt', 'e.g. 12');
    tool(root, [['tm-ecg', 'ecg'], ['tm-angina', 'angina'], ['tm-arm', 'rightArm'], ['tm-vomit', 'vomiting'], ['tm-sweat', 'sweating'], ['tm-hypo', 'hypotension'], ['tm-tnt', 'troponinT']], TM.tMacs);
  },
};
