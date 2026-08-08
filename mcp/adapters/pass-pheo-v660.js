// spec-v660 MCP adapter: PASS pheochromocytoma score in lib/pass-pheo-v660.js. The dom
// keys mirror the browser renderer (views/group-v660.js) and META['pass-pheo'].example.
// Twelve present/absent histologic features (8 worth 2 points, 4 worth 1) summed 0-20;
// >= 4 indicates potential for aggressive behavior. Clinical domain.

import { passPheo, PASS_FEATURES } from '../../lib/pass-pheo-v660.js';

const DOM = { largeNests: 'pass-nests', necrosis: 'pass-necrosis', highCellularity: 'pass-cellularity',
  cellularMonotony: 'pass-monotony', spindling: 'pass-spindling', mitosesHigh: 'pass-mitoses',
  atypicalMitoses: 'pass-atypical', adiposeExtension: 'pass-adipose', vascularInvasion: 'pass-vascular',
  capsularInvasion: 'pass-capsular', pleomorphism: 'pass-pleomorphism', hyperchromasia: 'pass-hyperchromasia' };

export default [
  {
    id: 'pass-pheo',
    summary: 'PASS (Pheochromocytoma of the Adrenal gland Scaled Score, Thompson 2002): 12 histologic features (8 worth 2 points, 4 worth 1) summed 0-20. PASS >= 4 indicates potential for biologically aggressive behavior; < 4 benign. Has poor interobserver reproducibility - a low score is more reliable. Companion to GAPP.',
    compute: passPheo,
    fields: PASS_FEATURES.map((f) => ({
      dom: DOM[f.key], arg: f.key, kind: 'bool', required: false,
      label: `${f.label} (+${f.points})`,
    })),
  },
];
