// spec-v779 §2: renderer for schofield — the Schofield basal metabolic rate equations
// (Clinical Math & Conversions, Group E).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. A closed-form
// arithmetic compute over finite-checked inputs; a blank weight or age surfaces a
// complete-the-fields fallback rather than scoring NaN.
//
// Weight uses the shared kg|lb toggle (canonical kg first, so the documented example
// reproduces byte-identically).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/schofield-v779.js';
import { resultRow } from '../lib/result-copy.js';
import { unitField, unitNumOpt, WEIGHT_UNITS } from '../lib/field-units.js';

function selectField(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  return wrap;
}
function numField(label, id, opts = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: 'number', autocomplete: 'off' });
  inp.setAttribute('step', opts.step || '1');
  inp.setAttribute('inputmode', 'numeric');
  if (opts.min != null) inp.setAttribute('min', String(opts.min));
  if (opts.max != null) inp.setAttribute('max', String(opts.max));
  if (opts.placeholder) inp.setAttribute('placeholder', opts.placeholder);
  wrap.appendChild(inp);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function selVal(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function optNum(id) { const n = document.getElementById(id); return n && n.value !== '' ? Number(n.value) : null; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This is a regression estimate of the basal rate with a known error against indirect calorimetry, not a measured value. Activity, stress and injury factors and the energy prescription stay with the dietitian and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const SEX = [
  { value: 'male', text: 'Male' },
  { value: 'female', text: 'Female' },
];

export const renderers = {
  schofield(root) {
    note(root, 'Schofield (1985), the FAO, WHO and UNU reference standard: basal metabolic rate from weight alone, with a different coefficient and constant for each sex and each of six age bands. No height needed. Bands are closed at the bottom and open at the top, so an age of exactly 30 uses the 30-to-60 equation.');
    root.appendChild(unitField('Weight', 'schof-wt', WEIGHT_UNITS, { placeholder: 'e.g. 70' }));
    root.appendChild(numField('Age (years)', 'schof-age', { min: 0, max: 120, placeholder: 'e.g. 40' }));
    root.appendChild(selectField('Sex', 'schof-sex', SEX));
    const o = out(); root.appendChild(o);
    wire(['schof-wt', 'schof-wt-unit', 'schof-age', 'schof-sex'], () => safe(o, () => {
      const r = M.schofield({ weight: unitNumOpt('schof-wt'), age: optNum('schof-age'), sex: selVal('schof-sex') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'BMR', value: `${r.bmr} kcal/day` },
        { label: 'Age band', value: r.ageBand },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
