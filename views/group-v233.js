// spec-v233 §2: renderers for the quantitative bedside estimators — the Evans
// index, the frontal-occipital horn ratio, the age-adjusted D-dimer threshold, and
// the Deurenberg body-fat estimate. Group G.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the diagnosis and treatment to the
// clinician and the patient (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/estimators-v233.js';
import { resultRow } from '../lib/result-copy.js';

function num(label, id, attrs = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: 'any', inputmode: 'decimal', ...attrs }));
  return wrap;
}
function select(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const [value, text] of options) s.appendChild(el('option', { value, text }));
  wrap.appendChild(s);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The diagnosis and treatment stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function render(o, r, valueLabel) {
  if (!r.valid) { note(o, r.message || 'Complete the fields.'); return; }
  resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: valueLabel, value: `${r.score}` }]);
  note(o, r.detail); note(o, r.note);
}

export const renderers = {
  'evans-index'(root) {
    note(root, 'Evans index = frontal-horn width / inner-skull (biparietal) diameter on the same axial slice. Normal <= 0.25, borderline 0.25-0.30, > 0.30 ventricular enlargement. Near-neighbors: fohr.');
    root.appendChild(num('Maximum frontal-horn width (mm)', 'ev-frontal', { min: '0' }));
    root.appendChild(num('Maximum inner-skull (biparietal) diameter (mm)', 'ev-skull', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['ev-frontal', 'ev-skull'], () => safe(o, () => {
      render(o, M.evansIndex({ frontal: val('ev-frontal'), skull: val('ev-skull') }), 'Evans');
    }));
    postureNote(root);
  },
  'fohr'(root) {
    note(root, 'Frontal-occipital horn ratio = (frontal-horn + occipital-horn width) / (2 x biparietal diameter). Normal mean 0.37; >= 0.55 clinically significant ventriculomegaly. Near-neighbors: evans-index.');
    root.appendChild(num('Maximum frontal-horn width (mm)', 'fo-frontal', { min: '0' }));
    root.appendChild(num('Maximum occipital-horn width (mm)', 'fo-occipital', { min: '0' }));
    root.appendChild(num('Biparietal diameter (mm)', 'fo-bpd', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['fo-frontal', 'fo-occipital', 'fo-bpd'], () => safe(o, () => {
      render(o, M.fohr({ frontal: val('fo-frontal'), occipital: val('fo-occipital'), bpd: val('fo-bpd') }), 'FOHR');
    }));
    postureNote(root);
  },
  'age-adjusted-d-dimer'(root) {
    note(root, 'Age-adjusted D-dimer (ADJUST-PE, JAMA 2014): cutoff = 500 ug/L up to age 50, else age x 10 ug/L. Use only with a non-high pretest probability. Near-neighbors: wells-pe-geneva.');
    root.appendChild(num('Age (years)', 'add-age', { min: '0' }));
    root.appendChild(num('D-dimer (ug/L FEU)', 'add-dd', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['add-age', 'add-dd'], () => safe(o, () => {
      render(o, M.ageAdjustedDDimer({ age: val('add-age'), ddimer: val('add-dd') }), 'Cutoff');
    }));
    postureNote(root);
  },
  'deurenberg-body-fat'(root) {
    note(root, 'Deurenberg body-fat % (Br J Nutr 1991) = 1.20 x BMI + 0.23 x age - 10.8 x sex - 5.4 (male = 1, female = 0). Categories per ACE. A BMI-based estimate, not a measured composition. Near-neighbors: bmi.');
    root.appendChild(num('BMI (kg/m^2)', 'db-bmi', { min: '0' }));
    root.appendChild(num('Age (years)', 'db-age', { min: '0' }));
    root.appendChild(select('Sex', 'db-sex', [['male', 'Male'], ['female', 'Female']]));
    const o = out(); root.appendChild(o);
    wire(['db-bmi', 'db-age', 'db-sex'], () => safe(o, () => {
      render(o, M.deurenberg({ bmi: val('db-bmi'), age: val('db-age'), sex: val('db-sex') }), 'Body fat %');
    }));
    postureNote(root);
  },
};
