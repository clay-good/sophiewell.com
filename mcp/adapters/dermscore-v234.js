// spec-v183 MCP wave: adapters for the four dermatology scoring indices in
// lib/dermscore-v234.js — the Melasma Area and Severity Index (MASI), the
// Severity of Alopecia Tool (SALT), the Nail Psoriasis Severity Index (NAPSI,
// per target nail), and the Vancouver Scar Scale (VSS). dom keys mirror
// views/group-v234.js; every input is a numeric severity grade.

import * as F from '../../lib/dermscore-v234.js';

export default [
  {
    id: 'masi',
    summary: 'Melasma Area and Severity Index (Kimbrough-Green 1994): forehead, right malar, left malar (each x 0.3) and chin (x 0.1), scoring Area (0-6) and Darkness + Homogeneity (0-4) per region; range 0-48, higher = more severe.',
    compute: F.masi,
    fields: [
      { dom: 'masi-fA', arg: 'fA', kind: 'number', required: true, label: 'Forehead — Area (0-6)' },
      { dom: 'masi-fD', arg: 'fD', kind: 'number', required: true, label: 'Forehead — Darkness (0-4)' },
      { dom: 'masi-fH', arg: 'fH', kind: 'number', required: true, label: 'Forehead — Homogeneity (0-4)' },
      { dom: 'masi-rmrA', arg: 'rmrA', kind: 'number', required: true, label: 'Right malar — Area (0-6)' },
      { dom: 'masi-rmrD', arg: 'rmrD', kind: 'number', required: true, label: 'Right malar — Darkness (0-4)' },
      { dom: 'masi-rmrH', arg: 'rmrH', kind: 'number', required: true, label: 'Right malar — Homogeneity (0-4)' },
      { dom: 'masi-lmrA', arg: 'lmrA', kind: 'number', required: true, label: 'Left malar — Area (0-6)' },
      { dom: 'masi-lmrD', arg: 'lmrD', kind: 'number', required: true, label: 'Left malar — Darkness (0-4)' },
      { dom: 'masi-lmrH', arg: 'lmrH', kind: 'number', required: true, label: 'Left malar — Homogeneity (0-4)' },
      { dom: 'masi-mA', arg: 'mA', kind: 'number', required: true, label: 'Chin — Area (0-6)' },
      { dom: 'masi-mD', arg: 'mD', kind: 'number', required: true, label: 'Chin — Darkness (0-4)' },
      { dom: 'masi-mH', arg: 'mH', kind: 'number', required: true, label: 'Chin — Homogeneity (0-4)' },
    ],
  },
  {
    id: 'salt-score',
    summary: 'Severity of Alopecia Tool (Olsen 2004): % terminal hair loss per scalp region weighted top 0.40, back 0.24, right 0.18, left 0.18; range 0-100 with S0-S5 bands.',
    compute: F.saltScore,
    fields: [
      { dom: 'salt-top', arg: 'top', kind: 'number', required: true, label: 'Top of scalp — % hair loss', unit: '%' },
      { dom: 'salt-back', arg: 'back', kind: 'number', required: true, label: 'Back of scalp — % hair loss', unit: '%' },
      { dom: 'salt-right', arg: 'right', kind: 'number', required: true, label: 'Right side — % hair loss', unit: '%' },
      { dom: 'salt-left', arg: 'left', kind: 'number', required: true, label: 'Left side — % hair loss', unit: '%' },
    ],
  },
  {
    id: 'napsi',
    summary: 'Nail Psoriasis Severity Index, per target nail (Rich & Scher 2003): matrix (0-4 quadrants) + bed (0-4 quadrants) = 0-8; higher = more nail involvement.',
    compute: F.napsi,
    fields: [
      { dom: 'napsi-matrix', arg: 'matrix', kind: 'number', required: true, label: 'Nail matrix — quadrants involved (0-4)' },
      { dom: 'napsi-bed', arg: 'bed', kind: 'number', required: true, label: 'Nail bed — quadrants involved (0-4)' },
    ],
  },
  {
    id: 'vancouver-scar-scale',
    summary: 'Vancouver Scar Scale (Sullivan 1990): pigmentation (0-2) + vascularity (0-3) + pliability (0-5) + height (0-3); total 0-13, 0 = normal skin and higher = worse scar.',
    compute: F.vancouverScarScale,
    fields: [
      { dom: 'vss-pig', arg: 'pigmentation', kind: 'number', required: true, label: 'Pigmentation (0-2)' },
      { dom: 'vss-vas', arg: 'vascularity', kind: 'number', required: true, label: 'Vascularity (0-3)' },
      { dom: 'vss-pli', arg: 'pliability', kind: 'number', required: true, label: 'Pliability (0-5)' },
      { dom: 'vss-ht', arg: 'height', kind: 'number', required: true, label: 'Height (0-3)' },
    ],
  },
];
