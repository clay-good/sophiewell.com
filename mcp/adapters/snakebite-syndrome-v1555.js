// spec-v1555 MCP adapter: snakebite-syndrome in lib/snakebite-syndrome-v1555.js.
// The dom keys mirror views/group-v1555b.js and META['snakebite-syndrome'].example. Clinical domain.

import * as M from '../../lib/snakebite-syndrome-v1555.js';

export default [
  {
    id: 'snakebite-syndrome',
    summary: 'Suggests which snakes a snakebite picture points to (WHO syndromes). AFRO six syndromes, SEARO five, with the antivenom class each implies: broad, species-specific, or none. A suggestion, not an identification.',
    compute: M.snakebiteSyndrome,
    fields: [
      { dom: 'ss-region', arg: 'region', kind: 'enum', required: true, label: 'Region', values: M.REGION_OPTIONS.map((d) => d.value) },
      { dom: 'ss-swelling', arg: 'swelling', kind: 'enum', required: true, label: 'Local swelling', values: M.SWELLING_OPTIONS.map((d) => d.value) },
      { dom: 'ss-blood', arg: 'blood', kind: 'enum', required: true, label: 'Blood', values: M.BLOOD_OPTIONS.map((d) => d.value) },
      { dom: 'ss-paralysis', arg: 'paralysis', kind: 'enum', required: true, label: 'Paralysis (drooping eyelids, weakness)', values: M.YES_NO.map((d) => d.value) },
      { dom: 'ss-setting', arg: 'setting', kind: 'enum', label: 'Asia: where the bite happened', values: M.SETTING_OPTIONS.map((d) => d.value) },
      { dom: 'ss-renal', arg: 'renal', kind: 'enum', label: 'Asia: dark urine, shock or kidney injury', values: M.YES_NO.map((d) => d.value) },
      { dom: 'ss-maluku', arg: 'maluku', kind: 'enum', label: 'Asia: bitten in Maluku or West Papua (Indonesia)', values: M.YES_NO.map((d) => d.value) },
    ],
  },
];
