// spec-v183 MCP wave 19: adapters for the five quantitative thyroid /
// beta-cell instruments in lib/endo-quant-v197.js — SPINA-GT (thyroid secretory
// capacity), SPINA-GD (peripheral deiodinase activity), Jostel's TSH index, the
// HOMA-B steady-state beta-cell index, and the oral disposition index (DIo).
// dom keys mirror views/group-v197.js.

import * as F from '../../lib/endo-quant-v197.js';

export default [
  {
    id: 'spina-gt',
    summary: 'SPINA-GT thyroid secretory capacity (Dietrich 2012): a structure-parameter estimate of maximum thyroid hormone output from TSH and free T4; the reference band is ~1.4–8.7 pmol/s.',
    compute: F.spinaGt,
    fields: [
      { dom: 'spinagt-tsh', arg: 'tsh', kind: 'number', required: true, label: 'TSH', unit: 'mU/L' },
      { dom: 'spinagt-ft4', arg: 'ft4', kind: 'number', required: true, label: 'Free T4', unit: 'pmol/L' },
    ],
  },
  {
    id: 'spina-gd',
    summary: 'SPINA-GD peripheral deiodinase activity (Dietrich 2012): a structure-parameter estimate of step-up T4→T3 conversion from free T4 and free T3; the reference band is ~20–60 nmol/s.',
    compute: F.spinaGd,
    fields: [
      { dom: 'spinagd-ft4', arg: 'ft4', kind: 'number', required: true, label: 'Free T4', unit: 'pmol/L' },
      { dom: 'spinagd-ft3', arg: 'ft3', kind: 'number', required: true, label: 'Free T3', unit: 'pmol/L' },
    ],
  },
  {
    id: 'jostel-tsh-index',
    summary: "Jostel's TSH index (Jostel 2009): ln(TSH) + 0.1345 × free T4, with a standardized sTSHI; a low index suggests central (secondary) hypothyroidism. Reference TSHI ~1.3–4.1.",
    compute: F.jostelTshIndex,
    fields: [
      { dom: 'jostel-tsh', arg: 'tsh', kind: 'number', required: true, label: 'TSH', unit: 'mU/L' },
      { dom: 'jostel-ft4', arg: 'ft4', kind: 'number', required: true, label: 'Free T4', unit: 'pmol/L' },
    ],
  },
  {
    id: 'homa-beta',
    summary: 'HOMA-B steady-state beta-cell function (Matthews 1985): 20 × fasting insulin / (fasting glucose − 3.5); ~100% is the reference for beta-cell function.',
    compute: F.homaBeta,
    fields: [
      { dom: 'homab-ins', arg: 'insulin', kind: 'number', required: true, label: 'Fasting insulin', unit: 'mU/L' },
      { dom: 'homab-glu', arg: 'glucose', kind: 'number', required: true, label: 'Fasting glucose', unit: 'mmol/L' },
    ],
  },
  {
    id: 'oral-disposition-index',
    summary: 'Oral disposition index DIo (Utzschneider 2009): the insulinogenic index (ΔI30/ΔG30) times fasting insulin sensitivity (1/I0); a lower value predicts higher future-diabetes risk.',
    compute: F.oralDispositionIndex,
    fields: [
      { dom: 'dio-i0', arg: 'i0', kind: 'number', required: true, label: 'Fasting insulin (I0)', unit: 'mU/L' },
      { dom: 'dio-i30', arg: 'i30', kind: 'number', required: true, label: '30-min insulin (I30)', unit: 'mU/L' },
      { dom: 'dio-g0', arg: 'g0', kind: 'number', required: true, label: 'Fasting glucose (G0)', unit: 'mg/dL' },
      { dom: 'dio-g30', arg: 'g30', kind: 'number', required: true, label: '30-min glucose (G30)', unit: 'mg/dL' },
    ],
  },
];
