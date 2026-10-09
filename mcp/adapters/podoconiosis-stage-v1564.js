// spec-v1564 §3 MCP adapter: podoconiosis-stage in lib/podoconiosis-stage-v1564.js.
// The dom keys mirror views/group-v1564.js and META['podoconiosis-stage'].example. Clinical domain.

import * as P from '../../lib/podoconiosis-stage-v1564.js';

export default [
  {
    id: 'podoconiosis-stage',
    summary: 'Stages podoconiosis of one leg from 1 to 5 (Tekola 2008). By how far persistent swelling reaches, where the knobs are and whether the ankle or toe joints are fixed, with the mossy-change mark and the circumference it is recorded with.',
    compute: P.podoconiosisStage,
    fields: [
      { dom: 'pd-swelling', arg: 'swelling', kind: 'enum', required: true, label: 'Swelling of this leg', values: P.SWELLING.map((d) => d.value) },
      { dom: 'pd-fixed', arg: 'fixed', kind: 'enum', required: true, label: 'Ankle or toe joints fixed', values: P.YES_NO.map((d) => d.value) },
      { dom: 'pd-knobs', arg: 'knobs', kind: 'enum', label: 'Knobs or bumps', values: P.KNOBS.map((d) => d.value) },
      { dom: 'pd-mossy', arg: 'mossy', kind: 'enum', label: 'Mossy changes', values: P.YES_NO.map((d) => d.value) },
      { dom: 'pd-circ', arg: 'circumference', kind: 'number', label: 'Greatest below-knee circumference, cm', min: 10, max: 150 },
    ],
  },
];
