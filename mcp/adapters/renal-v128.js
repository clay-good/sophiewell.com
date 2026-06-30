// spec-v183 MCP wave 6: adapters for the five lib/renal-v128.js renal-physiology
// formulas (fractional excretion of phosphate and magnesium, the normalized
// protein catabolic rate, the standard Kt/V, and electrolyte-free water
// clearance). dom keys mirror views/group-v128.js; every input is a continuous
// number.

import * as F from '../../lib/renal-v128.js';

export default [
  {
    id: 'fepo4',
    summary: 'Fractional excretion of phosphate: FEPO4 = (urine PO4 x plasma Cr) / (plasma PO4 x urine Cr) x 100; above ~5% in hypophosphatemia indicates renal phosphate wasting.',
    compute: F.fepo4,
    fields: [
      { dom: 'fp-up', arg: 'urinePhos', kind: 'number', required: true, label: 'Urine phosphate', unit: 'mg/dL' },
      { dom: 'fp-pp', arg: 'plasmaPhos', kind: 'number', required: true, label: 'Plasma phosphate', unit: 'mg/dL' },
      { dom: 'fp-uc', arg: 'urineCr', kind: 'number', required: true, label: 'Urine creatinine', unit: 'mg/dL' },
      { dom: 'fp-pc', arg: 'plasmaCr', kind: 'number', required: true, label: 'Plasma creatinine', unit: 'mg/dL' },
    ],
  },
  {
    id: 'femg',
    summary: 'Fractional excretion of magnesium: FEMg = (urine Mg x plasma Cr) / (0.7 x plasma Mg x urine Cr) x 100; above ~2% (Elisaf cutoff ~4%) in hypomagnesemia indicates renal magnesium wasting.',
    compute: F.femg,
    fields: [
      { dom: 'fm-um', arg: 'urineMg', kind: 'number', required: true, label: 'Urine magnesium', unit: 'mg/dL' },
      { dom: 'fm-pm', arg: 'plasmaMg', kind: 'number', required: true, label: 'Plasma magnesium', unit: 'mg/dL' },
      { dom: 'fm-uc', arg: 'urineCr', kind: 'number', required: true, label: 'Urine creatinine', unit: 'mg/dL' },
      { dom: 'fm-pc', arg: 'plasmaCr', kind: 'number', required: true, label: 'Plasma creatinine', unit: 'mg/dL' },
    ],
  },
  {
    id: 'npcr-pna',
    summary: 'Normalized protein catabolic rate (nPCR / nPNA) from the interdialytic BUN rise: a surrogate of dietary protein intake in g/kg/day against the ~1.0-1.2 g/kg/day nutrition target.',
    compute: F.npcrPna,
    fields: [
      { dom: 'np-post', arg: 'postBun', kind: 'number', required: true, label: 'Post-dialysis BUN', unit: 'mg/dL' },
      { dom: 'np-pre', arg: 'preBun', kind: 'number', required: true, label: 'Pre-dialysis BUN (next session)', unit: 'mg/dL' },
      { dom: 'np-hr', arg: 'hours', kind: 'number', required: true, label: 'Interdialytic interval', unit: 'hours' },
    ],
  },
  {
    id: 'std-ktv',
    summary: 'Standard (weekly) Kt/V via the Leypoldt / Daugirdas equilibrated conversion from single-pool Kt/V, session length, and weekly frequency, against the >= 2.1/week adequacy target.',
    compute: F.stdKtv,
    fields: [
      { dom: 'sk-sp', arg: 'spKtv', kind: 'number', required: true, label: 'Single-pool Kt/V' },
      { dom: 'sk-min', arg: 'minutes', kind: 'number', required: true, label: 'Session length', unit: 'minutes' },
      { dom: 'sk-n', arg: 'sessions', kind: 'number', required: true, label: 'Sessions per week' },
    ],
  },
  {
    id: 'efwc',
    summary: 'Electrolyte-free water clearance: EFWC = urine volume x (1 - (urine Na + urine K) / plasma Na); positive means net free-water excretion (raises plasma sodium), negative means retention.',
    compute: F.efwc,
    fields: [
      { dom: 'ef-vol', arg: 'volume', kind: 'number', required: true, label: 'Urine volume', unit: 'L' },
      { dom: 'ef-una', arg: 'urineNa', kind: 'number', required: true, label: 'Urine sodium', unit: 'mEq/L' },
      { dom: 'ef-uk', arg: 'urineK', kind: 'number', required: true, label: 'Urine potassium', unit: 'mEq/L' },
      { dom: 'ef-pna', arg: 'plasmaNa', kind: 'number', required: true, label: 'Plasma sodium', unit: 'mEq/L' },
    ],
  },
];
