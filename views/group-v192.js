// spec-v192 §2: renderers for four screening / bedside-risk tiles — FINDRISC,
// the Grobman race-free 2021 VBAC calculator, the Marburg Heart Score, and the
// ADHERE CART tree. Group G (scoring & risk). (GWTG-HF deferred — see
// lib/risk-v192.js header and docs/scope-post-parity.md.)
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the screening / delivery-mode /
// disposition decision to the clinician and patient (spec-v11 §5.3) — these score
// and stratify, they do not order.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/risk-v192.js';
import { resultRow } from '../lib/result-copy.js';

function field(label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, ...attrs }));
  return wrap;
}
function num(label, id, attrs = {}) {
  return field(label, id, { type: 'number', min: '0', step: 'any', inputmode: 'decimal', ...attrs });
}
function selectField(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
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
function invalid(o, r) { note(o, 'Complete the remaining fields.'); note(o, r.note); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The score, probability, or risk group is the cited source’s, computed from the inputs you enter. The screening, delivery-mode, and admission decisions stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const SEX_OPTS = [
  { value: 'female', text: 'Female (waist bands 80 / 88 cm)' },
  { value: 'male', text: 'Male (waist bands 94 / 102 cm)' },
];
const FAMILY_OPTS = [
  { value: 'none', text: 'No family history' },
  { value: 'second', text: 'Grandparent / aunt / uncle / cousin (2nd-degree) — +3' },
  { value: 'first', text: 'Parent / sibling / child (1st-degree) — +5' },
];
const VAG_OPTS = [
  { value: 'none', text: 'No prior vaginal delivery' },
  { value: 'before', text: 'Prior vaginal delivery only before the cesarean — +0.868' },
  { value: 'vbac', text: 'Prior VBAC (vaginal delivery after the cesarean) — +1.869' },
];

export const renderers = {
  // ----- 2.1 findrisc --------------------------------------------------------
  findrisc(root) {
    note(root, 'FINDRISC (Lindström 2003): eight-item type-2-diabetes screening score (0–26). Bands: < 7 low, 7–11 slightly elevated, 12–14 moderate, 15–20 high, > 20 very high 10-year risk. Near-neighbors: the metabolic tiles.');
    root.appendChild(num('Age (years)', 'findrisc-age'));
    root.appendChild(num('BMI (kg/m²)', 'findrisc-bmi'));
    root.appendChild(selectField('Sex (sets the waist bands)', 'findrisc-sex', SEX_OPTS));
    root.appendChild(num('Waist circumference (cm)', 'findrisc-waist'));
    root.appendChild(checkField('Physically active ≥ 30 min/day', 'findrisc-active'));
    root.appendChild(checkField('Eats vegetables/fruit daily', 'findrisc-fruitVeg'));
    root.appendChild(checkField('On antihypertensive medication', 'findrisc-bpMed'));
    root.appendChild(checkField('History of high blood glucose', 'findrisc-highGlucose'));
    root.appendChild(selectField('Family history of diabetes', 'findrisc-familyHistory', FAMILY_OPTS));
    const o = out(); root.appendChild(o);
    wire(['findrisc-age', 'findrisc-bmi', 'findrisc-sex', 'findrisc-waist', 'findrisc-active', 'findrisc-fruitVeg', 'findrisc-bpMed', 'findrisc-highGlucose', 'findrisc-familyHistory'], () => safe(o, () => {
      const r = M.findrisc({ age: val('findrisc-age'), bmi: val('findrisc-bmi'), sex: val('findrisc-sex'), waist: val('findrisc-waist'), active: chk('findrisc-active'), fruitVeg: chk('findrisc-fruitVeg'), bpMed: chk('findrisc-bpMed'), highGlucose: chk('findrisc-highGlucose'), familyHistory: val('findrisc-familyHistory') });
      if (!r.valid) return invalid(o, r);
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'FINDRISC', value: `${r.score}` },
        { label: '10-year risk', value: r.risk },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 grobman-vbac ----------------------------------------------------
  'grobman-vbac'(root) {
    note(root, 'Grobman race-free 2021 VBAC calculator (AJOG 2021): predicts the probability of a successful trial of labor after cesarean. The 2021 model uses weight + height (not BMI) and removed the race/ethnicity terms. The race-free successor to flamm-vbac. Near-neighbors: flamm-vbac.');
    root.appendChild(num('Maternal age (years)', 'grobman-age'));
    root.appendChild(num('Pre-pregnancy weight (kg)', 'grobman-weight'));
    root.appendChild(num('Height (cm)', 'grobman-height'));
    root.appendChild(selectField('Prior vaginal delivery history', 'grobman-vaginalHistory', VAG_OPTS));
    root.appendChild(checkField('Prior cesarean was for an arrest disorder', 'grobman-arrestIndication'));
    root.appendChild(checkField('Treated chronic hypertension', 'grobman-chronicHtn'));
    const o = out(); root.appendChild(o);
    wire(['grobman-age', 'grobman-weight', 'grobman-height', 'grobman-vaginalHistory', 'grobman-arrestIndication', 'grobman-chronicHtn'], () => safe(o, () => {
      const r = M.grobmanVbac({ age: val('grobman-age'), weight: val('grobman-weight'), height: val('grobman-height'), vaginalHistory: val('grobman-vaginalHistory'), arrestIndication: chk('grobman-arrestIndication'), chronicHtn: chk('grobman-chronicHtn') });
      if (!r.valid) return invalid(o, r);
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'VBAC success', value: `${r.probability}%` },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 marburg-heart-score ---------------------------------------------
  'marburg-heart-score'(root) {
    note(root, 'Marburg Heart Score (Bösner 2010): rules out CAD in primary-care chest pain. Five criteria each 1 point; 0–2 makes CAD unlikely, ≥ 3 warrants further evaluation. Near-neighbors: heart, edacs.');
    root.appendChild(checkField('Female ≥ 65 or male ≥ 55 (age/sex)', 'marburg-ageSex'));
    root.appendChild(checkField('Known vascular disease (CAD, cerebrovascular, or PAD)', 'marburg-vascular'));
    root.appendChild(checkField('Pain worse with exercise', 'marburg-worseExercise'));
    root.appendChild(checkField('Pain NOT reproducible by palpation', 'marburg-notPalpable'));
    root.appendChild(checkField('Patient assumes the pain is cardiac', 'marburg-assumesCardiac'));
    const o = out(); root.appendChild(o);
    wire(['marburg-ageSex', 'marburg-vascular', 'marburg-worseExercise', 'marburg-notPalpable', 'marburg-assumesCardiac'], () => safe(o, () => {
      const r = M.marburgHeartScore({ ageSex: chk('marburg-ageSex'), vascular: chk('marburg-vascular'), worseExercise: chk('marburg-worseExercise'), notPalpable: chk('marburg-notPalpable'), assumesCardiac: chk('marburg-assumesCardiac') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}` },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 adhere-hf -------------------------------------------------------
  'adhere-hf'(root) {
    note(root, 'ADHERE CART tree (Fonarow 2005): in-hospital heart-failure mortality from three admission labs — BUN ≥ 43, then SBP < 115, then creatinine ≥ 2.75. A fast bedside triage complement to point-based HF models. Near-neighbors: maggic.');
    root.appendChild(num('BUN (mg/dL)', 'adhere-bun'));
    root.appendChild(num('Systolic BP (mmHg)', 'adhere-sbp'));
    root.appendChild(num('Creatinine (mg/dL) — needed only if BUN ≥ 43 and SBP < 115', 'adhere-creatinine'));
    const o = out(); root.appendChild(o);
    wire(['adhere-bun', 'adhere-sbp', 'adhere-creatinine'], () => safe(o, () => {
      const r = M.adhereHf({ bun: val('adhere-bun'), sbp: val('adhere-sbp'), creatinine: val('adhere-creatinine') });
      if (!r.valid) return invalid(o, r);
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Risk group', value: r.group },
        { label: 'In-hospital mortality', value: r.mortality },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },
};
