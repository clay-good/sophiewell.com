// spec-v183 MCP wave: adapters for the four cardiometabolic formulas in
// lib/cardiometab-v251.js — the corrected TIMI frame count, the Tp-e/QT ratio,
// the single-point insulin sensitivity estimator (SPISE), and the atherogenic
// index of plasma (AIP). dom keys mirror views/group-v251.js.

import * as F from '../../lib/cardiometab-v251.js';

export default [
  {
    id: 'corrected-timi-frame-count',
    summary: 'Corrected TIMI frame count (Gibson 1996): cine frames for contrast to reach the distal landmark, normalized to 30 frames/s and divided by 1.7 for the LAD; higher = slower coronary flow.',
    compute: F.correctedTimiFrameCount,
    fields: [
      { dom: 'ctfc-frames', arg: 'frames', kind: 'number', required: true, label: 'Frame count to distal landmark' },
      { dom: 'ctfc-fps', arg: 'fps', kind: 'number', required: true, label: 'Acquisition frame rate', unit: 'frames/s' },
      { dom: 'ctfc-vessel', arg: 'vessel', kind: 'enum', values: ['other', 'lad'], required: true, label: 'Vessel' },
    ],
  },
  {
    id: 'tpe-qt-ratio',
    summary: 'Tp-e/QT ratio (Gupta 2008): the T-peak-to-T-end interval divided by the QT interval, a marker of transmural dispersion of repolarization; reference ~0.21.',
    compute: F.tpeQtRatio,
    fields: [
      { dom: 'tpe-tpe', arg: 'tpe', kind: 'number', required: true, label: 'Tp-e interval', unit: 'ms' },
      { dom: 'tpe-qt', arg: 'qt', kind: 'number', required: true, label: 'QT interval', unit: 'ms' },
    ],
  },
  {
    id: 'spise',
    summary: 'SPISE (Paulmichl 2016) = 600 x HDL^0.185 / (TG^0.2 x BMI^1.338), lipids in mg/dL; a lower value reflects greater insulin resistance.',
    compute: F.spise,
    fields: [
      { dom: 'spise-hdl', arg: 'hdl', kind: 'number', required: true, label: 'HDL cholesterol', unit: 'mg/dL' },
      { dom: 'spise-tg', arg: 'tg', kind: 'number', required: true, label: 'Triglycerides', unit: 'mg/dL' },
      { dom: 'spise-bmi', arg: 'bmi', kind: 'number', required: true, label: 'BMI', unit: 'kg/m^2' },
    ],
  },
  {
    id: 'atherogenic-index-of-plasma',
    summary: 'Atherogenic index of plasma (Dobiasova 2001) = log10(triglycerides / HDL), both in mmol/L; higher values reflect greater cardiovascular risk.',
    compute: F.atherogenicIndexOfPlasma,
    fields: [
      { dom: 'aip-tg', arg: 'tg', kind: 'number', required: true, label: 'Triglycerides', unit: 'mmol/L' },
      { dom: 'aip-hdl', arg: 'hdl', kind: 'number', required: true, label: 'HDL cholesterol', unit: 'mmol/L' },
    ],
  },
];
