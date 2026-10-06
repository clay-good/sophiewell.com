// spec-v1562 MCP adapter: cystic-echinococcosis-stage in lib/cystic-echinococcosis-stage-v1562.js.
// The dom keys mirror views/group-v1562.js and META['cystic-echinococcosis-stage'].example. Clinical domain.

import * as M from '../../lib/cystic-echinococcosis-stage-v1562.js';

export default [
  {
    id: 'cystic-echinococcosis-stage',
    summary: 'Gives the WHO 2025 first-line treatment for a hydatid cyst. By ultrasound stage (CE1-CE5), size, organ and facility tier: albendazole, PAIR, surgery, or watch and wait.',
    compute: M.cysticEchinococcosisStage,
    fields: [
      { dom: 'ce-organ', arg: 'organ', kind: 'enum', required: true, label: 'Organ', values: M.ORGAN_OPTIONS.map((d) => d.value) },
      { dom: 'ce-stage', arg: 'stage', kind: 'enum', required: true, label: 'Ultrasound stage', values: M.STAGE_OPTIONS.map((d) => d.value) },
      { dom: 'ce-diam', arg: 'diameter', kind: 'number', required: true, label: 'Largest cyst diameter in cm', min: 0.1, max: 50 },
      { dom: 'ce-comp', arg: 'complicated', kind: 'enum', required: true, label: 'Complicated (rupture, infection, fistula, compression)', values: M.YES_NO.map((d) => d.value) },
      { dom: 'ce-bil', arg: 'biliary', kind: 'enum', label: 'Communication with the bile ducts', values: M.YES_NO.map((d) => d.value) },
      { dom: 'ce-mult', arg: 'multiple', kind: 'enum', label: 'Multiple cysts, mixed stages, or several organs', values: M.YES_NO.map((d) => d.value) },
      { dom: 'ce-tier', arg: 'tier', kind: 'enum', label: 'Facility tier', values: M.TIER_OPTIONS.map((d) => d.value) },
      { dom: 'ce-weight', arg: 'weight', kind: 'number', label: 'Weight in kg (for albendazole)', min: 3, max: 250 },
    ],
  },
];
