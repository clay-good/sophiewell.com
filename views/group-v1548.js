// spec-v1548: renderer for wasting-classify -- severe or moderate acute malnutrition in a child 6 to 59
// months by MUAC, WHZ and edema, WHO 2023 (Pediatrics & Neonatal, Group N; field-health program, spec-v1540).

import { el, clear } from '../lib/dom.js';
import * as W from '../lib/wasting-classify-v1548.js';
import { resultRow } from '../lib/result-copy.js';

const NA = { value: '', text: '— choose —' };
function selectField(root, label, id, options, { blank = true, selected } = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const opt of [...(blank ? [NA] : []), ...options]) s.appendChild(el('option', { value: opt.value, text: opt.text }));
  if (selected) s.value = selected;
  wrap.appendChild(s);
  root.appendChild(wrap);
}
function numField(root, label, id, placeholder, max, step, min = '0') {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', inputmode: 'decimal', min, max, step, placeholder }));
  root.appendChild(wrap);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function list(root, items) {
  if (!items || !items.length) return;
  const ul = el('ul');
  for (const t of items) ul.appendChild(el('li', { text: t }));
  root.appendChild(ul);
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'wasting-classify'(root) {
    const pairs = [['wc-age', 'ageMonths'], ['wc-edema', 'edema'], ['wc-muac', 'muac'], ['wc-muac-unit', 'muacUnit'], ['wc-whz', 'whz']];
    numField(root, 'Age in months (6 to 59)', 'wc-age', 'e.g. 18', '59', '1');
    selectField(root, 'Edema of both feet', 'wc-edema', W.EDEMA);
    numField(root, 'MUAC (mid-upper arm circumference)', 'wc-muac', 'e.g. 118', '250', 'any');
    selectField(root, 'MUAC unit', 'wc-muac-unit', W.MUAC_UNITS, { blank: false, selected: 'mm' });
    numField(root, 'Weight-for-height (or weight-for-length) z-score', 'wc-whz', 'e.g. -2.4', '5', 'any', '-6');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = W.wastingClassify(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'WHO 2023', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
