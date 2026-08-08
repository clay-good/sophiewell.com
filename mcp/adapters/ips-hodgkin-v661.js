// spec-v661 MCP adapter: IPS for advanced Hodgkin lymphoma in lib/ips-hodgkin-v661.js.
// The dom keys mirror the browser renderer (views/group-v661.js) and
// META['ips-hodgkin'].example. Seven adverse factors summed 0-7: five come from numeric
// thresholds (albumin, hemoglobin, age, WBC, lymphocyte count; optional lymphocyte %),
// two are booleans (male, stage IV). Clinical domain.

import { ipsHodgkin } from '../../lib/ips-hodgkin-v661.js';

export default [
  {
    id: 'ips-hodgkin',
    summary: 'International Prognostic Score (IPS) for advanced Hodgkin lymphoma (Hasenclever 1998): 7 adverse factors, each 1 point, summed 0-7 - albumin <4 g/dL, Hgb <10.5 g/dL, male, age >=45, stage IV, WBC >=15000/mm3, lymphocytopenia (<600/mm3 and/or <8%). Higher = worse prognosis.',
    compute: ipsHodgkin,
    fields: [
      { dom: 'ips-albumin', arg: 'albumin', kind: 'number', required: true, label: 'Serum albumin (g/dL); < 4 scores 1' },
      { dom: 'ips-hgb', arg: 'hemoglobin', kind: 'number', required: true, label: 'Hemoglobin (g/dL); < 10.5 scores 1' },
      { dom: 'ips-age', arg: 'age', kind: 'number', required: true, label: 'Age (years); >= 45 scores 1' },
      { dom: 'ips-wbc', arg: 'wbc', kind: 'number', required: true, label: 'White blood cell count (/mm3); >= 15000 scores 1' },
      { dom: 'ips-lymph', arg: 'lymphocyteCount', kind: 'number', required: true, label: 'Absolute lymphocyte count (/mm3); < 600 scores 1 (lymphocytopenia)' },
      { dom: 'ips-lymphpct', arg: 'lymphocytePct', kind: 'number', required: false, label: 'Lymphocytes as % of WBC (optional); < 8% also scores the lymphocytopenia point' },
      { dom: 'ips-male', arg: 'male', kind: 'bool', required: false, label: 'Male sex (scores 1)' },
      { dom: 'ips-stage4', arg: 'stageIV', kind: 'bool', required: false, label: 'Ann Arbor stage IV (scores 1)' },
    ],
  },
];
