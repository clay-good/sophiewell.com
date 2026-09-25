// spec-v1471: renderer for gmi (beside eag-a1c).
//
// The unit select is written as `'dom-id', CONST` so scripts/lib/option-labels.mjs, which reads views
// statically, resolves the option text for the tool page. It opens on mg/dL, the US unit.

import { el, clear } from '../lib/dom.js';
import * as GM from '../lib/gmi-v1471.js';
import { resultRow } from '../lib/result-copy.js';

function selectField(root, label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  root.appendChild(wrap);
}
function numField(root, label, id, placeholder, min, max) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: 'any', min, max, inputmode: 'decimal', placeholder }));
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
  'gmi'(root) {
    // The mean's min/max span both units (2.2 mmol/L to 600 mg/dL); the library applies each unit's own range.
    numField(root, 'Mean glucose from the CGM report', 'gmi-mean', 'e.g. 150', '2.2', '600');
    selectField(root, 'Glucose unit', 'gmi-unit', GM.GMI_UNITS);
    numField(root, 'Days of wear (optional)', 'gmi-days', 'e.g. 14', '1', '90');
    numField(root, 'Percent of time the CGM was active (optional)', 'gmi-active', 'e.g. 85', '1', '100');
    const ids = ['gmi-mean', 'gmi-unit', 'gmi-days', 'gmi-active'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = GM.gmi({ mean: val('gmi-mean'), unit: val('gmi-unit'), days: val('gmi-days'), active: val('gmi-active') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'GMI', value: r.bandLabel },
      ]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
