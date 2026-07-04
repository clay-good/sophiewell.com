// spec-v183 MCP wave 48: adapters for the six nephrology / fluid-and-electrolyte
// instruments in lib/nephrology-v226.js — the Watson total-body-water estimate,
// the Salazar-Corcoran creatinine clearance for obesity, the estimated plasma
// volume status (ePVS), the furosemide stress test, the fractional excretion of
// bicarbonate, and the pH-corrected serum potassium. dom keys mirror
// views/group-v226.js; all inputs are numeric labs / anthropometry plus a couple
// of boolean flags.

import * as F from '../../lib/nephrology-v226.js';

export default [
  {
    id: 'watson-tbw',
    summary: 'Watson total body water (Watson 1980): a sex-specific estimate of total body water from age, height, and weight.',
    compute: F.watsonTbw,
    fields: [
      { dom: 'wt-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'wt-ht', arg: 'height', kind: 'number', required: true, label: 'Height', unit: 'cm' },
      { dom: 'wt-wt', arg: 'weight', kind: 'number', required: true, label: 'Weight', unit: 'kg' },
      { dom: 'wt-female', arg: 'female', kind: 'bool', required: false, label: 'Female sex' },
    ],
  },
  {
    id: 'salazar-corcoran',
    summary: 'Salazar-Corcoran creatinine clearance (Salazar & Corcoran 1988): a CrCl estimate for obese patients in whom Cockcroft-Gault overestimates, from age, weight, height, and creatinine.',
    compute: F.salazarCorcoran,
    fields: [
      { dom: 'sc-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'sc-wt', arg: 'weight', kind: 'number', required: true, label: 'Weight', unit: 'kg' },
      { dom: 'sc-ht', arg: 'height', kind: 'number', required: true, label: 'Height', unit: 'cm' },
      { dom: 'sc-scr', arg: 'creatinine', kind: 'number', required: true, label: 'Serum creatinine', unit: 'mg/dL' },
      { dom: 'sc-female', arg: 'female', kind: 'bool', required: false, label: 'Female sex' },
    ],
  },
  {
    id: 'epvs',
    summary: 'Estimated plasma volume status (Duarte 2015): 100 × (1 − hematocrit fraction) / hemoglobin; a higher value marks more congestion in heart failure.',
    compute: F.epvs,
    fields: [
      { dom: 'ep-hct', arg: 'hematocrit', kind: 'number', required: true, label: 'Hematocrit', unit: '%' },
      { dom: 'ep-hb', arg: 'hemoglobin', kind: 'number', required: true, label: 'Hemoglobin', unit: 'g/dL' },
    ],
  },
  {
    id: 'furosemide-stress-test',
    summary: 'Furosemide stress test (Chawla 2013): 1.0 mg/kg (loop-naive) or 1.5 mg/kg (prior loop) IV furosemide; a 2-hour urine output ≤ 200 mL predicts progression to stage 3 AKI.',
    compute: F.furosemideStressTest,
    fields: [
      { dom: 'fst-wt', arg: 'weight', kind: 'number', required: true, label: 'Weight', unit: 'kg' },
      { dom: 'fst-uop', arg: 'urineOutput2h', kind: 'number', required: true, label: '2-hour urine output', unit: 'mL' },
      { dom: 'fst-prior', arg: 'priorExposure', kind: 'bool', required: false, label: 'Prior loop-diuretic exposure (uses 1.5 mg/kg dose)' },
    ],
  },
  {
    id: 'fe-bicarbonate',
    summary: 'Fractional excretion of bicarbonate: (urine HCO₃ / plasma HCO₃) × (plasma Cr / urine Cr) × 100; > 15% suggests proximal (type II) RTA while < 5% is consistent with distal (type I) RTA or normal.',
    compute: F.feBicarbonate,
    fields: [
      { dom: 'fe-uhco3', arg: 'urineHco3', kind: 'number', required: true, label: 'Urine bicarbonate', unit: 'mEq/L' },
      { dom: 'fe-phco3', arg: 'plasmaHco3', kind: 'number', required: true, label: 'Plasma bicarbonate', unit: 'mEq/L' },
      { dom: 'fe-pcr', arg: 'plasmaCr', kind: 'number', required: true, label: 'Plasma creatinine', unit: 'mg/dL' },
      { dom: 'fe-ucr', arg: 'urineCr', kind: 'number', required: true, label: 'Urine creatinine', unit: 'mg/dL' },
    ],
  },
  {
    id: 'corrected-potassium-ph',
    summary: 'pH-corrected serum potassium: adjusts measured potassium to a normal pH of 7.4 (≈ 0.6 mEq/L per 0.1 pH unit), disclosing the true potassium masked by an acid-base disturbance.',
    compute: F.correctedPotassiumPh,
    fields: [
      { dom: 'kc-k', arg: 'potassium', kind: 'number', required: true, label: 'Measured serum potassium', unit: 'mEq/L' },
      { dom: 'kc-ph', arg: 'ph', kind: 'number', required: true, label: 'Arterial pH (6.5–8.0)' },
    ],
  },
];
