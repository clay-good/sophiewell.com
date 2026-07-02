// spec-v183 MCP wave 14: adapter for the lib/derm-v151.js SCORAD tile. dom keys
// mirror views/group-v151.js; arg names mirror the lib signature. Extent and the
// subjective pruritus / sleeplessness VAS are numbers; the six intensity items
// are 0–3 ordinal selects (enums).
//
// Deferred this wave: pasi, easi, and dlqi build their input object from
// per-region / per-item field groups rather than the flat dom→arg→kind contract
// (they need a bespoke toArgs); they are left for a later wave.

import * as F from '../../lib/derm-v151.js';

export default [
  {
    id: 'scorad',
    summary: 'SCORAD (European Task Force on Atopic Dermatitis 1993): extent (A) + six intensity items (B) + subjective pruritus and sleeplessness VAS (C) → a 0–103 atopic-dermatitis severity score (with the objective oSCORAD).',
    compute: F.scorad,
    fields: [
      { dom: 'scorad-extent', arg: 'extent', kind: 'number', label: 'Extent (% BSA affected)' },
      { dom: 'scorad-erythema', arg: 'erythema', kind: 'enum', values: ['0', '1', '2', '3'], label: 'Erythema (0–3)' },
      { dom: 'scorad-edema', arg: 'edema', kind: 'enum', values: ['0', '1', '2', '3'], label: 'Edema / papulation (0–3)' },
      { dom: 'scorad-oozing', arg: 'oozing', kind: 'enum', values: ['0', '1', '2', '3'], label: 'Oozing / crusting (0–3)' },
      { dom: 'scorad-excoriation', arg: 'excoriation', kind: 'enum', values: ['0', '1', '2', '3'], label: 'Excoriation (0–3)' },
      { dom: 'scorad-lichenification', arg: 'lichenification', kind: 'enum', values: ['0', '1', '2', '3'], label: 'Lichenification (0–3)' },
      { dom: 'scorad-dryness', arg: 'dryness', kind: 'enum', values: ['0', '1', '2', '3'], label: 'Dryness of uninvolved skin (0–3)' },
      { dom: 'scorad-pruritus', arg: 'pruritus', kind: 'number', label: 'Pruritus VAS (0–10)' },
      { dom: 'scorad-sleeplessness', arg: 'sleeplessness', kind: 'number', label: 'Sleeplessness VAS (0–10)' },
    ],
  },
];
