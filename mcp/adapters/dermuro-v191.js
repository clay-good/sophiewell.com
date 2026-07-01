// spec-v183 MCP wave 9: adapters for the four instruments in lib/dermuro-v191.js
// — SCORTEN toxic-epidermal-necrolysis mortality, the AJCC 8th-edition melanoma
// T category, PI-RADS v2.1 prostate-MRI assessment, and the Guy's stone score
// for PCNL complexity. The PI-RADS DWI/T2W and Guy's-grade selects are numeric
// strings coerced as numbers. dom keys mirror views/group-v191.js.

import * as F from '../../lib/dermuro-v191.js';

export default [
  {
    id: 'scorten',
    summary: 'SCORTEN severity-of-illness score for toxic epidermal necrolysis / Stevens-Johnson syndrome: seven bedside risk factors mapping to a predicted mortality band.',
    compute: F.scorten,
    fields: [
      { dom: 'scorten-age', arg: 'age', kind: 'number', required: false, label: 'Age', unit: 'years' },
      { dom: 'scorten-heartRate', arg: 'heartRate', kind: 'number', required: false, label: 'Heart rate', unit: 'bpm' },
      { dom: 'scorten-bsaDetached', arg: 'bsaDetached', kind: 'number', required: false, label: 'Body surface area detached', unit: '%' },
      { dom: 'scorten-bun', arg: 'bun', kind: 'number', required: false, label: 'BUN', unit: 'mg/dL' },
      { dom: 'scorten-bicarbonate', arg: 'bicarbonate', kind: 'number', required: false, label: 'Serum bicarbonate', unit: 'mEq/L' },
      { dom: 'scorten-glucose', arg: 'glucose', kind: 'number', required: false, label: 'Serum glucose', unit: 'mg/dL' },
      { dom: 'scorten-malignancy', arg: 'malignancy', kind: 'bool', required: false, label: 'Associated malignancy' },
    ],
  },
  {
    id: 'melanoma-t-stage',
    summary: 'AJCC 8th-edition cutaneous-melanoma T category from Breslow thickness (with the 0.8 mm split) and ulceration — the a/b suffix and T element only.',
    compute: F.melanomaTStage,
    fields: [
      { dom: 'melt-breslow', arg: 'breslow', kind: 'number', required: true, label: 'Breslow thickness', unit: 'mm' },
      { dom: 'melt-ulceration', arg: 'ulceration', kind: 'bool', required: false, label: 'Ulceration present' },
    ],
  },
  {
    id: 'pi-rads',
    summary: 'PI-RADS v2.1 prostate-MRI assessment category (1–5) from the zone-specific dominant sequence (DWI in the peripheral zone, T2W in the transition zone) and the DCE upgrade rule.',
    compute: F.piRads,
    fields: [
      { dom: 'pirads-zone', arg: 'zone', kind: 'enum', values: ['peripheral', 'transition'], required: true, label: 'Zone of the dominant lesion' },
      { dom: 'pirads-dwi', arg: 'dwi', kind: 'number', required: false, label: 'DWI/ADC score (1–5)' },
      { dom: 'pirads-t2w', arg: 't2w', kind: 'number', required: false, label: 'T2W score (1–5)' },
      { dom: 'pirads-dce', arg: 'dce', kind: 'enum', values: ['negative', 'positive'], required: false, label: 'DCE (dynamic contrast enhancement)' },
    ],
  },
  {
    id: 'guys-stone-score',
    summary: "Guy's stone score (Grade I–IV) for percutaneous-nephrolithotomy complexity, with the expected stone-free rate by grade.",
    compute: F.guysStoneScore,
    fields: [
      { dom: 'guys-grade', arg: 'grade', kind: 'number', required: true, label: 'Stone configuration / anatomy grade (1–4)' },
    ],
  },
];
