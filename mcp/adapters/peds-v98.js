// spec-v183 MCP wave 14: adapters for two lib/peds-v98.js pediatric tiles. dom
// keys mirror views/group-v24.js; arg names mirror the lib signatures. Kocher
// predictors and the PIM3 pupils / ventilation / elective flags are booleans;
// PIM3 recovery and diagnosis-risk axes are enums; labs are numbers.
//
// kawasaki-criteria and catch-head joined in wave 53 with a bespoke toArgs:
// their principal / supplementary / high- / medium-risk features arrive as
// variable-length key arrays, which the adapter rebuilds from flat per-feature
// boolean fields (keys read from the lib's own feature lists so they can never
// drift), keeping the agent contract flat.

import * as F from '../../lib/peds-v98.js';

// Flat boolean field per feature, generated from the lib's own key lists.
const boolField = (dom, key, label) => ({ dom, arg: key, kind: 'bool', label });
const KAW_PRINCIPAL = F.KAWASAKI_PRINCIPAL_FEATURES.map((f) => boolField(`kaw-p-${f.key}`, f.key, f.label));
const KAW_SUPPLEMENTARY = F.KAWASAKI_SUPPLEMENTARY_CRITERIA.map((f) => boolField(`kaw-s-${f.key}`, f.key, f.label));
const CATCH_HIGH = F.CATCH_HIGH_RISK.map((f) => boolField(`catch-h-${f.key}`, f.key, f.label));
const CATCH_MEDIUM = F.CATCH_MEDIUM_RISK.map((f) => boolField(`catch-m-${f.key}`, f.key, f.label));
const isOn = (v) => v === true || v === 1 || v === '1' || v === 'true' || v === 'yes';
const checkedKeys = (fields, inputs) => fields.filter((f) => isOn(inputs[f.dom])).map((f) => f.arg);

export default [
  {
    id: 'kawasaki-criteria',
    summary: 'Kawasaki disease criteria (AHA 2017): fever ≥ 5 days + ≥ 4 of 5 principal features = classic KD; the incomplete-KD pathway uses CRP/ESR and supplementary labs when 2-3 features are present.',
    compute: F.kawasakiCriteria,
    fields: [
      { dom: 'kaw-fever', arg: 'feverDays', kind: 'number', required: true, label: 'Fever duration', unit: 'days' },
      ...KAW_PRINCIPAL,
      { dom: 'kaw-crp', arg: 'crp', kind: 'number', label: 'CRP', unit: 'mg/dL' },
      { dom: 'kaw-esr', arg: 'esr', kind: 'number', label: 'ESR', unit: 'mm/hr' },
      ...KAW_SUPPLEMENTARY,
      { dom: 'kaw-echo', arg: 'echoPositive', kind: 'bool', label: 'Echocardiogram positive for coronary involvement' },
    ],
    toArgs(inputs) {
      return {
        feverDays: inputs['kaw-fever'] === '' || inputs['kaw-fever'] == null ? null : Number(inputs['kaw-fever']),
        principal: checkedKeys(KAW_PRINCIPAL, inputs),
        crp: inputs['kaw-crp'] === '' || inputs['kaw-crp'] == null ? undefined : Number(inputs['kaw-crp']),
        esr: inputs['kaw-esr'] === '' || inputs['kaw-esr'] == null ? undefined : Number(inputs['kaw-esr']),
        supplementary: checkedKeys(KAW_SUPPLEMENTARY, inputs),
        echoPositive: isOn(inputs['kaw-echo']),
      };
    },
  },
  {
    id: 'catch-head',
    summary: 'CATCH rule (Osmond 2010): CT of the head in a child with minor head injury is indicated if any high-risk factor (need for neurosurgery) or medium-risk factor (brain injury on CT) is present.',
    compute: F.catchHead,
    fields: [...CATCH_HIGH, ...CATCH_MEDIUM],
    toArgs(inputs) {
      return { high: checkedKeys(CATCH_HIGH, inputs), medium: checkedKeys(CATCH_MEDIUM, inputs) };
    },
  },
  {
    id: 'kocher-criteria',
    summary: 'Kocher criteria (Kocher 1999): non-weight-bearing, fever, ESR > 40, and WBC > 12 predict the probability of septic arthritis of the hip in a child.',
    compute: F.kocherCriteria,
    fields: [
      { dom: 'koch-nwb', arg: 'nonWeightBearing', kind: 'bool', label: 'Non-weight-bearing' },
      { dom: 'koch-fever', arg: 'fever', kind: 'bool', label: 'Fever > 38.5 °C' },
      { dom: 'koch-esr', arg: 'esr', kind: 'bool', label: 'ESR > 40 mm/hr' },
      { dom: 'koch-wbc', arg: 'wbc', kind: 'bool', label: 'WBC > 12 ×10⁹/L' },
    ],
  },
  {
    id: 'pim3',
    summary: 'Pediatric Index of Mortality 3 (Straney 2013): a logistic PICU mortality model from SBP, pupils, oxygenation (FiO2, PaO2), base excess, ventilation, elective/recovery status, and diagnosis-risk category.',
    compute: F.pim3,
    fields: [
      { dom: 'pim-sbp', arg: 'sbp', kind: 'number', label: 'Systolic blood pressure (mmHg)' },
      { dom: 'pim-pupils', arg: 'pupilsFixed', kind: 'bool', label: 'Both pupils > 3 mm and fixed' },
      { dom: 'pim-fio2', arg: 'fio2', kind: 'number', label: 'FiO2 (fraction) — if ventilated' },
      { dom: 'pim-pao2', arg: 'paO2', kind: 'number', label: 'PaO2 (mmHg) — if ventilated' },
      { dom: 'pim-be', arg: 'baseExcess', kind: 'number', label: 'Base excess (mmol/L)' },
      { dom: 'pim-vent', arg: 'mechVent', kind: 'bool', label: 'Mechanical ventilation in the first hour' },
      { dom: 'pim-elective', arg: 'elective', kind: 'bool', label: 'Elective admission' },
      { dom: 'pim-recovery', arg: 'recovery', kind: 'enum', values: ['none', 'bypass-cardiac', 'nonbypass-cardiac', 'noncardiac'], label: 'Recovery from procedure' },
      { dom: 'pim-risk', arg: 'riskCategory', kind: 'enum', values: ['none', 'low', 'high', 'very-high'], label: 'Diagnosis risk category' },
    ],
  },
];
