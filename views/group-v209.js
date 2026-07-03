// spec-v209 §2: renderers for the advanced cardiology risk-equation & prognosis
// instruments — HCM Risk-SCD, CHARGE-AF, and the 2019 ARVC model. Group G.
// Shipped one tile at a time. (mecki is already live from spec-v202; seattle-hf
// is deferred — neither is rendered here.)
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. The
// survival/logistic engines are finite-guarded and risk-clamped to [0,100]% in
// lib/cardiology-risk-v209.js. Per the spec-v50 §3 posture note each tile defers
// the ICD / device / anticoagulation decision to the cardiologist,
// electrophysiologist, and patient (spec-v11 §5.3) — these estimate risk, they
// do not order.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/cardiology-risk-v209.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The estimate is the cited model’s, computed from the inputs you enter. The ICD, device, anticoagulation, and disposition decisions stay with the cardiologist, the electrophysiologist, and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  // ----- 2.1 hcm-risk-scd ----------------------------------------------------
  'hcm-risk-scd'(root) {
    note(root, 'HCM Risk-SCD (O\'Mahony 2014): the ESC-endorsed 5-year sudden-cardiac-death risk estimator for hypertrophic cardiomyopathy. 5-year SCD probability = 1 − 0.998^exp(PI) from seven predictors. ESC bands: < 4% low, 4–6% intermediate, ≥ 6% high — informing the ICD discussion. Validated for age ≥ 16 without prior arrest/sustained VT, wall thickness < 35 mm, or prior ICD. Near-neighbors: maggic, mesa-chd.');
    root.appendChild(num('Age (years)', 'hcm-age', { min: '16' }));
    root.appendChild(num('Maximal LV wall thickness (mm)', 'hcm-mwt', { min: '5', max: '35' }));
    root.appendChild(num('Left-atrial diameter (mm)', 'hcm-la', { min: '20' }));
    root.appendChild(num('Maximal (rest/Valsalva) LVOT gradient (mmHg)', 'hcm-lvot', { min: '0' }));
    root.appendChild(checkField('Family history of sudden cardiac death', 'hcm-fhx'));
    root.appendChild(checkField('Non-sustained VT on Holter', 'hcm-nsvt'));
    root.appendChild(checkField('Unexplained syncope', 'hcm-syncope'));
    const o = out(); root.appendChild(o);
    const ids = ['hcm-age', 'hcm-mwt', 'hcm-la', 'hcm-lvot', 'hcm-fhx', 'hcm-nsvt', 'hcm-syncope'];
    wire(ids, () => safe(o, () => {
      const r = M.hcmRiskScd({
        age: val('hcm-age'), wallThickness: val('hcm-mwt'), laDiameter: val('hcm-la'), lvotGradient: val('hcm-lvot'),
        fhxScd: chk('hcm-fhx'), nsvt: chk('hcm-nsvt'), syncope: chk('hcm-syncope'),
      });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'HCM Risk-SCD', value: `${r.score}%` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 charge-af -------------------------------------------------------
  'charge-af'(root) {
    note(root, 'CHARGE-AF (Alonso 2013): a simple 5-year incident-atrial-fibrillation risk model from routine variables — age, race, height, weight, BP, smoking, antihypertensive use, diabetes, heart failure, and prior MI. Used to select patients for AF screening. Near-neighbors: cha2ds2-va, ascvd.');
    root.appendChild(num('Age (years)', 'charge-age', { min: '18' }));
    root.appendChild(num('Height (cm)', 'charge-height', { min: '100' }));
    root.appendChild(num('Weight (kg)', 'charge-weight', { min: '20' }));
    root.appendChild(num('Systolic BP (mmHg)', 'charge-sbp', { min: '60' }));
    root.appendChild(num('Diastolic BP (mmHg)', 'charge-dbp', { min: '30' }));
    root.appendChild(checkField('White race', 'charge-white'));
    root.appendChild(checkField('Current smoker', 'charge-smoker'));
    root.appendChild(checkField('Antihypertensive medication', 'charge-antihtn'));
    root.appendChild(checkField('Diabetes', 'charge-dm'));
    root.appendChild(checkField('Heart failure', 'charge-hf'));
    root.appendChild(checkField('Prior myocardial infarction', 'charge-mi'));
    const o = out(); root.appendChild(o);
    const ids = ['charge-age', 'charge-height', 'charge-weight', 'charge-sbp', 'charge-dbp', 'charge-white', 'charge-smoker', 'charge-antihtn', 'charge-dm', 'charge-hf', 'charge-mi'];
    wire(ids, () => safe(o, () => {
      const r = M.chargeAf({
        age: val('charge-age'), height: val('charge-height'), weight: val('charge-weight'), sbp: val('charge-sbp'), dbp: val('charge-dbp'),
        white: chk('charge-white'), smoker: chk('charge-smoker'), antiHtn: chk('charge-antihtn'), diabetes: chk('charge-dm'), heartFailure: chk('charge-hf'), mi: chk('charge-mi'),
      });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'CHARGE-AF', value: `${r.score}%` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },
};
