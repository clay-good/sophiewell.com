// spec-v1242: MCP adapter. The dom keys mirror views/group-v1242.js and this tile's META example.
// Every field is a boolean and none is required on its own, because the lib refuses an empty form
// rather than reading "no segment ticked" as a type B.

import { stanfordDissection, AORTIC_SEGMENTS, TYPE_B_COMPLICATED, TYPE_B_HIGH_RISK } from '../../lib/stanford-dissection-v1242.js';

export default [
  {
    id: 'stanford-dissection',
    summary: 'Stanford classification of aortic dissection asks one question, whether the ascending aorta is involved. If it is the dissection is a type A, wherever the entry tear sits and however far distally it runs; if it is not, it is a type B. The branch this is read wrongly on is that type B does not mean descending only: a dissection that involves the arch and spares the ascending aorta is a type B, and this tile prints the arch involvement separately from the letter. For a type B it also reports the SVS/STS split between complicated, high-risk uncomplicated, and uncomplicated, which is what the management turns on. DeBakey, also in this catalog, asks where the dissection starts and how far it runs, so the two carry different information and are not interchangeable.',
    compute: stanfordDissection,
    fields: [
      ...AORTIC_SEGMENTS.map((s) => ({ dom: `sd-${s.key}`, arg: s.key, kind: 'boolean', required: false, label: s.label })),
      ...TYPE_B_COMPLICATED.map((c) => ({ dom: `sd-${c.key}`, arg: c.key, kind: 'boolean', required: false, label: c.label })),
      ...TYPE_B_HIGH_RISK.map((c) => ({ dom: `sd-${c.key}`, arg: c.key, kind: 'boolean', required: false, label: c.label })),
    ],
  },
];
