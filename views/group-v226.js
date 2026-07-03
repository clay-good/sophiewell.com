// spec-v226 §2: renderers for the nephrology, electrolyte & fluid formulas —
// Watson TBW, Salazar-Corcoran CrCl, estimated plasma volume status, the
// furosemide stress test, the fractional excretion of bicarbonate, and the
// pH-corrected serum potassium. Group G.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the fluid / dosing / dialysis decision
// to the clinician and the patient (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/nephrology-v226.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The fluid, dosing, and dialysis decisions stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function render(o, r, valueLabel, value) {
  if (!r.valid) { note(o, r.message || 'Complete the fields.'); return; }
  resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: valueLabel, value }]);
  note(o, r.detail); note(o, r.note);
}

export const renderers = {
  'watson-tbw'(root) {
    note(root, 'Watson total body water (Watson 1980): sex-specific equation from age, height, and weight. Feeds sodium and dosing calculations. Near-neighbors: sodium-correction, cockcroft-gault.');
    root.appendChild(num('Age (years)', 'wt-age', { min: '0' }));
    root.appendChild(num('Height (cm)', 'wt-ht', { min: '0' }));
    root.appendChild(num('Weight (kg)', 'wt-wt', { min: '0' }));
    root.appendChild(check('Female', 'wt-female'));
    const o = out(); root.appendChild(o);
    wire(['wt-age', 'wt-ht', 'wt-wt', 'wt-female'], () => safe(o, () => {
      const r = M.watsonTbw({ age: val('wt-age'), height: val('wt-ht'), weight: val('wt-wt'), female: chk('wt-female') });
      render(o, r, 'TBW (L)', r.value !== undefined ? `${r.value}` : '');
    }));
    postureNote(root);
  },
  'salazar-corcoran'(root) {
    note(root, 'Salazar-Corcoran CrCl (Salazar & Corcoran 1988): estimate for obese patients where Cockcroft-Gault overestimates. Near-neighbors: cockcroft-gault, egfr-ckd-epi.');
    root.appendChild(num('Age (years)', 'sc-age', { min: '0' }));
    root.appendChild(num('Weight (kg)', 'sc-wt', { min: '0' }));
    root.appendChild(num('Height (cm)', 'sc-ht', { min: '0' }));
    root.appendChild(num('Serum creatinine (mg/dL)', 'sc-scr', { min: '0' }));
    root.appendChild(check('Female', 'sc-female'));
    const o = out(); root.appendChild(o);
    wire(['sc-age', 'sc-wt', 'sc-ht', 'sc-scr', 'sc-female'], () => safe(o, () => {
      const r = M.salazarCorcoran({ age: val('sc-age'), weight: val('sc-wt'), height: val('sc-ht'), creatinine: val('sc-scr'), female: chk('sc-female') });
      render(o, r, 'CrCl', r.value !== undefined ? `${r.value}` : '');
    }));
    postureNote(root);
  },
  'epvs'(root) {
    note(root, 'Estimated plasma volume status (Duarte 2015): ePVS = 100 × (1 − hematocrit fraction) / hemoglobin. Higher = more congestion. Near-neighbors: adhere-hf, maggic.');
    root.appendChild(num('Hematocrit (%)', 'ep-hct', { min: '0', max: '100' }));
    root.appendChild(num('Hemoglobin (g/dL)', 'ep-hb', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['ep-hct', 'ep-hb'], () => safe(o, () => {
      const r = M.epvs({ hematocrit: val('ep-hct'), hemoglobin: val('ep-hb') });
      render(o, r, 'ePVS', r.value !== undefined ? `${r.value}` : '');
    }));
    postureNote(root);
  },
  'furosemide-stress-test'(root) {
    note(root, 'Furosemide stress test (Chawla 2013): 1.0 mg/kg (naive) or 1.5 mg/kg (prior loop) IV; 2-hour urine <= 200 mL predicts progression to stage 3 AKI. Near-neighbors: kdigo-aki, fena.');
    root.appendChild(num('Weight (kg)', 'fst-wt', { min: '0' }));
    root.appendChild(num('2-hour urine output (mL)', 'fst-uop', { min: '0' }));
    root.appendChild(check('Prior loop-diuretic exposure (use 1.5 mg/kg)', 'fst-prior'));
    const o = out(); root.appendChild(o);
    wire(['fst-wt', 'fst-uop', 'fst-prior'], () => safe(o, () => {
      const r = M.furosemideStressTest({ weight: val('fst-wt'), urineOutput2h: val('fst-uop'), priorExposure: chk('fst-prior') });
      render(o, r, 'FST', r.progression !== undefined ? (r.progression ? 'progression likely' : 'passes') : '');
    }));
    postureNote(root);
  },
  'fe-bicarbonate'(root) {
    note(root, 'Fractional excretion of bicarbonate (Kurtzman 2000): FEHCO3 = (UHCO3/PHCO3) × (PCr/UCr) × 100. > 15% proximal (type II) RTA; < 5% distal (type I) / normal. Near-neighbors: fena, urine-anion-gap.');
    root.appendChild(num('Urine bicarbonate (mEq/L)', 'fe-uhco3', { min: '0' }));
    root.appendChild(num('Plasma bicarbonate (mEq/L)', 'fe-phco3', { min: '0' }));
    root.appendChild(num('Plasma creatinine (mg/dL)', 'fe-pcr', { min: '0' }));
    root.appendChild(num('Urine creatinine (mg/dL)', 'fe-ucr', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['fe-uhco3', 'fe-phco3', 'fe-pcr', 'fe-ucr'], () => safe(o, () => {
      const r = M.feBicarbonate({ urineHco3: val('fe-uhco3'), plasmaHco3: val('fe-phco3'), plasmaCr: val('fe-pcr'), urineCr: val('fe-ucr') });
      render(o, r, 'FEHCO3', r.value !== undefined ? `${r.value}%` : '');
    }));
    postureNote(root);
  },
  'corrected-potassium-ph'(root) {
    note(root, 'pH-corrected serum potassium (Adrogué & Madias 1981): corrected K = measured K − 0.6 × [(7.4 − pH) / 0.1]. A rule of thumb (organic acidosis ~0.3). Near-neighbors: corrected-sodium, anion-gap.');
    root.appendChild(num('Measured serum potassium (mEq/L)', 'kc-k', { min: '0' }));
    root.appendChild(num('Arterial pH', 'kc-ph', { min: '6.5', max: '8' }));
    const o = out(); root.appendChild(o);
    wire(['kc-k', 'kc-ph'], () => safe(o, () => {
      const r = M.correctedPotassiumPh({ potassium: val('kc-k'), ph: val('kc-ph') });
      render(o, r, 'Corrected K', r.corrected !== undefined ? `${r.corrected}` : '');
    }));
    postureNote(root);
  },
};
