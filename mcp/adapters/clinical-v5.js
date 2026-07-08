// spec-v183 MCP wave 54: adapters for lib/clinical-v5.js - sodium correction,
// free-water deficit, ARDSNet predicted body weight, RSBI, albumin-corrected
// anion gap, and the Ganzoni total iron deficit. dom keys mirror the renderers.

import * as F from '../../lib/clinical-v5.js';

export default [
  {
    id: 'sodium-correction',
    summary: 'Hyponatremia/hypernatremia sodium-correction planner (Adrogue-Madias): TBW, infusate dNa per liter, target rate with safety-cap ceiling.',
    // Echo the chosen infusate's saline percentage so the JSON names the fluid.
    compute: (a) => {
      const r = F.sodiumCorrection(a);
      if (r == null) return r;
      const pct = { '3pct-saline': 3, '0.9-saline': 0.9, '0.45-saline': 0.45 }[a.infusate];
      return pct == null ? r : { ...r, infusateSalinePercent: pct };
    },
    fields: [
      { dom: 'w', arg: 'weightKg', kind: 'number', required: true, label: 'Weight', unit: 'kg' },
      { dom: 'sex', arg: 'sex', kind: 'enum', values: ['M', 'F'], required: true, label: 'Sex' },
      { dom: 'na', arg: 'currentNa', kind: 'number', required: true, label: 'Current serum Na', unit: 'mEq/L' },
      { dom: 'infusate', arg: 'infusate', kind: 'enum', values: ['3pct-saline', '0.9-saline', '0.45-saline', 'lr', 'd5w'], required: true, label: 'Infusate' },
      { dom: 'tgt', arg: 'targetChangePer24h', kind: 'number', required: true, label: 'Target change in 24 h', unit: 'mEq/L' },
      { dom: 'acuity', arg: 'acuity', kind: 'enum', values: ['chronic', 'acute'], required: false, label: 'Acuity' },
    ],
  },
  {
    id: 'free-water-deficit',
    summary: 'Free water deficit for hypernatremia: TBW*(currentNa/targetNa - 1), replacement rate with 10 mEq/L/24h safety cap.',
    // Echo the replacement window so the rate is interpretable.
    compute: (a) => {
      const r = F.freeWaterDeficit(a);
      return r == null ? r : { ...r, replaceOverHours: a.replaceOverHours };
    },
    fields: [
      { dom: 'w', arg: 'weightKg', kind: 'number', required: true, label: 'Weight', unit: 'kg' },
      { dom: 'sex', arg: 'sex', kind: 'enum', values: ['M', 'F'], required: true, label: 'Sex' },
      { dom: 'na', arg: 'currentNa', kind: 'number', required: true, label: 'Current serum Na', unit: 'mEq/L' },
      { dom: 'tgt', arg: 'targetNa', kind: 'number', required: true, label: 'Target Na', unit: 'mEq/L' },
      { dom: 'hrs', arg: 'replaceOverHours', kind: 'number', required: true, label: 'Replace over', unit: 'hours' },
    ],
  },
  {
    id: 'pbw-ardsnet',
    summary: 'Predicted body weight (Devine) and ARDSnet lung-protective tidal-volume target (default 6 mL/kg PBW, range 4-8).',
    compute: F.pbwArdsnet,
    fields: [
      { dom: 'h', arg: 'heightCm', kind: 'number', required: true, label: 'Height', unit: 'cm' },
      { dom: 'sex', arg: 'sex', kind: 'enum', values: ['M', 'F'], required: true, label: 'Sex' },
      { dom: 'mlkg', arg: 'mlPerKg', kind: 'number', required: true, label: 'Target Vt', unit: 'mL/kg PBW' },
    ],
  },
  {
    id: 'rsbi',
    summary: 'Rapid shallow breathing index = respiratory rate / tidal volume(L); <105 predicts extubation success.',
    compute: F.rsbi,
    fields: [
      { dom: 'rr', arg: 'respiratoryRate', kind: 'number', required: true, label: 'Respiratory rate', unit: 'breaths/min' },
      { dom: 'vt', arg: 'tidalVolumeMl', kind: 'number', required: true, label: 'Tidal volume', unit: 'mL' },
    ],
  },
  {
    id: 'corrected-anion-gap',
    summary: 'Albumin-corrected anion gap (Figge): AG + 2.5*(4.0 - albumin), with optional potassium inclusion.',
    compute: F.correctedAnionGap,
    fields: [
      { dom: 'na', arg: 'na', kind: 'number', required: true, label: 'Sodium', unit: 'mEq/L' },
      { dom: 'cl', arg: 'cl', kind: 'number', required: true, label: 'Chloride', unit: 'mEq/L' },
      { dom: 'hco3', arg: 'hco3', kind: 'number', required: true, label: 'Bicarbonate', unit: 'mEq/L' },
      { dom: 'alb', arg: 'albuminGdl', kind: 'number', required: true, label: 'Albumin', unit: 'g/dL' },
    ],
  },
  {
    id: 'iron-ganzoni',
    summary: 'Ganzoni 1970 total iron deficit: weight x (target Hb - current Hb) x 2.4 + iron stores (default stores applied when no override given).',
    compute: F.ironDeficitGanzoni,
    fields: [
      { dom: 'w', arg: 'weightKg', kind: 'number', required: true, label: 'Weight', unit: 'kg' },
      { dom: 'hb', arg: 'currentHb', kind: 'number', required: true, label: 'Current Hb', unit: 'g/dL' },
      { dom: 'tgt', arg: 'targetHb', kind: 'number', required: true, label: 'Target Hb', unit: 'g/dL' },
      { dom: 'stores', arg: 'ironStoresMg', kind: 'number', required: false, label: 'Iron stores override', unit: 'mg' },
    ],
  },
];
