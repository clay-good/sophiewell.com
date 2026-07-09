// spec-v260 §2: renderers for the pneumonia severity & antimicrobial-stewardship risk
// scores — the A-DROP, the DRIP score, and the Shorr MRSA-pneumonia score. Group G.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the diagnosis and treatment to the
// clinician and the patient (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/pneumonia-risk-v260.js';
import { resultRow } from '../lib/result-copy.js';

function check(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
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
  'a-drop'(root) {
    note(root, 'A-DROP (Japanese Respiratory Society) CAP severity, 1 point each. Bands: 0 mild, 1-2 moderate, 3 severe, 4-5 extremely severe. Near-neighbors: curb-65, psi, smart-cop.');
    root.appendChild(check('A — Age (male >= 70 or female >= 75)', 'ad-age'));
    root.appendChild(check('D — Dehydration (BUN >= 21 mg/dL / 7.5 mmol/L)', 'ad-dehyd'));
    root.appendChild(check('R — Respiratory failure (SpO2 <= 90% or PaO2 <= 60 mmHg)', 'ad-resp'));
    root.appendChild(check('O — Orientation disturbance (new confusion)', 'ad-orient'));
    root.appendChild(check('P — low blood Pressure (systolic <= 90 mmHg)', 'ad-press'));
    const o = out(); root.appendChild(o);
    wire(['ad-age', 'ad-dehyd', 'ad-resp', 'ad-orient', 'ad-press'], () => safe(o, () => {
      render(o, M.aDrop({
        age: chk('ad-age'), dehydration: chk('ad-dehyd'), respiratory: chk('ad-resp'),
        orientation: chk('ad-orient'), pressure: chk('ad-press'),
      }), 'A-DROP');
    }));
    postureNote(root);
  },
  'drip-score'(root) {
    note(root, 'DRIP (Drug Resistance in Pneumonia): major criteria +2, minor +1. >= 4 favors broad-spectrum empiric coverage. Near-neighbors: shorr, a-drop, curb-65.');
    note(root, 'Major criteria (+2 each):');
    root.appendChild(check('Antibiotic use within 60 days', 'dr-abx'));
    root.appendChild(check('Long-term-care residence', 'dr-ltc'));
    root.appendChild(check('Tube feeding', 'dr-tube'));
    root.appendChild(check('Prior drug-resistant-pathogen infection within 1 year', 'dr-drp'));
    note(root, 'Minor criteria (+1 each):');
    root.appendChild(check('Hospitalization within 60 days', 'dr-hosp'));
    root.appendChild(check('Chronic pulmonary disease', 'dr-pulm'));
    root.appendChild(check('Poor functional status', 'dr-func'));
    root.appendChild(check('Gastric-acid suppression', 'dr-acid'));
    root.appendChild(check('Wound care', 'dr-wound'));
    root.appendChild(check('MRSA colonization within 1 year', 'dr-mrsa'));
    const o = out(); root.appendChild(o);
    wire(['dr-abx', 'dr-ltc', 'dr-tube', 'dr-drp', 'dr-hosp', 'dr-pulm', 'dr-func', 'dr-acid', 'dr-wound', 'dr-mrsa'], () => safe(o, () => {
      render(o, M.dripScore({
        antibiotics60: chk('dr-abx'), ltcResidence: chk('dr-ltc'), tubeFeeding: chk('dr-tube'), priorDrp: chk('dr-drp'),
        hospitalization60: chk('dr-hosp'), chronicPulmonary: chk('dr-pulm'), poorFunctional: chk('dr-func'),
        gastricAcid: chk('dr-acid'), woundCare: chk('dr-wound'), mrsaColonization: chk('dr-mrsa'),
      }), 'DRIP');
    }));
    postureNote(root);
  },
  'shorr'(root) {
    note(root, 'Shorr MRSA-pneumonia risk: +2 items and +1 items. Bands: low 0-1 (MRSA < 10%), medium 2-5, high >= 6 (MRSA > 30%). Near-neighbors: drip-score, a-drop.');
    root.appendChild(check('Recent hospitalization (+2)', 'sh-hosp'));
    root.appendChild(check('ICU admission at presentation (+2)', 'sh-icu'));
    root.appendChild(check('Age < 30 or > 79 (+1)', 'sh-age'));
    root.appendChild(check('Prior IV antibiotic exposure (+1)', 'sh-ivabx'));
    root.appendChild(check('Dementia (+1)', 'sh-dementia'));
    root.appendChild(check('Cerebrovascular disease (+1)', 'sh-cvd'));
    root.appendChild(check('Female sex with diabetes (+1)', 'sh-femdm'));
    root.appendChild(check('Nursing-home / LTAC / SNF exposure (+1)', 'sh-nh'));
    const o = out(); root.appendChild(o);
    wire(['sh-hosp', 'sh-icu', 'sh-age', 'sh-ivabx', 'sh-dementia', 'sh-cvd', 'sh-femdm', 'sh-nh'], () => safe(o, () => {
      render(o, M.shorrMrsa({
        recentHospitalization: chk('sh-hosp'), icuAdmission: chk('sh-icu'), ageExtreme: chk('sh-age'),
        priorIvAntibiotics: chk('sh-ivabx'), dementia: chk('sh-dementia'), cerebrovascular: chk('sh-cvd'),
        femaleDiabetes: chk('sh-femdm'), nursingHome: chk('sh-nh'),
      }), 'Shorr');
    }));
    postureNote(root);
  },
};
