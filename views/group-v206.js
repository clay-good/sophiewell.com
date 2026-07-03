// spec-v206 §2: renderers for the traumatic brain injury & stroke prognosis
// instruments — Essen, Rotterdam CT, Marshall CT, FUNC, and iScore. Group G.
// Shipped one tile at a time.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. The
// point sums are bounded and finite-guarded in lib/tbi-stroke-v206.js. Per the
// spec-v50 §3 posture note each tile defers the neurosurgical / thrombolysis /
// anticoagulation / withdrawal-of-care decision to the clinician and the patient
// (spec-v11 §5.3) — these prognosticate and stratify, they do not order.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/tbi-stroke-v206.js';
import { resultRow } from '../lib/result-copy.js';

function field(label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, ...attrs }));
  return wrap;
}
function num(label, id, attrs = {}) {
  return field(label, id, { type: 'number', step: 'any', inputmode: 'decimal', ...attrs });
}
function selectField(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  for (const opt of options) sel.appendChild(el('option', { value: opt.value, text: opt.text }));
  wrap.appendChild(sel);
  return wrap;
}
function checkField(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function showInvalid(o, r) { note(o, r.message || 'Complete the remaining fields.'); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The score is the cited source’s, computed from the inputs you enter. The neurosurgical, thrombolysis, anticoagulation, and goals-of-care decisions stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  // ----- 2.5 essen-stroke-risk -----------------------------------------------
  'essen-stroke-risk'(root) {
    note(root, 'Essen Stroke Risk Score (Weimar 2009): a simple bedside score for recurrent vascular events after ischemic stroke / TIA. Age (< 65 → 0, 65–75 → 1, > 75 → 2) plus one point each for the vascular risk factors; total 0–9. Low risk < 3, high risk ≥ 3. Near-neighbors: abcd2, thrive-stroke.');
    root.appendChild(num('Age (years)', 'essen-age', { min: '0' }));
    root.appendChild(checkField('Hypertension (+1)', 'essen-htn'));
    root.appendChild(checkField('Diabetes mellitus (+1)', 'essen-dm'));
    root.appendChild(checkField('Prior myocardial infarction (+1)', 'essen-mi'));
    root.appendChild(checkField('Other CVD, except MI / AF (+1)', 'essen-cvd'));
    root.appendChild(checkField('Peripheral arterial disease (+1)', 'essen-pad'));
    root.appendChild(checkField('Current / ever smoker (+1)', 'essen-smoke'));
    root.appendChild(checkField('Additional prior TIA / ischemic stroke (+1)', 'essen-prior'));
    const o = out(); root.appendChild(o);
    const ids = ['essen-age', 'essen-htn', 'essen-dm', 'essen-mi', 'essen-cvd', 'essen-pad', 'essen-smoke', 'essen-prior'];
    wire(ids, () => safe(o, () => {
      const r = M.essenStroke({
        age: val('essen-age'), hypertension: chk('essen-htn'), diabetes: chk('essen-dm'), priorMi: chk('essen-mi'),
        otherCvd: chk('essen-cvd'), pad: chk('essen-pad'), smoker: chk('essen-smoke'), priorStroke: chk('essen-prior'),
      });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Essen', value: `${r.score}` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.1 rotterdam-ct ----------------------------------------------------
  'rotterdam-ct'(root) {
    note(root, 'Rotterdam CT score (Maas 2005): an additive head-CT prognostic scale — basal cisterns, midline shift, epidural mass (inverted), and intraventricular / traumatic SAH, plus 1 by convention; total 1–6. 6-month mortality rises from ≈ 5% at 1 to ≈ 61% at 6. Near-neighbors: gcs-pupils, four-score.');
    root.appendChild(selectField('Basal cisterns', 'rott-cist', [
      { value: 'normal', text: 'Normal (+0)' },
      { value: 'compressed', text: 'Compressed (+1)' },
      { value: 'absent', text: 'Absent (+2)' },
    ]));
    root.appendChild(checkField('Midline shift > 5 mm (+1)', 'rott-shift'));
    root.appendChild(checkField('Epidural mass lesion PRESENT (present scores 0; absent scores +1)', 'rott-edh'));
    root.appendChild(checkField('Intraventricular blood or traumatic SAH (+1)', 'rott-ivh'));
    const o = out(); root.appendChild(o);
    const ids = ['rott-cist', 'rott-shift', 'rott-edh', 'rott-ivh'];
    wire(ids, () => safe(o, () => {
      const r = M.rotterdamCt({ cisterns: val('rott-cist'), shiftOver5: chk('rott-shift'), epiduralPresent: chk('rott-edh'), ivhOrSah: chk('rott-ivh') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Rotterdam', value: `${r.score}` }, { label: 'Mortality', value: `${r.mortality}%` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },
};
