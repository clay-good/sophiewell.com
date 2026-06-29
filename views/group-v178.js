// spec-v178 §2: renderers for the six geriatric-nutrition / dysphagia tiles of
// the spec-v172 Long-Term Care & Geriatric Assessment program — gnri,
// pni-onodera, conut (lab-based formulas, Clinical Math & Conversions Group E)
// and snaq, eat-10, determine (bounded sums, Clinical Scoring & Risk Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. The
// formula tiles guard their inputs (GNRI's ideal-body-weight denominator is
// positive-checked); a blank/non-finite input surfaces a complete-the-fields
// fallback rather than NaN. Per the spec-v50 §3 posture note each tile defers the
// clinical decision to the clinician (spec-v11 §5.3) and never authors a diet,
// feeding, or treatment order.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/ltcga-v178.js';
import { resultRow } from '../lib/result-copy.js';

function selectField(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  return wrap;
}
function pickField(label, id, options) {
  return selectField(label, id, [{ value: '', text: '— choose —' }, ...options]);
}
function numField(label, id, opts = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: 'number', autocomplete: 'off' });
  inp.setAttribute('step', opts.step || '1');
  inp.setAttribute('inputmode', opts.step && opts.step !== '1' ? 'decimal' : 'numeric');
  if (opts.min != null) inp.setAttribute('min', String(opts.min));
  if (opts.placeholder) inp.setAttribute('placeholder', opts.placeholder);
  wrap.appendChild(inp);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function selVal(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function optNum(id) { const n = document.getElementById(id); return n && n.value !== '' ? Number(n.value) : null; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function showInvalid(o, r) { note(o, r.message || 'Complete the remaining fields.'); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The value or score is the cited index’s, derived from the labs/answers you enter; it is a nutrition / dysphagia screen, not a diagnosis. The clinical decision — the nutrition assessment, the diet or feeding plan, and any swallow study — stays with the dietitian, the clinician, and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const SEX = [{ value: 'male', text: 'Male' }, { value: 'female', text: 'Female' }];
const SNAQ15 = [
  { value: '1', text: '1' }, { value: '2', text: '2' }, { value: '3', text: '3' }, { value: '4', text: '4' }, { value: '5', text: '5' },
];
const EAT04 = [
  { value: '0', text: '0 — no problem' }, { value: '1', text: '1' }, { value: '2', text: '2' }, { value: '3', text: '3' }, { value: '4', text: '4 — severe problem' },
];
const YESNO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];

const SNAQ_FIELDS = [
  ['My appetite is… (1 very poor → 5 very good)', 'snaq-appetite', 'appetite'],
  ['When I eat, I feel full after… (1 only a few mouthfuls → 5 hardly ever)', 'snaq-fullness', 'fullness'],
  ['Food tastes… (1 very bad → 5 very good)', 'snaq-taste', 'taste'],
  ['Normally I eat… (1 less than 1 meal/day → 5 more than 3 meals/day)', 'snaq-meals', 'meals'],
];
const EAT10_FIELDS = [
  ['My swallowing problem has caused me to lose weight', 'eat-1', 'i1'],
  ['My swallowing problem interferes with going out for meals', 'eat-2', 'i2'],
  ['Swallowing liquids takes extra effort', 'eat-3', 'i3'],
  ['Swallowing solids takes extra effort', 'eat-4', 'i4'],
  ['Swallowing pills takes extra effort', 'eat-5', 'i5'],
  ['Swallowing is painful', 'eat-6', 'i6'],
  ['The pleasure of eating is affected by my swallowing', 'eat-7', 'i7'],
  ['When I swallow, food sticks in my throat', 'eat-8', 'i8'],
  ['I cough when I eat', 'eat-9', 'i9'],
  ['Swallowing is stressful', 'eat-10', 'i10'],
];
const DETERMINE_FIELDS = [
  ['Illness or condition that changed the kind/amount of food eaten', 'det-illness', 'illness'],
  ['Eats fewer than 2 meals per day', 'det-meals', 'fewMeals'],
  ['Eats few fruits, vegetables, or milk products', 'det-fruit', 'fewFruitVeg'],
  ['Has 3 or more alcoholic drinks almost every day', 'det-alcohol', 'alcohol'],
  ['Tooth or mouth problems make eating hard', 'det-tooth', 'toothMouth'],
  ['Not always enough money to buy needed food', 'det-money', 'money'],
  ['Eats alone most of the time', 'det-alone', 'eatAlone'],
  ['Takes 3 or more different medications a day', 'det-meds', 'medications'],
  ['Unintended 10-lb weight loss/gain in the last 6 months', 'det-weight', 'weightChange'],
  ['Not always physically able to shop, cook, or feed self', 'det-selfcare', 'selfCare'],
];

function payloadFrom(fields) { const p = {}; for (const [, id, key] of fields) p[key] = selVal(id); return p; }
function addPicks(root, fields, options) { for (const [label, id] of fields) root.appendChild(pickField(label, id, options)); }
function idsOf(fields) { return fields.map(([, id]) => id); }

export const renderers = {
  // ----- 2.1 gnri (Group E) --------------------------------------------------
  gnri(root) {
    note(root, 'GNRI (Bouillanne 2005): GNRI = 1.489 × albumin (g/L) + 41.7 × (weight ÷ ideal body weight), the ratio capped at 1 and ideal weight from the Lorentz equations. > 98 no risk, 92–98 low, 82 to < 92 moderate, < 82 major risk. A nutrition-related risk index for at-risk elderly medical patients.');
    root.appendChild(numField('Serum albumin (g/L)', 'gnri-albumin', { step: '0.1', min: 0, placeholder: 'e.g. 35' }));
    root.appendChild(numField('Body weight (kg)', 'gnri-weight', { step: '0.1', min: 0, placeholder: 'e.g. 60' }));
    root.appendChild(numField('Height (cm)', 'gnri-height', { step: '0.1', min: 0, placeholder: 'e.g. 165' }));
    root.appendChild(pickField('Sex', 'gnri-sex', SEX));
    const o = out(); root.appendChild(o);
    wire(['gnri-albumin', 'gnri-weight', 'gnri-height', 'gnri-sex'], () => safe(o, () => {
      const r = M.gnri({ albuminGL: optNum('gnri-albumin'), weightKg: optNum('gnri-weight'), heightCm: optNum('gnri-height'), sex: selVal('gnri-sex') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band }, { label: 'GNRI', value: `${r.value}` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 pni-onodera (Group E) -------------------------------------------
  'pni-onodera'(root) {
    note(root, 'Onodera PNI (1984): PNI = 10 × albumin (g/dL) + 0.005 × total lymphocyte count (per mm³). ≥ 45 no increased risk, 40 to < 45 borderline, < 40 high nutritional/surgical risk. A lab-only prognostic nutritional index.');
    root.appendChild(numField('Serum albumin (g/dL)', 'pni-albumin', { step: '0.1', min: 0, placeholder: 'e.g. 4.0' }));
    root.appendChild(numField('Total lymphocyte count (per mm³)', 'pni-lymph', { step: '1', min: 0, placeholder: 'e.g. 1500' }));
    const o = out(); root.appendChild(o);
    wire(['pni-albumin', 'pni-lymph'], () => safe(o, () => {
      const r = M.pniOnodera({ albuminGdl: optNum('pni-albumin'), lymphocytes: optNum('pni-lymph') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band }, { label: 'PNI', value: `${r.value}` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 conut (Group E) -------------------------------------------------
  conut(root) {
    note(root, 'CONUT (Ignacio de Ulíbarri 2005): points from albumin, total cholesterol, and lymphocyte count → 0–12. 0–1 normal, 2–4 mild, 5–8 moderate, 9–12 severe nutritional risk. A lab-only nutritional-status screen.');
    root.appendChild(numField('Serum albumin (g/dL)', 'conut-albumin', { step: '0.1', min: 0, placeholder: 'e.g. 3.2' }));
    root.appendChild(numField('Total cholesterol (mg/dL)', 'conut-chol', { step: '1', min: 0, placeholder: 'e.g. 150' }));
    root.appendChild(numField('Total lymphocyte count (per mm³)', 'conut-lymph', { step: '1', min: 0, placeholder: 'e.g. 1000' }));
    const o = out(); root.appendChild(o);
    wire(['conut-albumin', 'conut-chol', 'conut-lymph'], () => safe(o, () => {
      const r = M.conut({ albuminGdl: optNum('conut-albumin'), cholesterol: optNum('conut-chol'), lymphocytes: optNum('conut-lymph') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band }, { label: 'Total', value: `${r.total}/12` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 snaq ------------------------------------------------------------
  snaq(root) {
    note(root, 'SNAQ (Wilson 2005): the Simplified Nutritional Appetite Questionnaire — 4 appetite items each 1–5. Total 4–20; ≤ 14 predicts ≥ 5% weight loss within 6 months. Not the Short Nutritional Assessment Questionnaire.');
    addPicks(root, SNAQ_FIELDS, SNAQ15);
    const o = out(); root.appendChild(o);
    wire(idsOf(SNAQ_FIELDS), () => safe(o, () => {
      const r = M.snaq(payloadFrom(SNAQ_FIELDS));
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band }, { label: 'Total', value: `${r.total}/20` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 eat-10 ----------------------------------------------------------
  'eat-10'(root) {
    note(root, 'EAT-10 (Belafsky 2008): the Eating Assessment Tool — 10 patient self-report swallow items each 0 (no problem) to 4 (severe). Total 0–40; ≥ 3 indicates abnormal swallowing and aspiration risk. The patient self-report complement to a clinician swallow test.');
    addPicks(root, EAT10_FIELDS, EAT04);
    const o = out(); root.appendChild(o);
    wire(idsOf(EAT10_FIELDS), () => safe(o, () => {
      const r = M.eat10(payloadFrom(EAT10_FIELDS));
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band }, { label: 'Total', value: `${r.total}/40` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.6 determine -------------------------------------------------------
  determine(root) {
    note(root, 'DETERMINE checklist (Nutrition Screening Initiative; Posner 1993): 10 weighted yes/no items. Total 0–21; 0–2 good, 3–5 moderate, ≥ 6 high nutritional risk. The classic community-elder nutrition self-checklist.');
    addPicks(root, DETERMINE_FIELDS, YESNO);
    const o = out(); root.appendChild(o);
    wire(idsOf(DETERMINE_FIELDS), () => safe(o, () => {
      const r = M.determine(payloadFrom(DETERMINE_FIELDS));
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band }, { label: 'Total', value: `${r.total}/21` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },
};

export const RV178 = renderers;
