// spec-v183 MCP wave 26: adapters for the five nephrology / fluid-and-
// electrolyte instruments in lib/nephro-fluids-v204.js — the calcium/creatinine
// clearance ratio (CCCR), maximum allowable blood loss (ABL), electrolyte-free
// water clearance (EFWC), TmP/GFR (renal phosphate threshold), and the
// urinary-calcium assessment. dom keys mirror views/group-v204.js. ABL's patient
// category, TmP/GFR is all-numeric, and the urine-calcium tool's mode, age band,
// and sex are enums mirroring the renderer selects.

import * as F from '../../lib/nephro-fluids-v204.js';

export default [
  {
    id: 'cccr',
    summary: 'Calcium/creatinine clearance ratio (CCCR): (urine Ca × serum Cr) / (serum Ca × urine Cr); a ratio < 0.01 suggests familial hypocalciuric hypercalcemia versus primary hyperparathyroidism.',
    compute: F.cccr,
    fields: [
      { dom: 'cccr-uca', arg: 'urineCa', kind: 'number', required: true, label: 'Urine calcium (shared mass unit)' },
      { dom: 'cccr-sca', arg: 'serumCa', kind: 'number', required: true, label: 'Serum calcium (shared mass unit)' },
      { dom: 'cccr-scr', arg: 'serumCr', kind: 'number', required: true, label: 'Serum creatinine (shared unit)' },
      { dom: 'cccr-ucr', arg: 'urineCr', kind: 'number', required: true, label: 'Urine creatinine (shared unit)' },
    ],
  },
  {
    id: 'max-allowable-blood-loss',
    summary: 'Maximum allowable blood loss (Gross 1983): estimated blood volume (weight × category factor) times (initial − target hematocrit) / initial; an intraoperative transfusion-planning estimate.',
    compute: F.maxAllowableBloodLoss,
    fields: [
      { dom: 'abl-cat', arg: 'category', kind: 'enum', values: ['neonate', 'infant', 'child', 'adult-male', 'adult-female'], required: true, label: 'Patient category (blood-volume factor)' },
      { dom: 'abl-weight', arg: 'weight', kind: 'number', required: true, label: 'Weight', unit: 'kg' },
      { dom: 'abl-hcti', arg: 'hctInitial', kind: 'number', required: true, label: 'Initial hematocrit (%) or hemoglobin (g/dL)' },
      { dom: 'abl-hctf', arg: 'hctTarget', kind: 'number', required: true, label: 'Target (minimum acceptable) hematocrit or hemoglobin (same measure)' },
    ],
  },
  {
    id: 'efw-clearance',
    summary: 'Electrolyte-free water clearance (Rose 1986): urine volume × [1 − (urine Na + urine K) / plasma Na]; a positive value means the kidney is excreting free water, a negative value means net free-water retention.',
    compute: F.efwClearance,
    fields: [
      { dom: 'efwc-una', arg: 'urineNa', kind: 'number', required: true, label: 'Urine sodium', unit: 'mEq/L' },
      { dom: 'efwc-uk', arg: 'urineK', kind: 'number', required: true, label: 'Urine potassium', unit: 'mEq/L' },
      { dom: 'efwc-pna', arg: 'plasmaNa', kind: 'number', required: true, label: 'Plasma sodium', unit: 'mEq/L' },
      { dom: 'efwc-vol', arg: 'urineVolume', kind: 'number', required: true, label: 'Urine volume over the interval', unit: 'mL' },
    ],
  },
  {
    id: 'tmp-gfr',
    summary: 'TmP/GFR renal phosphate threshold (Payne 1998): tubular reabsorption of phosphate (1 − urine P × serum Cr / (serum P × urine Cr)) times serum P, using the Payne hyperbolic branch when TRP > 0.86; a low value marks renal phosphate wasting.',
    compute: F.tmpGfr,
    fields: [
      { dom: 'tmp-sp', arg: 'serumP', kind: 'number', required: true, label: 'Serum phosphate (shared phosphate unit)' },
      { dom: 'tmp-up', arg: 'urineP', kind: 'number', required: true, label: 'Urine phosphate (shared phosphate unit)' },
      { dom: 'tmp-scr', arg: 'serumCr', kind: 'number', required: true, label: 'Serum creatinine (shared creatinine unit)' },
      { dom: 'tmp-ucr', arg: 'urineCr', kind: 'number', required: true, label: 'Urine creatinine (shared creatinine unit)' },
    ],
  },
  {
    id: 'urine-calcium-cr',
    summary: 'Urinary-calcium assessment (StatPearls; Sargent 1993 for infants): the calciuria step in the nephrolithiasis / hypercalciuria workup, either a spot Ca/Cr ratio against age-band thresholds or a 24-hour excretion against sex/weight thresholds.',
    compute: F.urineCalcium,
    fields: [
      { dom: 'uca-mode', arg: 'mode', kind: 'enum', values: ['spot', 'day'], required: true, label: 'Mode (spot ratio or 24-hour excretion)' },
      { dom: 'uca-uca', arg: 'urineCa', kind: 'number', required: false, label: 'Urine calcium (spot; same mass unit as creatinine)' },
      { dom: 'uca-ucr', arg: 'urineCr', kind: 'number', required: false, label: 'Urine creatinine (spot; same mass unit as calcium)' },
      { dom: 'uca-age', arg: 'ageBand', kind: 'enum', values: ['adult', 'infant-lt7mo', 'infant-7to18mo', 'child-19moTo6y'], required: false, label: 'Age band (spot)' },
      { dom: 'uca-24h', arg: 'calcium24h', kind: 'number', required: false, label: '24-hour urine calcium', unit: 'mg/day' },
      { dom: 'uca-wt', arg: 'weight', kind: 'number', required: false, label: 'Body weight (24-hour)', unit: 'kg' },
      { dom: 'uca-sex', arg: 'sex', kind: 'enum', values: ['female', 'male'], required: false, label: 'Sex (24-hour)' },
    ],
  },
];
