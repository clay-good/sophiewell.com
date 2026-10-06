// spec-v1556 MCP adapter: brazil-lonomia-antivenom in lib/brazil-lonomia-antivenom-v1556.js.
// The dom keys mirror views/group-v1556.js and META['brazil-lonomia-antivenom'].example. Clinical domain.

import * as M from '../../lib/brazil-lonomia-antivenom-v1556.js';

export default [
  {
    id: 'brazil-lonomia-antivenom',
    summary: 'Classes a Lonomia caterpillar contact in Brazil. By clotting time and bleeding: mild with 24 hours of observation, moderate 5 vials, or severe 10 vials of SALon.',
    compute: M.brazilLonomiaAntivenom,
    fields: [
      { dom: 'blo-clot', arg: 'clotting', kind: 'enum', required: true, label: 'Clotting time', values: M.CLOT_OPTIONS.map((d) => d.value) },
      { dom: 'blo-bleed', arg: 'bleeding', kind: 'enum', required: true, label: 'Bleeding', values: M.BLEED_OPTIONS.map((d) => d.value) },
    ],
  },
];
