// spec-v1561 MCP adapter: noma-stage in lib/noma-stage-v1561.js.
// The dom keys mirror views/group-v1561.js and META['noma-stage'].example. Clinical domain.

import * as M from '../../lib/noma-stage-v1561.js';

export default [
  {
    id: 'noma-stage',
    summary: 'Stages noma (cancrum oris) by the WHO AFRO brochure. From the warning sign of simple gingivitis to sequelae, saying whether it is still reversible and when to refer as an emergency.',
    compute: M.nomaStage,
    fields: [
      { dom: 'nm-ging', arg: 'gingivitis', kind: 'enum', label: 'Gums bleed when touched, red and swollen', values: M.YES_NO.map((d) => d.value) },
      { dom: 'nm-ang', arg: 'ang', kind: 'enum', label: 'Spontaneous gum bleeding, painful ulcerated papillae, fetid breath', values: M.YES_NO.map((d) => d.value) },
      { dom: 'nm-edema', arg: 'edema', kind: 'enum', label: 'Facial swelling with a painful cheek and fever', values: M.YES_NO.map((d) => d.value) },
      { dom: 'nm-gang', arg: 'gangrene', kind: 'enum', label: 'Black necrotic area or a hole in the cheek or lips', values: M.YES_NO.map((d) => d.value) },
      { dom: 'nm-scar', arg: 'scarring', kind: 'enum', label: 'Acute phase over: trismus, loose teeth, exposed bone, scarring', values: M.YES_NO.map((d) => d.value) },
      { dom: 'nm-seq', arg: 'sequelae', kind: 'enum', label: 'Established disfigurement', values: M.YES_NO.map((d) => d.value) },
    ],
  },
];
