// spec-v669 MCP adapter: Walter Index (1-year mortality after hospitalization in older
// adults) in lib/walter-index-v669.js. The dom keys mirror the browser renderer
// (views/group-v669.js) and META['walter-index'].example. Three categorical selects
// (sex, ADL dependence, cancer), one CHF flag, and two raw labs (creatinine mg/dL,
// albumin g/dL); a weighted point sum 0-20 maps to a 1-year mortality band. Clinical domain.

import { walterIndex } from '../../lib/walter-index-v669.js';

export default [
  {
    id: 'walter-index',
    summary: 'Walter Index for 1-year mortality after hospitalization in adults >=70 (Walter, JAMA 2001): male sex (1) + ADL dependence (1-4 of 5 = 2, all 5 = 5) + congestive heart failure (2) + cancer (solitary 3, metastatic 8) + creatinine > 3.0 mg/dL (2) + albumin (3.0-3.4 g/dL = 1, < 3.0 = 2), total 0-20. Bands: 0-1 ~4%, 2-3 ~19%, 4-6 ~34%, >=7 ~64%. Applied at discharge; not validated for surgical/ICU-only patients.',
    compute: walterIndex,
    fields: [
      { dom: 'walter-sex', arg: 'sex', kind: 'enum', values: ['female', 'male'], required: true, label: 'Sex' },
      { dom: 'walter-adl', arg: 'adl', kind: 'enum', values: ['none', 'some', 'all'], required: true, label: 'ADL dependence at discharge: none, some (1-4 of 5), all (5 of 5) — bathing, dressing, transferring, toileting, eating' },
      { dom: 'walter-chf', arg: 'chf', kind: 'bool', label: 'Congestive heart failure' },
      { dom: 'walter-cancer', arg: 'cancer', kind: 'enum', values: ['none', 'solitary', 'metastatic'], required: true, label: 'Cancer status' },
      { dom: 'walter-creat', arg: 'creatinine', kind: 'number', unit: 'mg/dL', required: true, label: 'Serum creatinine (points if > 3.0 mg/dL)' },
      { dom: 'walter-alb', arg: 'albumin', kind: 'number', unit: 'g/dL', required: true, label: 'Serum albumin (1 point if 3.0-3.4, 2 points if < 3.0 g/dL)' },
    ],
  },
];
