// spec-v1453: renderer for max-ich (Clinical Scoring & Risk, Group G).
//
// Each select is written as `'dom-id', CONST` so scripts/lib/option-labels.mjs, which reads views
// statically, resolves the option text for the tool page.

import { el, clear } from '../lib/dom.js';
import * as MI from '../lib/max-ich-v1453.js';
import { resultRow } from '../lib/result-copy.js';

function selectField(root, label, id, options, blankText) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  sel.appendChild(el('option', { value: '', text: blankText }));
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  root.appendChild(wrap);
}
function numField(root, label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: 'any', min: '0', inputmode: 'decimal' }));
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

const NA = '-- not entered --';

export const renderers = {
  'max-ich'(root) {
    note(root, 'From the admission examination and the first CT of a spontaneous intracerebral hemorrhage.');
    numField(root, 'NIHSS score (0 to 42)', 'mich-nihss');
    numField(root, 'Age (years)', 'mich-age');
    selectField(root, 'Hematoma location', 'mich-location', MI.MICH_LOCATION, NA);
    numField(root, 'Hematoma volume (mL)', 'mich-volume');
    selectField(root, 'Intraventricular hemorrhage', 'mich-ivh', MI.MICH_YESNO, NA);
    selectField(root, 'Taking oral anticoagulation', 'mich-oac', MI.MICH_YESNO, NA);
    const ids = ['mich-nihss', 'mich-age', 'mich-location', 'mich-volume', 'mich-ivh', 'mich-oac'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = MI.maxIch({
        nihss: val('mich-nihss'), age: val('mich-age'), location: val('mich-location'),
        volume: val('mich-volume'), ivh: val('mich-ivh'), oac: val('mich-oac'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'max-ICH score', value: r.bandLabel },
      ]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
