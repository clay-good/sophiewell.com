// spec-v214 §2: renderers for the cardiology risk scores — APPLE, CAAP-AF,
// ATLAS, HATCH, MB-LATER (AF ablation / progression) and the Canada ACS and
// ACTION ICU acute-coronary scores. Group G.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the ablation / admission / treatment
// decision to the clinician and the patient (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/cardiology-risk-v214.js';
import { resultRow } from '../lib/result-copy.js';

function num(label, id, attrs = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: 'any', inputmode: 'decimal', ...attrs }));
  return wrap;
}
function check(label, id) {
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
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The ablation, admission, and treatment decisions stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
// Build a checkbox-only tile: fields = [[domId, key, label], ...]
function boolTile(root, intro, fields, compute, valueLabel, nums = []) {
  note(root, intro);
  for (const [id, , label] of nums) root.appendChild(num(label, id));
  for (const [id, , label] of fields) root.appendChild(check(label, id));
  const o = out(); root.appendChild(o);
  const ids = [...nums.map((f) => f[0]), ...fields.map((f) => f[0])];
  wire(ids, () => safe(o, () => {
    const inp = {};
    for (const [id, key] of nums) inp[key] = val(id);
    for (const [id, key] of fields) inp[key] = chk(id);
    const r = compute(inp);
    if (!r.valid) { note(o, r.message || 'Complete the fields.'); return; }
    resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: valueLabel, value: `${r.score}` }]);
    note(o, r.detail); note(o, r.note);
  }));
  postureNote(root);
}

export const renderers = {
  'apple-score'(root) {
    boolTile(root, 'APPLE score (Kornej 2015): one point each for age > 65, persistent AF, impaired eGFR < 60, LA diameter >= 43 mm, EF < 50% (0-5). Higher = higher AF recurrence after ablation. Near-neighbors: cha2ds2-va, hatch-score.', [
      ['apl-age', 'ageOver65', 'Age > 65 years (+1)'],
      ['apl-pers', 'persistentAf', 'Persistent AF (+1)'],
      ['apl-egfr', 'egfrLow', 'Impaired eGFR < 60 mL/min/1.73m2 (+1)'],
      ['apl-la', 'laDilated', 'LA diameter >= 43 mm (+1)'],
      ['apl-ef', 'efLow', 'Ejection fraction < 50% (+1)'],
    ], M.apple, 'APPLE');
  },
  'caap-af-score'(root) {
    boolTile(root, 'CAAP-AF score (Winkle 2016): CAD, LA diameter band, age band, persistent AF, failed-AAD band, female (0-13). Higher = lower freedom from AF after ablation; >= 5 elevated. Near-neighbors: apple-score, atlas-score.', [
      ['caap-cad', 'cad', 'Coronary artery disease (+1)'],
      ['caap-pers', 'persistentAf', 'Persistent / long-standing persistent AF (+2)'],
      ['caap-female', 'female', 'Female sex (+1)'],
    ], M.caapAf, 'CAAP-AF', [
      ['caap-la', 'laDiameter', 'Left-atrial diameter (cm)'],
      ['caap-age', 'age', 'Age (years)'],
      ['caap-aad', 'failedAad', 'Number of failed antiarrhythmic drugs'],
    ]);
  },
  'atlas-score'(root) {
    boolTile(root, 'ATLAS score (Mesquita 2018): age > 60, non-paroxysmal AF, indexed LA volume (+1/10 mL/m2), female (+4), current smoking (+7). Low < 6, intermediate 6-10, high > 10. Near-neighbors: apple-score, la-volume-index.', [
      ['atl-age', 'ageOver60', 'Age > 60 years (+1)'],
      ['atl-np', 'nonParoxysmal', 'Non-paroxysmal AF (+2)'],
      ['atl-female', 'female', 'Female sex (+4)'],
      ['atl-smoke', 'smoking', 'Current smoking (+7)'],
    ], M.atlas, 'ATLAS', [
      ['atl-lavi', 'laVolumeIndex', 'Indexed LA volume (mL/m2)'],
    ]);
  },
  'hatch-score'(root) {
    boolTile(root, 'HATCH score (de Vos 2010): hypertension, age > 75, TIA/stroke (+2), COPD, heart failure (+2) (0-7). Higher = higher progression from paroxysmal to persistent AF. Near-neighbors: cha2ds2-va, apple-score.', [
      ['htc-htn', 'hypertension', 'Hypertension (+1)'],
      ['htc-age', 'ageOver75', 'Age > 75 years (+1)'],
      ['htc-stroke', 'strokeTia', 'TIA or stroke (+2)'],
      ['htc-copd', 'copd', 'COPD (+1)'],
      ['htc-hf', 'heartFailure', 'Heart failure (+2)'],
    ], M.hatch, 'HATCH');
  },
  'mb-later-score'(root) {
    boolTile(root, 'MB-LATER score (Mujovic 2017): male, bundle-branch block, LA >= 47 mm, AF type (0 paroxysmal / 1 persistent / 2 long-standing), early recurrence < 3 mo (0-6). >= 2 predicts very-late recurrence. Near-neighbors: apple-score, caap-af-score.', [
      ['mbl-male', 'male', 'Male sex (+1)'],
      ['mbl-bbb', 'bbb', 'Bundle-branch block (+1)'],
      ['mbl-la', 'laLarge', 'Left atrium >= 47 mm (+1)'],
      ['mbl-er', 'earlyRecurrence', 'Early AF recurrence within 3 months (+1)'],
    ], M.mbLater, 'MB-LATER', [
      ['mbl-type', 'afType', 'AF type (0 = paroxysmal, 1 = persistent, 2 = long-standing persistent)'],
    ]);
  },
  'canada-acs-risk-score'(root) {
    boolTile(root, 'Canada ACS (C-ACS) risk score (Huynh 2013): age >= 75, Killip > 1, SBP < 100, HR > 100 (0-4). Rising score = higher in-hospital mortality across the ACS spectrum. Near-neighbors: grace, timi.', [
      ['cacs-age', 'ageOver75', 'Age >= 75 years (+1)'],
      ['cacs-killip', 'killipOver1', 'Killip class > 1 (+1)'],
      ['cacs-sbp', 'sbpLow', 'Systolic BP < 100 mmHg (+1)'],
      ['cacs-hr', 'hrHigh', 'Heart rate > 100 bpm (+1)'],
    ], M.canadaAcs, 'C-ACS');
  },
  'action-icu-score'(root) {
    boolTile(root, 'ACTION ICU score (Fanaroff 2018): age, HR band, SBP band, creatinine, troponin, heart failure (+5), ST depression, no prior revascularization, chronic lung disease (0-20). Predicts complications needing critical care in NSTEMI. Near-neighbors: grace, timi.', [
      ['aic-age', 'ageOver70', 'Age >= 70 years (+1)'],
      ['aic-cr', 'creatHigh', 'Creatinine >= 1.1 mg/dL (+1)'],
      ['aic-trop', 'tropHigh', 'Initial troponin / ULN >= 12 (+2)'],
      ['aic-hf', 'heartFailure', 'Signs/symptoms of heart failure (+5)'],
      ['aic-st', 'stDepression', 'ST-segment depression (+1)'],
      ['aic-revasc', 'noPriorRevasc', 'No prior revascularization (+1)'],
      ['aic-lung', 'lungDisease', 'Chronic lung disease (+2)'],
    ], M.actionIcu, 'ACTION ICU', [
      ['aic-hr', 'heartRate', 'Heart rate (bpm)'],
      ['aic-sbp', 'sbp', 'Systolic BP (mmHg)'],
    ]);
  },
};
