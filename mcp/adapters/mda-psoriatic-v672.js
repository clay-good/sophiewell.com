// spec-v672 MCP adapter: Minimal Disease Activity (MDA) in psoriatic arthritis in
// lib/mda-psoriatic-v672.js. The dom keys mirror the browser renderer
// (views/group-v672.js) and META['mda-psoriatic'].example. Seven criterion flags
// (each a documented threshold); >= 5 of 7 = MDA, 7/7 = VLDA. Clinical domain.

import { mdaPsoriatic } from '../../lib/mda-psoriatic-v672.js';

export default [
  {
    id: 'mda-psoriatic',
    summary: 'Minimal Disease Activity (MDA) in psoriatic arthritis (Coates 2010): a treat-to-target state met when >= 5 of 7 criteria hold — TJC68 <= 1, SJC66 <= 1, PASI <= 1 or BSA <= 3%, patient pain <= 15 (0-100 mm), patient global <= 20 (0-100 mm), HAQ <= 0.5, tender entheseal points <= 1. All 7 = Very Low Disease Activity (VLDA). Each criterion is confirmed met/not-met (PASI/HAQ are separate instruments; the skin item is an OR).',
    compute: mdaPsoriatic,
    fields: [
      { dom: 'mda-tjc', arg: 'tjc', kind: 'bool', label: 'Tender joint count (68-joint) <= 1' },
      { dom: 'mda-sjc', arg: 'sjc', kind: 'bool', label: 'Swollen joint count (66-joint) <= 1' },
      { dom: 'mda-skin', arg: 'skin', kind: 'bool', label: 'PASI <= 1 or body surface area <= 3%' },
      { dom: 'mda-pain', arg: 'pain', kind: 'bool', label: 'Patient pain <= 15 on a 0-100 mm VAS' },
      { dom: 'mda-global', arg: 'global', kind: 'bool', label: 'Patient global disease activity <= 20 on a 0-100 mm VAS' },
      { dom: 'mda-haq', arg: 'haq', kind: 'bool', label: 'HAQ <= 0.5' },
      { dom: 'mda-entheses', arg: 'entheses', kind: 'bool', label: 'Tender entheseal points <= 1' },
    ],
  },
];
