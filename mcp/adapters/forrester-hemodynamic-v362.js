// spec-v362 MCP wave: adapter for the Forrester hemodynamic classification in
// lib/forrester-hemodynamic-v362.js. The dom keys mirror the browser renderer (views/group-v362.js) and
// META['forrester-hemodynamic'].example. It is a two-field NUMERIC tile: `ci` (cardiac index) and
// `pcwp` (wedge pressure), both required (both in the example). The compute derives the subset I-IV and
// echoes the entered CI and PCWP in the band, so the example (CI 1.8, PCWP 24 -> subset IV) round-trips
// its numeric facts (1.8, 24, 55.5) through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/forrester-hemodynamic-v362.js';

export default [
  {
    id: 'forrester-hemodynamic',
    summary: 'Forrester hemodynamic classification (Forrester, Diamond & Swan 1977) of acute MI / acute heart failure — derives the hemodynamic subset from the cardiac index (perfusion) and pulmonary capillary wedge pressure (congestion), the invasive counterpart to the clinical Killip classification. Cold = CI below 2.2 L/min/m2; wet = PCWP above 18 mmHg. I warm and dry (~2.2% mortality); II warm and wet (~10.1%); III cold and dry (~22.4%); IV cold and wet, cardiogenic-shock physiology (~55.5%). Reports the subset, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.forresterHemodynamic,
    fields: [
      { dom: 'fh-ci', arg: 'ci', kind: 'number', label: 'Cardiac index (L/min/m2)', required: true },
      { dom: 'fh-pcwp', arg: 'pcwp', kind: 'number', label: 'PCWP (mmHg)', required: true },
    ],
  },
];
