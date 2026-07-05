// spec-v183 MCP wave: adapters for the five cardiology ECG / echo bedside
// calculators in lib/cardioecho-v237.js — the Romhilt-Estes LVH point score, the
// Wilkins mitral-valve echo score, the mitral valve area by pressure half-time,
// the aortic dimensionless index, and the rate-pressure product. dom keys mirror
// views/group-v237.js; Romhilt-Estes uses checkboxes plus a 0/1/3 strain select.

import * as F from '../../lib/cardioecho-v237.js';

export default [
  {
    id: 'romhilt-estes',
    summary: 'Romhilt-Estes LVH point score (1968): voltage 3, ST-T strain 3 (1 on digitalis), LA abnormality 3, left axis 2, QRS 1, intrinsicoid deflection 1; >= 5 definite LVH, 4 probable.',
    compute: F.romhiltEstes,
    fields: [
      { dom: 're-volt', arg: 'voltage', kind: 'bool', required: true, label: 'Voltage criterion met (3)' },
      { dom: 're-stt', arg: 'strain', kind: 'number', required: true, label: 'ST-T strain pattern (0/3/1)' },
      { dom: 're-la', arg: 'laAbnormality', kind: 'bool', required: false, label: 'Left atrial abnormality (3)' },
      { dom: 're-lad', arg: 'leftAxis', kind: 'bool', required: false, label: 'Left axis deviation >= -30 deg (2)' },
      { dom: 're-qrs', arg: 'qrs', kind: 'bool', required: false, label: 'QRS duration >= 90 ms (1)' },
      { dom: 're-intr', arg: 'intrinsicoid', kind: 'bool', required: false, label: 'Intrinsicoid deflection V5/V6 >= 50 ms (1)' },
    ],
  },
  {
    id: 'wilkins-score',
    summary: 'Wilkins mitral-valve echo score (1988): leaflet mobility + thickening + calcification + subvalvular thickening, each 1-4 (total 4-16); <= 8 favorable for percutaneous balloon mitral valvuloplasty.',
    compute: F.wilkinsScore,
    fields: [
      { dom: 'wk-mob', arg: 'mobility', kind: 'number', required: true, label: 'Leaflet mobility (1-4)' },
      { dom: 'wk-thick', arg: 'thickening', kind: 'number', required: true, label: 'Leaflet thickening (1-4)' },
      { dom: 'wk-calc', arg: 'calcification', kind: 'number', required: true, label: 'Leaflet calcification (1-4)' },
      { dom: 'wk-sub', arg: 'subvalvular', kind: 'number', required: true, label: 'Subvalvular thickening (1-4)' },
    ],
  },
  {
    id: 'mitral-valve-area-pht',
    summary: 'Mitral valve area by pressure half-time (Hatle 1979) = 220 / pressure half-time (ms); > 1.5 cm^2 mild, 1.0-1.5 moderate, < 1.0 severe mitral stenosis.',
    compute: F.mitralValveAreaPht,
    fields: [
      { dom: 'mva-pht', arg: 'pht', kind: 'number', required: true, label: 'Pressure half-time', unit: 'ms' },
    ],
  },
  {
    id: 'aortic-dvi',
    summary: 'Aortic dimensionless index = LVOT VTI / aortic-valve VTI (or peak velocities); <= 0.25 severe aortic stenosis, 0.25-0.50 moderate, > 0.50 mild.',
    compute: F.aorticDvi,
    fields: [
      { dom: 'dvi-lvot', arg: 'lvot', kind: 'number', required: true, label: 'LVOT VTI (or peak velocity)' },
      { dom: 'dvi-av', arg: 'av', kind: 'number', required: true, label: 'Aortic-valve VTI (or peak velocity)' },
    ],
  },
  {
    id: 'rate-pressure-product',
    summary: 'Rate-pressure product = heart rate (bpm) x systolic BP (mmHg); a surrogate for myocardial oxygen demand.',
    compute: F.ratePressureProduct,
    fields: [
      { dom: 'rpp-hr', arg: 'hr', kind: 'number', required: true, label: 'Heart rate', unit: 'bpm' },
      { dom: 'rpp-sbp', arg: 'sbp', kind: 'number', required: true, label: 'Systolic BP', unit: 'mmHg' },
    ],
  },
];
