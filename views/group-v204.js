// spec-v204 §2: renderers for the nephrology, fluid-balance & renal-tubular
// instruments — CCCR, urinary calcium, ABL, electrolyte-free water clearance,
// and TmP/GFR. Groups F / G. Shipped one tile at a time; opens the Frontline &
// Bedside Decision Instruments program.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. The
// ratio computes are finite-guarded against zero/blank denominators in
// lib/nephro-fluids-v204.js. Per the spec-v50 §3 posture note each tile defers
// the fluid / transfusion / dialysis / surgical-referral decision to the
// clinician and the patient (spec-v11 §5.3) — these quantify, they do not order.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/nephro-fluids-v204.js';
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
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function showInvalid(o, r) { note(o, r.message || 'Complete the remaining fields.'); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The value is the cited source’s, computed from the inputs you enter. The fluid, transfusion, dialysis, and surgical-referral decisions stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  // ----- 2.1 cccr ------------------------------------------------------------
  cccr(root) {
    note(root, 'Calcium/Creatinine Clearance Ratio (Christensen 2008): CCCR = (urine Ca × serum Cr) / (serum Ca × urine Cr). < 0.01 suggests FHH; > 0.02 suggests primary hyperparathyroidism; 0.01–0.02 indeterminate. Enter calcium terms in one shared unit and creatinine terms in one shared unit. Near-neighbors: corrected-calcium, tmp-gfr.');
    root.appendChild(num('Urine calcium (shared calcium unit)', 'cccr-uca', { min: '0' }));
    root.appendChild(num('Serum calcium (shared calcium unit)', 'cccr-sca', { min: '0' }));
    root.appendChild(num('Serum creatinine (shared creatinine unit)', 'cccr-scr', { min: '0' }));
    root.appendChild(num('Urine creatinine (shared creatinine unit)', 'cccr-ucr', { min: '0' }));
    const o = out(); root.appendChild(o);
    const ids = ['cccr-uca', 'cccr-sca', 'cccr-scr', 'cccr-ucr'];
    wire(ids, () => safe(o, () => {
      const r = M.cccr({ urineCa: val('cccr-uca'), serumCa: val('cccr-sca'), serumCr: val('cccr-scr'), urineCr: val('cccr-ucr') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'CCCR', value: `${r.score}` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 max-allowable-blood-loss ----------------------------------------
  'max-allowable-blood-loss'(root) {
    note(root, 'Maximum Allowable Blood Loss (Gross 1983): EBV = weight × factor (neonate 85, infant 80, child 70, adult male 75, adult female 65 mL/kg); ABL = EBV × (Hct initial − Hct target) / Hct initial. An intraoperative transfusion-planning estimate. Near-neighbors: peds-transfusion-volume, blood-compat.');
    root.appendChild(selectField('Patient category (blood-volume factor)', 'abl-cat', [
      { value: 'neonate', text: 'Neonate (85 mL/kg)' },
      { value: 'infant', text: 'Infant (80 mL/kg)' },
      { value: 'child', text: 'Child (70 mL/kg)' },
      { value: 'adult-male', text: 'Adult male (75 mL/kg)' },
      { value: 'adult-female', text: 'Adult female (65 mL/kg)' },
    ]));
    root.appendChild(num('Weight (kg)', 'abl-weight', { min: '0' }));
    root.appendChild(num('Initial hematocrit (%) or hemoglobin (g/dL)', 'abl-hcti', { min: '0' }));
    root.appendChild(num('Target (minimum acceptable) hematocrit or hemoglobin — same measure', 'abl-hctf', { min: '0' }));
    const o = out(); root.appendChild(o);
    const ids = ['abl-cat', 'abl-weight', 'abl-hcti', 'abl-hctf'];
    wire(ids, () => safe(o, () => {
      const r = M.maxAllowableBloodLoss({ category: val('abl-cat'), weight: val('abl-weight'), hctInitial: val('abl-hcti'), hctTarget: val('abl-hctf') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'ABL', value: `${r.score} mL` }, { label: 'EBV', value: `${r.ebv} mL` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 efw-clearance ---------------------------------------------------
  'efw-clearance'(root) {
    note(root, 'Electrolyte-Free Water Clearance (Rose 1986): EFWC = V × [1 − (U_Na + U_K) / P_Na]. A positive value means the kidney is excreting free water (aggravating hypernatremia / correcting hyponatremia); a negative value means net free-water retention (aggravating hyponatremia). Near-neighbors: free-water-deficit, sodium-correction.');
    root.appendChild(num('Urine sodium (mEq/L)', 'efwc-una', { min: '0' }));
    root.appendChild(num('Urine potassium (mEq/L)', 'efwc-uk', { min: '0' }));
    root.appendChild(num('Plasma sodium (mEq/L)', 'efwc-pna', { min: '0' }));
    root.appendChild(num('Urine volume over the interval (mL)', 'efwc-vol', { min: '0' }));
    const o = out(); root.appendChild(o);
    const ids = ['efwc-una', 'efwc-uk', 'efwc-pna', 'efwc-vol'];
    wire(ids, () => safe(o, () => {
      const r = M.efwClearance({ urineNa: val('efwc-una'), urineK: val('efwc-uk'), plasmaNa: val('efwc-pna'), urineVolume: val('efwc-vol') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'EFWC', value: `${r.score} mL` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 tmp-gfr ---------------------------------------------------------
  'tmp-gfr'(root) {
    note(root, 'TmP/GFR (Payne 1998): the renal phosphate threshold. TRP = 1 − (U_P × S_Cr)/(S_P × U_Cr); TmP/GFR = TRP × S_P when TRP ≤ 0.86, else the Payne hyperbolic form. Adult reference ≈ 0.80–1.35 mmol/L (2.5–4.2 mg/dL); low = renal phosphate wasting. Enter phosphate terms in one shared unit and creatinine terms in one shared unit. Near-neighbors: fepo4, cccr.');
    root.appendChild(num('Serum phosphate (shared phosphate unit)', 'tmp-sp', { min: '0' }));
    root.appendChild(num('Urine phosphate (shared phosphate unit)', 'tmp-up', { min: '0' }));
    root.appendChild(num('Serum creatinine (shared creatinine unit)', 'tmp-scr', { min: '0' }));
    root.appendChild(num('Urine creatinine (shared creatinine unit)', 'tmp-ucr', { min: '0' }));
    const o = out(); root.appendChild(o);
    const ids = ['tmp-sp', 'tmp-up', 'tmp-scr', 'tmp-ucr'];
    wire(ids, () => safe(o, () => {
      const r = M.tmpGfr({ serumP: val('tmp-sp'), urineP: val('tmp-up'), serumCr: val('tmp-scr'), urineCr: val('tmp-ucr') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'TmP/GFR', value: `${r.score}` }, { label: 'TRP', value: `${r.trp}` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 urine-calcium-cr ------------------------------------------------
  'urine-calcium-cr'(root) {
    note(root, 'Urinary-calcium assessment (StatPearls; Sargent 1993 for infants): the calciuria step in the nephrolithiasis / hypercalciuria workup. Spot Ca/Cr > 0.20 mg/mg (adult), or 24-hour calcium > 250 (women) / > 300 (men) mg/day or > 4 mg/kg/day. Choose a mode and fill its fields. Near-neighbors: cccr, uacr-upcr.');
    root.appendChild(selectField('Mode', 'uca-mode', [
      { value: 'spot', text: 'Spot Ca/Cr ratio' },
      { value: 'day', text: '24-hour excretion' },
    ]));
    root.appendChild(el('p', { class: 'muted', text: 'Spot mode:' }));
    root.appendChild(num('Urine calcium (same mass unit as creatinine)', 'uca-uca', { min: '0' }));
    root.appendChild(num('Urine creatinine (same mass unit as calcium)', 'uca-ucr', { min: '0' }));
    root.appendChild(selectField('Age band (spot)', 'uca-age', [
      { value: 'adult', text: 'Adult / older child (> 0.20 mg/mg)' },
      { value: 'infant-lt7mo', text: '< 7 months (> 0.86 mg/mg)' },
      { value: 'infant-7to18mo', text: '7–18 months (> 0.60 mg/mg)' },
      { value: 'child-19moTo6y', text: '19 months–6 years (> 0.42 mg/mg)' },
    ]));
    root.appendChild(el('p', { class: 'muted', text: '24-hour mode:' }));
    root.appendChild(num('24-hour urine calcium (mg/day)', 'uca-24h', { min: '0' }));
    root.appendChild(num('Body weight (kg)', 'uca-wt', { min: '0' }));
    root.appendChild(selectField('Sex (24-hour)', 'uca-sex', [
      { value: 'female', text: 'Female (> 250 mg/day)' },
      { value: 'male', text: 'Male (> 300 mg/day)' },
    ]));
    const o = out(); root.appendChild(o);
    const ids = ['uca-mode', 'uca-uca', 'uca-ucr', 'uca-age', 'uca-24h', 'uca-wt', 'uca-sex'];
    wire(ids, () => safe(o, () => {
      const r = M.urineCalcium({ mode: val('uca-mode'), urineCa: val('uca-uca'), urineCr: val('uca-ucr'), ageBand: val('uca-age'), calcium24h: val('uca-24h'), weight: val('uca-wt'), sex: val('uca-sex') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Result', value: r.bandLabel }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },
};
