// spec-v1561 MCP adapter: filarial-lymphedema-stage in lib/filarial-lymphedema-stage-v1561.js.
// The dom keys mirror views/group-v1561.js and META['filarial-lymphedema-stage'].example. Clinical domain.

import * as M from '../../lib/filarial-lymphedema-stage-v1561.js';

export default [
  {
    id: 'filarial-lymphedema-stage',
    summary: 'Stages filarial lymphedema of a leg or arm from 1 to 7 by the Dreyer scheme (WHO 2001): the highest feature wins, staging waits 30 days after an acute attack, and WHO grades print beside it.',
    compute: M.filarialLymphedemaStage,
    fields: [
      { dom: 'fl-attack', arg: 'attack', kind: 'enum', required: true, label: 'Acute attack in the last 30 days', values: M.YES_NO.map((d) => d.value) },
      { dom: 'fl-rev', arg: 'reversible', kind: 'enum', required: true, label: 'Swelling goes down overnight', values: M.YES_NO.map((d) => d.value) },
      { dom: 'fl-folds', arg: 'folds', kind: 'enum', label: 'Skin folds', values: M.FOLD_OPTIONS.map((d) => d.value) },
      { dom: 'fl-knobs', arg: 'knobs', kind: 'enum', label: 'Knobs (bumps or lumps on the skin)', values: M.YES_NO.map((d) => d.value) },
      { dom: 'fl-mossy', arg: 'mossy', kind: 'enum', label: 'Mossy foot', values: M.YES_NO.map((d) => d.value) },
      { dom: 'fl-daily', arg: 'daily', kind: 'enum', label: 'Unable to do daily activities without help', values: M.YES_NO.map((d) => d.value) },
    ],
  },
];
