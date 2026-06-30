// spec-v183: adapters for the six lib/acidbase-v129.js acid-base tiles. dom keys
// mirror views/group-v129.js and META.example.fields; arg names mirror the lib
// signatures. The acute/chronic selects map to the lib's boolean `chronic` arg
// via a per-field `to` transform (exactly as the renderer does).

import * as M from '../../lib/acidbase-v129.js';

const ACUTE_CHRONIC = ['acute', 'chronic'];

export default [
  {
    id: 'stewart-sid-sig',
    summary: 'Stewart strong ion difference / strong ion gap (Stewart 1983; Figge 1992): the unmeasured-anion burden from a full electrolyte panel.',
    compute: M.stewartSidSig,
    fields: [
      { dom: 'ss-na', arg: 'sodium', kind: 'number', required: true, label: 'Sodium', unit: 'mEq/L' },
      { dom: 'ss-k', arg: 'potassium', kind: 'number', required: true, label: 'Potassium', unit: 'mEq/L' },
      { dom: 'ss-ca', arg: 'calcium', kind: 'number', required: true, label: 'Ionized calcium', unit: 'mEq/L' },
      { dom: 'ss-mg', arg: 'magnesium', kind: 'number', required: true, label: 'Ionized magnesium', unit: 'mEq/L' },
      { dom: 'ss-cl', arg: 'chloride', kind: 'number', required: true, label: 'Chloride', unit: 'mEq/L' },
      { dom: 'ss-lac', arg: 'lactate', kind: 'number', required: true, label: 'Lactate', unit: 'mEq/L' },
      { dom: 'ss-hco3', arg: 'bicarbonate', kind: 'number', required: true, label: 'Bicarbonate', unit: 'mEq/L' },
      { dom: 'ss-alb', arg: 'albumin', kind: 'number', required: true, label: 'Albumin', unit: 'g/dL' },
      { dom: 'ss-phos', arg: 'phosphate', kind: 'number', required: true, label: 'Phosphate', unit: 'mg/dL' },
    ],
  },
  {
    id: 'base-excess',
    summary: 'Standard base excess (Siggaard-Andersen Van Slyke equation, NCCLS constants): the hemoglobin-corrected metabolic component of a blood gas.',
    compute: M.baseExcess,
    fields: [
      { dom: 'be-ph', arg: 'ph', kind: 'number', required: true, label: 'Arterial pH' },
      { dom: 'be-hco3', arg: 'bicarbonate', kind: 'number', required: true, label: 'Bicarbonate', unit: 'mEq/L' },
      { dom: 'be-hb', arg: 'hemoglobin', kind: 'number', required: true, label: 'Hemoglobin', unit: 'g/dL' },
    ],
  },
  {
    id: 'resp-acidosis-compensation',
    summary: 'Expected HCO3 in respiratory acidosis (Brackett 1965 acute; Schwartz 1965 chronic): the appropriate-compensation band vs the measured HCO3.',
    compute: M.respAcidosisCompensation,
    fields: [
      { dom: 'ra-paco2', arg: 'paco2', kind: 'number', required: true, label: 'Measured PaCO2', unit: 'mmHg' },
      { dom: 'ra-hco3', arg: 'bicarbonate', kind: 'number', required: true, label: 'Measured HCO3', unit: 'mEq/L' },
      { dom: 'ra-ch', arg: 'chronic', kind: 'enum', values: ACUTE_CHRONIC, label: 'Acute or chronic', to: (v) => v === 'chronic' },
    ],
  },
  {
    id: 'resp-alkalosis-compensation',
    summary: 'Expected HCO3 in respiratory alkalosis (Gennari 1972): the appropriate-compensation band vs the measured HCO3.',
    compute: M.respAlkalosisCompensation,
    fields: [
      { dom: 'rl-paco2', arg: 'paco2', kind: 'number', required: true, label: 'Measured PaCO2', unit: 'mmHg' },
      { dom: 'rl-hco3', arg: 'bicarbonate', kind: 'number', required: true, label: 'Measured HCO3', unit: 'mEq/L' },
      { dom: 'rl-ch', arg: 'chronic', kind: 'enum', values: ACUTE_CHRONIC, label: 'Acute or chronic', to: (v) => v === 'chronic' },
    ],
  },
  {
    id: 'met-alkalosis-compensation',
    summary: 'Expected PaCO2 in metabolic alkalosis (Narins-Emmett 1980): the respiratory-compensation band vs the measured PaCO2.',
    compute: M.metAlkalosisCompensation,
    fields: [
      { dom: 'ma-hco3', arg: 'bicarbonate', kind: 'number', required: true, label: 'Measured HCO3', unit: 'mEq/L' },
      { dom: 'ma-paco2', arg: 'paco2', kind: 'number', required: true, label: 'Measured PaCO2', unit: 'mmHg' },
    ],
  },
  {
    id: 'urine-osmolal-gap',
    summary: 'Urine osmolal gap (Halperin 1988): the urinary ammonium estimate that separates extrarenal from renal non-anion-gap acidosis.',
    compute: M.urineOsmolalGap,
    fields: [
      { dom: 'uo-meas', arg: 'measuredOsm', kind: 'number', required: true, label: 'Measured urine osmolality', unit: 'mOsm/kg' },
      { dom: 'uo-na', arg: 'urineNa', kind: 'number', required: true, label: 'Urine sodium', unit: 'mEq/L' },
      { dom: 'uo-k', arg: 'urineK', kind: 'number', required: true, label: 'Urine potassium', unit: 'mEq/L' },
      { dom: 'uo-urea', arg: 'urineUrea', kind: 'number', required: true, label: 'Urine urea nitrogen', unit: 'mg/dL' },
      { dom: 'uo-glu', arg: 'urineGlucose', kind: 'number', required: true, label: 'Urine glucose', unit: 'mg/dL' },
    ],
  },
];
