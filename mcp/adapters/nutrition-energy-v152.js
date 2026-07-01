// spec-v183 MCP wave 8: adapters for the five lib/nutrition-energy-v152.js
// predictive energy-expenditure equations (Mifflin-St Jeor, Harris-Benedict,
// Katch-McArdle, Penn State ventilated RMR, and Ireton-Jones). dom keys mirror
// views/group-v152.js: the anthropometrics are numbers, sex / activity factor /
// ventilation mode are enums, and the Ireton-Jones trauma and burn diagnosis
// modifiers are booleans. Katch-McArdle accepts either lean body mass directly
// or weight + body-fat %, so all three of its inputs are optional.

import * as F from '../../lib/nutrition-energy-v152.js';

const SEX = ['male', 'female'];
const ACTIVITY = ['sedentary', 'light', 'moderate', 'very', 'extra'];

export default [
  {
    id: 'mifflin-st-jeor',
    summary: 'Mifflin-St Jeor resting energy expenditure (first-line predictive REE for adults); optionally multiplied by an activity factor for total daily energy expenditure.',
    compute: F.mifflinStJeor,
    fields: [
      { dom: 'msj-wt', arg: 'weight', kind: 'number', required: true, label: 'Weight', unit: 'kg' },
      { dom: 'msj-ht', arg: 'height', kind: 'number', required: true, label: 'Height', unit: 'cm' },
      { dom: 'msj-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'yr' },
      { dom: 'msj-sex', arg: 'sex', kind: 'enum', values: SEX, required: true, label: 'Sex' },
      { dom: 'msj-act', arg: 'activity', kind: 'enum', values: ACTIVITY, required: false, label: 'Activity factor (optional, for TDEE)' },
    ],
  },
  {
    id: 'harris-benedict',
    summary: 'Harris-Benedict basal energy expenditure (revised Roza 1984 constants), the classic comparator to Mifflin-St Jeor; optional activity factor for TDEE.',
    compute: F.harrisBenedict,
    fields: [
      { dom: 'hb-wt', arg: 'weight', kind: 'number', required: true, label: 'Weight', unit: 'kg' },
      { dom: 'hb-ht', arg: 'height', kind: 'number', required: true, label: 'Height', unit: 'cm' },
      { dom: 'hb-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'yr' },
      { dom: 'hb-sex', arg: 'sex', kind: 'enum', values: SEX, required: true, label: 'Sex' },
      { dom: 'hb-act', arg: 'activity', kind: 'enum', values: ACTIVITY, required: false, label: 'Activity factor (optional, for TDEE)' },
    ],
  },
  {
    id: 'katch-mcardle',
    summary: 'Katch-McArdle basal metabolic rate from lean body mass (370 + 21.6 × LBM). Enter lean body mass directly, or weight + body-fat % to derive it; optional activity factor for TDEE.',
    compute: F.katchMcArdle,
    fields: [
      { dom: 'km-lbm', arg: 'lbm', kind: 'number', required: false, label: 'Lean body mass', unit: 'kg' },
      { dom: 'km-wt', arg: 'weight', kind: 'number', required: false, label: 'Weight (with body-fat %)', unit: 'kg' },
      { dom: 'km-bf', arg: 'bodyFat', kind: 'number', required: false, label: 'Body-fat %', unit: '%' },
      { dom: 'km-act', arg: 'activity', kind: 'enum', values: ACTIVITY, required: false, label: 'Activity factor (optional, for TDEE)' },
    ],
  },
  {
    id: 'penn-state-ree',
    summary: 'Penn State equation for resting metabolic rate in mechanically ventilated critically ill adults (Mifflin REE + Tmax + minute ventilation); auto-selects the standard vs 2010-modified form by BMI and age.',
    compute: F.pennStateRee,
    fields: [
      { dom: 'ps-wt', arg: 'weight', kind: 'number', required: true, label: 'Weight', unit: 'kg' },
      { dom: 'ps-ht', arg: 'height', kind: 'number', required: true, label: 'Height', unit: 'cm' },
      { dom: 'ps-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'yr' },
      { dom: 'ps-sex', arg: 'sex', kind: 'enum', values: SEX, required: true, label: 'Sex' },
      { dom: 'ps-tmax', arg: 'tmax', kind: 'number', required: true, label: 'Maximum temperature in prior 24 h', unit: '°C' },
      { dom: 'ps-ve', arg: 've', kind: 'number', required: true, label: 'Minute ventilation', unit: 'L/min' },
    ],
  },
  {
    id: 'ireton-jones',
    summary: 'Ireton-Jones energy equation for hospitalized patients, with a ventilator-dependent and a spontaneously-breathing form; trauma and burn are diagnosis modifiers on the ventilated form.',
    compute: F.iretonJones,
    fields: [
      { dom: 'ij-mode', arg: 'mode', kind: 'enum', values: ['ventilated', 'spontaneous'], required: false, label: 'Ventilation status' },
      { dom: 'ij-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'yr' },
      { dom: 'ij-wt', arg: 'weight', kind: 'number', required: true, label: 'Weight', unit: 'kg' },
      { dom: 'ij-ht', arg: 'height', kind: 'number', required: false, label: 'Height (spontaneous form, for BMI)', unit: 'cm' },
      { dom: 'ij-sex', arg: 'sex', kind: 'enum', values: SEX, required: false, label: 'Sex (male indicator, ventilated form)' },
      { dom: 'ij-trauma', arg: 'trauma', kind: 'bool', required: false, label: 'Trauma (ventilated form modifier)' },
      { dom: 'ij-burn', arg: 'burn', kind: 'bool', required: false, label: 'Burn (ventilated form modifier)' },
    ],
  },
];
