// spec-v152 §2: renderers for the five predictive energy-expenditure tiles of
// the spec-v150 Post-Parity Coverage program — mifflin-st-jeor, harris-benedict,
// katch-mcardle (Clinical Math & Conversions, Group E) and penn-state-ree,
// ireton-jones (Medication & Infusion, Group F — the ICU nutrition-support
// context).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Each is
// a closed-form arithmetic compute (spec-v29 §3) over finite-checked inputs; a
// blank/non-finite weight, height, or age surfaces a complete-the-fields fallback
// rather than scoring NaN (spec-v59). Per the spec-v50 §3 posture note each tile
// renders that it produces a PREDICTION, not a measured-calorimetry value, and
// the energy prescription stays with the clinician (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/nutrition-energy-v152.js';
import { resultRow } from '../lib/result-copy.js';
import { unitField, unitNumOpt, WEIGHT_UNITS, HEIGHT_UNITS, TEMP_UNITS } from '../lib/field-units.js';

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
  inp.setAttribute('inputmode', opts.step && opts.step !== '1' ? 'decimal' : 'numeric');
  if (opts.min != null) inp.setAttribute('min', String(opts.min));
  if (opts.max != null) inp.setAttribute('max', String(opts.max));
  if (opts.placeholder) inp.setAttribute('placeholder', opts.placeholder);
  wrap.appendChild(inp);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function selVal(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function optNum(id) { const n = document.getElementById(id); return n && n.value !== '' ? Number(n.value) : null; }
function checkVal(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function showInvalid(o, r) { note(o, r.message || 'Enter the required values.'); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The value is the cited equation’s predicted energy expenditure, computed from the anthropometrics you entered — a regression estimate with known error versus a metabolic cart, not a measured calorimetry value. The energy prescription (target kcal, protein, the stress/activity factor to apply) stays with the dietitian, the nutrition-support service, and local protocol.' }));
}
function checkboxField(label, id) {
  const wrap = el('p');
  const inp = el('input', { id, type: 'checkbox' });
  wrap.appendChild(inp);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const SEX = [
  { value: 'male', text: 'Male' },
  { value: 'female', text: 'Female' },
];
const ACTIVITY = [
  { value: '', text: '— none (report resting value only) —' },
  { value: 'sedentary', text: 'Sedentary (little/no exercise) × 1.2' },
  { value: 'light', text: 'Lightly active (1–3 d/wk) × 1.375' },
  { value: 'moderate', text: 'Moderately active (3–5 d/wk) × 1.55' },
  { value: 'very', text: 'Very active (6–7 d/wk) × 1.725' },
  { value: 'extra', text: 'Extra active (hard daily/physical job) × 1.9' },
];

function anthroFields(root, prefix) {
  // spec-v184 §4.4: weight kg|lb and height cm|in toggles (canonical first, so
  // the documented example reproduces byte-identically). unitNumOpt returns the
  // canonical unit; a blank field still falls back rather than computing zero.
  root.appendChild(unitField('Weight', `${prefix}-wt`, WEIGHT_UNITS, { placeholder: 'e.g. 70' }));
  root.appendChild(unitField('Height', `${prefix}-ht`, HEIGHT_UNITS, { placeholder: 'e.g. 175' }));
  root.appendChild(numField('Age (years)', `${prefix}-age`, { min: 0, max: 120, placeholder: 'e.g. 40' }));
  root.appendChild(selectField('Sex', `${prefix}-sex`, SEX));
}

export const renderers = {
  // ----- 2.1 mifflin-st-jeor -------------------------------------------------
  'mifflin-st-jeor'(root) {
    note(root, 'Mifflin-St Jeor (1990): the first-line predictive resting energy expenditure equation for adults. REE = 10 × weight(kg) + 6.25 × height(cm) − 5 × age(yr) + s, where s = +5 (male) / −161 (female). Add an activity factor for total daily expenditure (TDEE = REE × factor). Near-neighbor: harris-benedict.');
    anthroFields(root, 'msj');
    root.appendChild(selectField('Activity factor (optional — for TDEE)', 'msj-act', ACTIVITY));
    const o = out(); root.appendChild(o);
    wire(['msj-wt', 'msj-wt-unit', 'msj-ht', 'msj-ht-unit', 'msj-age', 'msj-sex', 'msj-act'], () => safe(o, () => {
      const r = M.mifflinStJeor({ weight: unitNumOpt('msj-wt'), height: unitNumOpt('msj-ht'), age: optNum('msj-age'), sex: selVal('msj-sex'), activity: selVal('msj-act') });
      if (!r.valid) { showInvalid(o, r); return; }
      const rows = [{ text: r.band }, { label: 'REE', value: `${r.base} kcal/day` }];
      if (r.tdee != null) rows.push({ label: 'TDEE', value: `${r.tdee} kcal/day` });
      resultRow(o, rows);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 harris-benedict -------------------------------------------------
  'harris-benedict'(root) {
    note(root, 'Harris-Benedict, revised constants (Roza 1984): the classic basal energy expenditure comparator. Male BEE = 88.362 + 13.397 × wt + 4.799 × ht − 5.677 × age; female BEE = 447.593 + 9.247 × wt + 3.098 × ht − 4.330 × age. TDEE = BEE × activity factor. Tends to run ~5% above Mifflin-St Jeor, the preferred contemporary equation. Near-neighbor: mifflin-st-jeor.');
    anthroFields(root, 'hb');
    root.appendChild(selectField('Activity factor (optional — for TDEE)', 'hb-act', ACTIVITY));
    const o = out(); root.appendChild(o);
    wire(['hb-wt', 'hb-wt-unit', 'hb-ht', 'hb-ht-unit', 'hb-age', 'hb-sex', 'hb-act'], () => safe(o, () => {
      const r = M.harrisBenedict({ weight: unitNumOpt('hb-wt'), height: unitNumOpt('hb-ht'), age: optNum('hb-age'), sex: selVal('hb-sex'), activity: selVal('hb-act') });
      if (!r.valid) { showInvalid(o, r); return; }
      const rows = [{ text: r.band }, { label: 'BEE', value: `${r.base} kcal/day` }];
      if (r.tdee != null) rows.push({ label: 'TDEE', value: `${r.tdee} kcal/day` });
      resultRow(o, rows);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 katch-mcardle ---------------------------------------------------
  'katch-mcardle'(root) {
    note(root, 'Katch-McArdle: the lean-body-mass BMR equation. BMR = 370 + 21.6 × lean body mass(kg). Enter lean body mass directly, or weight + body-fat % (LBM = weight × (1 − fat%/100)). Preferred for athletes and lean/obese bodies where weight-only equations drift. TDEE = BMR × activity factor. Near-neighbor: mifflin-st-jeor.');
    root.appendChild(numField('Lean body mass (kg) — if known', 'km-lbm', { min: 0, max: 200, step: '0.1', placeholder: 'e.g. 55' }));
    note(root, 'or derive it from total body composition:');
    root.appendChild(numField('Total weight (kg)', 'km-wt', { min: 0, max: 400, step: '0.1', placeholder: 'e.g. 70' }));
    root.appendChild(numField('Body-fat % (0–100)', 'km-bf', { min: 0, max: 100, step: '0.1', placeholder: 'e.g. 21' }));
    root.appendChild(selectField('Activity factor (optional — for TDEE)', 'km-act', ACTIVITY));
    const o = out(); root.appendChild(o);
    wire(['km-lbm', 'km-wt', 'km-bf', 'km-act'], () => safe(o, () => {
      const r = M.katchMcArdle({ lbm: optNum('km-lbm'), weight: optNum('km-wt'), bodyFat: optNum('km-bf'), activity: selVal('km-act') });
      if (!r.valid) { showInvalid(o, r); return; }
      const rows = [{ text: r.band }, { label: 'BMR', value: `${r.base} kcal/day` }, { label: 'LBM', value: `${r.lbm} kg` }];
      if (r.tdee != null) rows.push({ label: 'TDEE', value: `${r.tdee} kcal/day` });
      resultRow(o, rows);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 penn-state-ree --------------------------------------------------
  'penn-state-ree'(root) {
    note(root, 'Penn State equation (2004): predicts resting metabolic rate in mechanically ventilated ICU adults. RMR = Mifflin × 0.96 + Tmax × 167 + Ve × 31 − 6212 (standard 2003b). When BMI ≥ 30 AND age ≥ 60 the modified (2010) form RMR = Mifflin × 0.71 + Tmax × 85 + Ve × 64 − 3085 is used. Tmax = max temperature in the prior 24 h; Ve = ventilator minute ventilation. Near-neighbors: icu-nutrition-target, mifflin-st-jeor.');
    anthroFields(root, 'ps');
    root.appendChild(unitField('Tmax — max temperature prior 24 h', 'ps-tmax', TEMP_UNITS, { placeholder: 'e.g. 38.5' }));
    root.appendChild(numField('Minute ventilation Ve (L/min, ventilator)', 'ps-ve', { min: 0, max: 40, step: '0.1', placeholder: 'e.g. 9' }));
    const o = out(); root.appendChild(o);
    wire(['ps-wt', 'ps-wt-unit', 'ps-ht', 'ps-ht-unit', 'ps-age', 'ps-sex', 'ps-tmax', 'ps-tmax-unit', 'ps-ve'], () => safe(o, () => {
      const r = M.pennStateRee({ weight: unitNumOpt('ps-wt'), height: unitNumOpt('ps-ht'), age: optNum('ps-age'), sex: selVal('ps-sex'), tmax: unitNumOpt('ps-tmax'), ve: optNum('ps-ve') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'RMR', value: `${r.score} kcal/day` },
        { label: 'Form', value: r.branch === 'modified' ? 'modified (2010)' : 'standard (2003b)' },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 ireton-jones ----------------------------------------------------
  'ireton-jones'(root) {
    note(root, 'Ireton-Jones (1997 revised): estimates energy expenditure in hospitalized patients. Ventilated EEE = 1784 − 11 × age + 5 × weight + 244 × (male) + 239 × (trauma) + 804 × (burn). Spontaneously breathing EEE = 629 − 11 × age + 25 × weight − 609 × (obese, BMI > 27). Near-neighbors: penn-state-ree, icu-nutrition-target.');
    root.appendChild(selectField('Ventilation status', 'ij-mode', [
      { value: 'ventilated', text: 'Ventilator-dependent' },
      { value: 'spontaneous', text: 'Spontaneously breathing' },
    ]));
    root.appendChild(numField('Age (years)', 'ij-age', { min: 0, max: 120, placeholder: 'e.g. 55' }));
    root.appendChild(unitField('Weight', 'ij-wt', WEIGHT_UNITS, { placeholder: 'e.g. 80' }));
    root.appendChild(unitField('Height — for the BMI > 27 obesity flag (spontaneous form)', 'ij-ht', HEIGHT_UNITS, { placeholder: 'e.g. 175' }));
    root.appendChild(selectField('Sex (male indicator, ventilated form)', 'ij-sex', SEX));
    root.appendChild(checkboxField('Trauma (ventilated form)', 'ij-trauma'));
    root.appendChild(checkboxField('Burn (ventilated form)', 'ij-burn'));
    const o = out(); root.appendChild(o);
    wire(['ij-mode', 'ij-age', 'ij-wt', 'ij-wt-unit', 'ij-ht', 'ij-ht-unit', 'ij-sex', 'ij-trauma', 'ij-burn'], () => safe(o, () => {
      const r = M.iretonJones({ mode: selVal('ij-mode'), age: optNum('ij-age'), weight: unitNumOpt('ij-wt'), height: unitNumOpt('ij-ht'), sex: selVal('ij-sex'), trauma: checkVal('ij-trauma'), burn: checkVal('ij-burn') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'EEE', value: `${r.score} kcal/day` },
        { label: 'Form', value: r.mode === 'ventilated' ? 'ventilated' : 'spontaneous' },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },
};
