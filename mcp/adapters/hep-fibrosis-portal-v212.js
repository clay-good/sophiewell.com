// spec-v183 MCP wave 34: adapters for the two hepatology fibrosis / portal-
// hypertension instruments in lib/hep-fibrosis-portal-v212.js — King's Score for
// significant fibrosis / cirrhosis and the Baveno VII non-invasive rules for
// clinically significant portal hypertension and varices. dom keys mirror
// views/group-v212.js; all inputs are plain numeric labs / measurements.

import * as F from '../../lib/hep-fibrosis-portal-v212.js';

export default [
  {
    id: 'king-score',
    summary: "King's Score (Cross 2009): age, AST, INR, and platelets give a non-invasive fibrosis score; below ~12.3 makes significant fibrosis / cirrhosis unlikely and above ~16.7 makes cirrhosis likely.",
    compute: F.kingScore,
    fields: [
      { dom: 'king-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'king-ast', arg: 'ast', kind: 'number', required: true, label: 'AST', unit: 'IU/L' },
      { dom: 'king-inr', arg: 'inr', kind: 'number', required: true, label: 'INR' },
      { dom: 'king-plt', arg: 'platelets', kind: 'number', required: true, label: 'Platelet count', unit: '×10⁹/L' },
    ],
  },
  {
    id: 'baveno-vii',
    summary: 'Baveno VII non-invasive rules (de Franchis 2022): liver-stiffness measurement and platelets rule clinically significant portal hypertension in (LSM ≥ 25 kPa) or out (LSM ≤ 15 kPa with platelets ≥ 150), and the favorable Baveno VI window (LSM < 20 kPa, platelets > 150) lets screening endoscopy be deferred.',
    compute: F.bavenoVii,
    fields: [
      { dom: 'bav-lsm', arg: 'lsm', kind: 'number', required: true, label: 'Liver-stiffness measurement (transient elastography)', unit: 'kPa' },
      { dom: 'bav-plt', arg: 'platelets', kind: 'number', required: true, label: 'Platelet count', unit: '×10⁹/L' },
    ],
  },
];
