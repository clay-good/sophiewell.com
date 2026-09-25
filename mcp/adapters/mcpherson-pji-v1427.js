// spec-v1427: MCP adapter. The dom keys mirror views/group-v1427.js (`mph-` + the factor key in
// lower case) and this tile's META example. A factor left out is "not answered", never "no".

import * as MP from '../../lib/mcpherson-pji-v1427.js';

const YES_NO = MP.MPH_YES_NO.map((x) => x.value);
const factor = (f) => ({ dom: `mph-${f.key.toLowerCase()}`, arg: f.key, kind: 'enum', label: f.text, values: YES_NO });

export default [
  {
    id: 'mcpherson-pji',
    summary: 'Stages a periprosthetic joint infection by the McPherson system from its timing and the host and limb factors present. Infection type I to III, host grade A to C and limb grade 1 to 3 come from the published factor lists; a factor not answered is not counted as absent, so a grade it could change is given as a range.',
    compute: MP.mcphersonPji,
    fields: [
      { dom: 'mph-type', arg: 'type', kind: 'enum', required: true, label: 'Infection type', values: MP.MPH_TYPE.map((x) => x.value) },
      ...MP.MPH_SYSTEMIC.map(factor),
      ...MP.MPH_CRITICAL.map(factor),
      ...MP.MPH_LOCAL.map(factor),
    ],
  },
];
