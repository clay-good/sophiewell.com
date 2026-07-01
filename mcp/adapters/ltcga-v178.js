// spec-v183 MCP wave 10: adapters for lib/ltcga-v178.js — nutrition-risk & dysphagia instruments — GNRI, the Onodera PNI, CONUT, SNAQ, EAT-10, and the DETERMINE checklist.
// dom keys mirror views/group-v178.js; the compute arg names are the
// verbatim keys those renderers pass. Kind is number for graded / free-numeric
// inputs and enum for the yes/no and sex selects. Default makeToArgs round-trips.

import * as F from '../../lib/ltcga-v178.js';

export default [
  {
    id: 'gnri',
    summary: 'Geriatric Nutritional Risk Index: 1.489 × albumin (g/L) + 41.7 × (weight ÷ ideal weight), by sex. Bands from no risk to major nutrition-related risk.',
    compute: F.gnri,
    fields: [
    { dom: 'gnri-albumin', arg: 'albuminGL', kind: 'number', required: true, label: 'Albumin G L' },
    { dom: 'gnri-weight', arg: 'weightKg', kind: 'number', required: true, label: 'Weight Kg' },
    { dom: 'gnri-height', arg: 'heightCm', kind: 'number', required: true, label: 'Height Cm' },
    { dom: 'gnri-sex', arg: 'sex', kind: 'enum', values: ["male","female"], required: true, label: 'Sex' },
    ],
  },
  {
    id: 'pni-onodera',
    summary: 'Onodera Prognostic Nutritional Index: 10 × albumin (g/dL) + 0.005 × total lymphocyte count. < 45 indicates increased surgical/nutritional risk.',
    compute: F.pniOnodera,
    fields: [
    { dom: 'pni-albumin', arg: 'albuminGdl', kind: 'number', required: true, label: 'Albumin Gdl' },
    { dom: 'pni-lymph', arg: 'lymphocytes', kind: 'number', required: true, label: 'Lymphocytes' },
    ],
  },
  {
    id: 'conut',
    summary: 'Controlling Nutritional Status score: points from albumin, total cholesterol, and lymphocyte count. Total 0–12; higher = worse nutritional status.',
    compute: F.conut,
    fields: [
    { dom: 'conut-albumin', arg: 'albuminGdl', kind: 'number', required: true, label: 'Albumin Gdl' },
    { dom: 'conut-chol', arg: 'cholesterol', kind: 'number', required: true, label: 'Cholesterol' },
    { dom: 'conut-lymph', arg: 'lymphocytes', kind: 'number', required: true, label: 'Lymphocytes' },
    ],
  },
  {
    id: 'snaq',
    summary: 'Simplified Nutritional Appetite Questionnaire: four appetite items each 1–5. Total ≤ 14 predicts ≥ 5% weight loss within 6 months.',
    compute: F.snaq,
    fields: [
    { dom: 'snaq-appetite', arg: 'appetite', kind: 'number', required: true, label: 'Appetite' },
    { dom: 'snaq-fullness', arg: 'fullness', kind: 'number', required: true, label: 'Fullness' },
    { dom: 'snaq-taste', arg: 'taste', kind: 'number', required: true, label: 'Taste' },
    { dom: 'snaq-meals', arg: 'meals', kind: 'number', required: true, label: 'Meals' },
    ],
  },
  {
    id: 'eat-10',
    summary: 'Eating Assessment Tool (EAT-10): ten swallowing items each 0–4. Total ≥ 3 indicates abnormal swallowing (aspiration-risk screen).',
    compute: F.eat10,
    fields: [
    { dom: 'eat-1', arg: 'i1', kind: 'number', required: true, label: 'I1' },
    { dom: 'eat-2', arg: 'i2', kind: 'number', required: true, label: 'I2' },
    { dom: 'eat-3', arg: 'i3', kind: 'number', required: true, label: 'I3' },
    { dom: 'eat-4', arg: 'i4', kind: 'number', required: true, label: 'I4' },
    { dom: 'eat-5', arg: 'i5', kind: 'number', required: true, label: 'I5' },
    { dom: 'eat-6', arg: 'i6', kind: 'number', required: true, label: 'I6' },
    { dom: 'eat-7', arg: 'i7', kind: 'number', required: true, label: 'I7' },
    { dom: 'eat-8', arg: 'i8', kind: 'number', required: true, label: 'I8' },
    { dom: 'eat-9', arg: 'i9', kind: 'number', required: true, label: 'I9' },
    { dom: 'eat-10', arg: 'i10', kind: 'number', required: true, label: 'I10' },
    ],
  },
  {
    id: 'determine',
    summary: 'DETERMINE Nutritional Health Checklist: ten weighted yes/no risk items. Total 0–21; ≥ 6 high nutritional risk.',
    compute: F.determine,
    fields: [
    { dom: 'det-illness', arg: 'illness', kind: 'enum', values: ["yes","no"], required: true, label: 'Illness' },
    { dom: 'det-meals', arg: 'fewMeals', kind: 'enum', values: ["yes","no"], required: true, label: 'Few Meals' },
    { dom: 'det-fruit', arg: 'fewFruitVeg', kind: 'enum', values: ["yes","no"], required: true, label: 'Few Fruit Veg' },
    { dom: 'det-alcohol', arg: 'alcohol', kind: 'enum', values: ["yes","no"], required: true, label: 'Alcohol' },
    { dom: 'det-tooth', arg: 'toothMouth', kind: 'enum', values: ["yes","no"], required: true, label: 'Tooth Mouth' },
    { dom: 'det-money', arg: 'money', kind: 'enum', values: ["yes","no"], required: true, label: 'Money' },
    { dom: 'det-alone', arg: 'eatAlone', kind: 'enum', values: ["yes","no"], required: true, label: 'Eat Alone' },
    { dom: 'det-meds', arg: 'medications', kind: 'enum', values: ["yes","no"], required: true, label: 'Medications' },
    { dom: 'det-weight', arg: 'weightChange', kind: 'enum', values: ["yes","no"], required: true, label: 'Weight Change' },
    { dom: 'det-selfcare', arg: 'selfCare', kind: 'enum', values: ["yes","no"], required: true, label: 'Self Care' },
    ],
  },
];
