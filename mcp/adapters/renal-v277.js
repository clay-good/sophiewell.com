// spec-v277 MCP wave (eighty-fourth): adapter for the measured (timed-urine)
// creatinine clearance in lib/renal-v277.js — the direct C = (U x V) / P
// clearance from a timed collection, distinct from the Cockcroft-Gault estimate.
// dom keys mirror the browser renderer and META['measured-crcl'].example.fields.

import * as F from '../../lib/renal-v277.js';

export default [
  {
    id: 'measured-crcl',
    summary: 'Measured (timed-urine) creatinine clearance (Stevens/Levey 2009 review) = (urine creatinine x urine volume) / (serum creatinine x collection time in minutes); the direct C = (U x V) / P clearance in mL/min, not BSA-normalized.',
    compute: F.measuredCrcl,
    fields: [
      { dom: 'mcrcl-ucr', arg: 'urineCr', kind: 'number', required: true, label: 'Urine creatinine', unit: 'mg/dL' },
      { dom: 'mcrcl-uvol', arg: 'urineVolume', kind: 'number', required: true, label: 'Urine volume', unit: 'mL' },
      { dom: 'mcrcl-scr', arg: 'serumCr', kind: 'number', required: true, label: 'Serum creatinine', unit: 'mg/dL' },
      { dom: 'mcrcl-hours', arg: 'hours', kind: 'number', required: true, label: 'Collection time', unit: 'hours' },
    ],
  },
];
