// spec-v183 MCP wave: adapters for the hematology discrimination indices + HS
// severity in lib/hemederm-v245.js — the Shine & Lal index, the Green & King index,
// the percent platelet recovery, and the IHS4 hidradenitis suppurativa score. dom
// keys mirror views/group-v245.js; all inputs are numeric.

import * as F from '../../lib/hemederm-v245.js';

export default [
  {
    id: 'shine-lal-index',
    summary: 'Shine & Lal index (1977) = (MCV^2 x MCH) / 100; < 1530 suggests beta-thalassemia trait, > 1530 iron deficiency.',
    compute: F.shineLal,
    fields: [
      { dom: 'sl-mcv', arg: 'mcv', kind: 'number', required: true, label: 'MCV', unit: 'fL' },
      { dom: 'sl-mch', arg: 'mch', kind: 'number', required: true, label: 'MCH', unit: 'pg' },
    ],
  },
  {
    id: 'green-king-index',
    summary: 'Green & King index (1989) = (MCV^2 x RDW) / (Hb x 100); < 65 suggests beta-thalassemia trait, > 65 iron deficiency.',
    compute: F.greenKing,
    fields: [
      { dom: 'gk-mcv', arg: 'mcv', kind: 'number', required: true, label: 'MCV', unit: 'fL' },
      { dom: 'gk-rdw', arg: 'rdw', kind: 'number', required: true, label: 'RDW', unit: '%' },
      { dom: 'gk-hb', arg: 'hb', kind: 'number', required: true, label: 'Hemoglobin', unit: 'g/dL' },
    ],
  },
  {
    id: 'percent-platelet-recovery',
    summary: 'Percent platelet recovery = [(post - pre) platelet count x blood volume] / platelets transfused; a transfusion response metric.',
    compute: F.percentPlateletRecovery,
    fields: [
      { dom: 'ppr-pre', arg: 'pre', kind: 'number', required: true, label: 'Pre-transfusion platelet count', unit: 'x10^9/L' },
      { dom: 'ppr-post', arg: 'post', kind: 'number', required: true, label: 'Post-transfusion platelet count', unit: 'x10^9/L' },
      { dom: 'ppr-bv', arg: 'bloodVolume', kind: 'number', required: true, label: 'Blood volume', unit: 'L' },
      { dom: 'ppr-tx', arg: 'transfused', kind: 'number', required: true, label: 'Platelets transfused', unit: 'x10^11' },
    ],
  },
  {
    id: 'ihs4',
    summary: 'IHS4 (Zouboulis 2017) = nodules x 1 + abscesses x 2 + draining tunnels x 4; 0-3 mild, 4-10 moderate, >= 11 severe.',
    compute: F.ihs4,
    fields: [
      { dom: 'ihs4-nod', arg: 'nodules', kind: 'number', required: true, label: 'Inflammatory nodules (count)' },
      { dom: 'ihs4-abs', arg: 'abscesses', kind: 'number', required: true, label: 'Abscesses (count)' },
      { dom: 'ihs4-tun', arg: 'tunnels', kind: 'number', required: true, label: 'Draining tunnels (count)' },
    ],
  },
];
