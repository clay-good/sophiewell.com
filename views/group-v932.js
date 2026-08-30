// spec-v932 §2: renderer for hepatic-iron-index (Clinical Scoring & Risk, Group G).
//
// The unit line prints on every result, naming which unit was used and what the other would
// have given, because a microgram figure read as micromolar overstates the index fifty-six-fold.
//
// The select is written as `'hii-unit', H.CONCENTRATION_UNIT_OPTIONS` so that
// scripts/lib/option-labels.mjs, which reads views statically, resolves the option text.

import { el, clear } from '../lib/dom.js';
import * as H from '../lib/hepatic-iron-index-v932.js';
import { resultRow } from '../lib/result-copy.js';

function numField(root, label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: 'any', inputmode: 'decimal' }));
  root.appendChild(wrap);
}
function selectField(root, label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  const sel = el('select', { id });
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  root.appendChild(wrap);
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
  'hepatic-iron-index'(root) {
    numField(root, 'Hepatic iron concentration, dry weight', 'hii-conc');
    selectField(root, 'Unit the laboratory reported it in', 'hii-unit', H.CONCENTRATION_UNIT_OPTIONS);
    numField(root, 'Age (years)', 'hii-age');

    const ids = ['hii-conc', 'hii-unit', 'hii-age'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = H.hepaticIronIndex({
        hepaticIronConcentration: val('hii-conc'),
        concentrationUnit: val('hii-unit'),
        ageYears: val('hii-age'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      note(o, r.unitNote);
      note(o, r.ageNote);
      note(o, r.supersededNote);
      note(o, r.biopsyNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This divides one measured number by another. It does not diagnose hemochromatosis, and it does not replace genotyping.' }));
  },
};
