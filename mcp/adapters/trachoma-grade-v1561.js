// spec-v1561 MCP adapter: trachoma-grade in lib/trachoma-grade-v1561.js.
// The dom keys mirror views/group-v1561.js and META['trachoma-grade'].example. Clinical domain.

import * as M from '../../lib/trachoma-grade-v1561.js';

export default [
  {
    id: 'trachoma-grade',
    summary: 'Grades one eye by the WHO simplified trachoma system as amended in 2020: TT (upper lid only), CO, TF (five or more follicles), TI and TS, each present or absent.',
    compute: M.trachomaGrade,
    fields: [
      { dom: 'tr-tt', arg: 'tt', kind: 'enum', label: 'An upper-lid eyelash touches the eyeball, or recent epilation of in-turned upper-lid lashes', values: M.YES_NO.map((d) => d.value) },
      { dom: 'tr-co', arg: 'co', kind: 'enum', label: 'Corneal opacity blurring at least part of the pupil margin', values: M.YES_NO.map((d) => d.value) },
      { dom: 'tr-fol', arg: 'follicles', kind: 'number', label: 'Follicles of 0.5 mm or more in the central upper tarsal conjunctiva (count)', min: 0, max: 200 },
      { dom: 'tr-ti', arg: 'ti', kind: 'enum', label: 'Inflammatory thickening obscuring more than half the deep tarsal vessels', values: M.YES_NO.map((d) => d.value) },
      { dom: 'tr-ts', arg: 'ts', kind: 'enum', label: 'Easily visible scarring of the upper tarsal conjunctiva', values: M.YES_NO.map((d) => d.value) },
    ],
  },
];
