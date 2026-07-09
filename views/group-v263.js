// spec-v263 §2: renderers for the respiratory & maternal acute-risk instruments — the
// MuLBSTA viral-pneumonia score, the Ottawa COPD Risk Scale, and the Sepsis in
// Obstetrics Score (SOS). Group G.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the admission, transfer, discharge, and
// prescribing decision to the clinician and the patient (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/respiratory-maternal-v263.js';
import { resultRow } from '../lib/result-copy.js';

function check(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
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
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The admission, transfer, and treatment decisions stay with the clinician and the patient.' }));
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
  'mulbsta'(root) {
    note(root, 'MuLBSTA score (Guo 2019): 90-day mortality in viral pneumonia. Max 20; >= 12 = high risk. Near-neighbors: curb-65, psi, a-drop.');
    root.appendChild(check('Multilobular infiltrate (>= 2 lobes) (+5)', 'mu-multi'));
    root.appendChild(check('Lymphocyte <= 0.8 x10^9/L (+4)', 'mu-lymph'));
    root.appendChild(check('Bacterial coinfection (+4)', 'mu-bact'));
    root.appendChild(select('Smoking', 'mu-smoke', [['never', 'Never smoked (0)'], ['former', 'Former smoker (+2)'], ['current', 'Current smoker (+3)']]));
    root.appendChild(check('Hypertension (+2)', 'mu-htn'));
    root.appendChild(check('Age >= 60 (+2)', 'mu-age'));
    const o = out(); root.appendChild(o);
    wire(['mu-multi', 'mu-lymph', 'mu-bact', 'mu-smoke', 'mu-htn', 'mu-age'], () => safe(o, () => {
      render(o, M.mulbsta({
        multilobar: chk('mu-multi'), lymphopenia: chk('mu-lymph'), bacterial: chk('mu-bact'),
        smoking: val('mu-smoke'), hypertension: chk('mu-htn'), ageOver60: chk('mu-age'),
      }), 'MuLBSTA');
    }));
    postureNote(root);
  },
  'ottawa-copd'(root) {
    note(root, 'Ottawa COPD Risk Scale (Stiell 2014, original derivation weighting): short-term serious-outcome risk after an ED COPD exacerbation. Total 0-16. Near-neighbors: decaf-score, bap-65, curb-65.');
    root.appendChild(check('Prior coronary bypass graft (+1)', 'ot-cabg'));
    root.appendChild(check('Prior peripheral-vascular-disease intervention (+1)', 'ot-pvd'));
    root.appendChild(check('Prior intubation for respiratory distress (+2)', 'ot-intub'));
    root.appendChild(check('Heart rate >= 110/min on arrival (+2)', 'ot-hr'));
    root.appendChild(check('Too ill for walk test, or SaO2 < 90% / HR >= 120 on it (+2)', 'ot-walk'));
    root.appendChild(check('Acute ischemic change on ECG (+2)', 'ot-ecg'));
    root.appendChild(check('Pulmonary congestion on chest x-ray (+1)', 'ot-cxr'));
    root.appendChild(check('Hemoglobin < 10 g/dL (+3)', 'ot-hb'));
    root.appendChild(check('Urea >= 12 mmol/L (+1)', 'ot-urea'));
    root.appendChild(check('Serum bicarbonate >= 35 mEq/L (+1)', 'ot-bicarb'));
    const o = out(); root.appendChild(o);
    wire(['ot-cabg', 'ot-pvd', 'ot-intub', 'ot-hr', 'ot-walk', 'ot-ecg', 'ot-cxr', 'ot-hb', 'ot-urea', 'ot-bicarb'], () => safe(o, () => {
      render(o, M.ottawaCopd({
        cabg: chk('ot-cabg'), pvd: chk('ot-pvd'), priorIntubation: chk('ot-intub'), hr110: chk('ot-hr'),
        walkTestFail: chk('ot-walk'), ischemicEcg: chk('ot-ecg'), pulmCongestion: chk('ot-cxr'),
        hbLow: chk('ot-hb'), ureaHigh: chk('ot-urea'), bicarbHigh: chk('ot-bicarb'),
      }), 'Ottawa COPD');
    }));
    postureNote(root);
  },
  'sepsis-obstetrics-score'(root) {
    note(root, 'Sepsis in Obstetrics Score (Albright 2014): pregnancy-specific, APACHE-II-derived ICU-admission risk. Eight two-tailed bands, total 0-28; >= 6 = high risk. Near-neighbors: meows, qsofa-sofa.');
    root.appendChild(select('Temperature (C)', 'sos-temp', [['normal', '36-38.4 (normal, 0)'], ['gt409', '> 40.9 (+4)'], ['t39_409', '39-40.9 (+3)'], ['t385_389', '38.5-38.9 (+2)'], ['t34_359', '34-35.9 (+1)'], ['t32_339', '32-33.9 (+2)'], ['t30_319', '30-31.9 (+3)'], ['lt30', '< 30 (+4)']]));
    root.appendChild(select('Systolic BP (mmHg)', 'sos-sbp', [['normal', '> 90 (normal, 0)'], ['s70_90', '70-90 (+1)'], ['lt70', '< 70 (+2)']]));
    root.appendChild(select('Heart rate (bpm)', 'sos-hr', [['normal', '<= 119 (normal, 0)'], ['h120_129', '120-129 (+1)'], ['h130_149', '130-149 (+2)'], ['h150_179', '150-179 (+3)'], ['gt179', '> 179 (+4)']]));
    root.appendChild(select('Respiratory rate (breaths/min)', 'sos-rr', [['normal', '12-24 (normal, 0)'], ['r10_11', '10-11 (+1)'], ['r6_9', '6-9 (+2)'], ['le5', '<= 5 (+4)'], ['r25_34', '25-34 (+2)'], ['r35_49', '35-49 (+3)'], ['gt49', '> 49 (+4)']]));
    root.appendChild(select('SpO2 (%)', 'sos-spo2', [['normal', '>= 92 (normal, 0)'], ['o90_91', '90-91 (+1)'], ['o85_89', '85-89 (+2)'], ['lt85', '< 85 (+3)']]));
    root.appendChild(select('WBC (x10^3/mm^3)', 'sos-wbc', [['normal', '5.7-16.9 (normal, 0)'], ['w3_56', '3-5.6 (+1)'], ['w1_29', '1-2.9 (+2)'], ['lt1', '< 1 (+4)'], ['w17_249', '17-24.9 (+2)'], ['w25_399', '25-39.9 (+3)'], ['gt399', '> 39.9 (+4)']]));
    root.appendChild(select('% immature neutrophils', 'sos-immature', [['normal', '< 10% (0)'], ['ge10', '>= 10% (+3)']]));
    root.appendChild(select('Lactic acid (mmol/L)', 'sos-lactic', [['normal', '< 4 (0)'], ['ge4', '>= 4 (+4)']]));
    const o = out(); root.appendChild(o);
    wire(['sos-temp', 'sos-sbp', 'sos-hr', 'sos-rr', 'sos-spo2', 'sos-wbc', 'sos-immature', 'sos-lactic'], () => safe(o, () => {
      render(o, M.sepsisObstetricsScore({
        temp: val('sos-temp'), sbp: val('sos-sbp'), hr: val('sos-hr'), rr: val('sos-rr'),
        spo2: val('sos-spo2'), wbc: val('sos-wbc'), immature: val('sos-immature'), lactic: val('sos-lactic'),
      }), 'SOS');
    }));
    postureNote(root);
  },
};
