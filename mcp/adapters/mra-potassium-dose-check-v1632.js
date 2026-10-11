// spec-v1632 MCP adapter: mra-potassium-dose-check in lib/mra-potassium-dose-check-v1632.js. The dom
// keys mirror views/group-v1632.js and META['mra-potassium-dose-check'].example. Clinical domain.
// Two label rows: Aldactone and Inspra.

import * as MR from '../../lib/mra-potassium-dose-check-v1632.js';

export default [
  {
    id: 'mra-potassium-dose-check',
    summary: 'The step the FDA label gives for spironolactone or eplerenone. Spironolactone: the heart failure starting dose by potassium and eGFR. Eplerenone: the dose adjustment by serum potassium from the current dose (heart failure after MI), or a check of the listed contraindications before starting, for heart failure or for hypertension. It starts, changes and stops nothing.',
    compute: MR.mraPotassiumDoseCheck,
    fields: [
      { dom: 'mra-mode', arg: 'mode', kind: 'enum', required: true, values: MR.MODES.map((m) => m.value), label: 'Drug and question' },
      { dom: 'mra-k', arg: 'potassium', kind: 'number', required: true, label: 'Serum potassium', unit: 'mEq/L' },
      { dom: 'mra-egfr', arg: 'egfr', kind: 'number', label: 'Spironolactone: eGFR', unit: 'mL/min/1.73 m²' },
      { dom: 'mra-dose', arg: 'currentDose', kind: 'enum', values: MR.EPLERENONE_DOSES.map((d) => d.value), label: 'Eplerenone adjustment: current dose' },
      { dom: 'mra-crcl', arg: 'crcl', kind: 'number', label: 'Eplerenone start: creatinine clearance', unit: 'mL/min' },
      { dom: 'mra-cyp', arg: 'cyp3a', kind: 'enum', values: MR.YES_NO.map((y) => y.value), label: 'Eplerenone start: strong CYP3A inhibitor' },
      { dom: 'mra-sex', arg: 'sex', kind: 'enum', values: MR.SEXES.map((s) => s.value), label: 'Eplerenone for hypertension: sex' },
      { dom: 'mra-scr', arg: 'creatinine', kind: 'number', label: 'Eplerenone for hypertension: serum creatinine', unit: 'mg/dL' },
      { dom: 'mra-alb', arg: 'microalbuminuria', kind: 'enum', values: MR.YES_NO.map((y) => y.value), label: 'Hypertension: type 2 diabetes with microalbuminuria' },
      { dom: 'mra-ksp', arg: 'potassiumSparing', kind: 'enum', values: MR.YES_NO.map((y) => y.value), label: 'Hypertension: potassium supplement or sparing diuretic' },
    ],
  },
];
