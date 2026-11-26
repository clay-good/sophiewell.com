// spec-v1484: MCP adapter. The dom keys mirror views/group-v1484.js and this tile's META example.

import * as DF from '../../lib/dean-fluorosis-cfi-v1484.js';

export default [
  {
    id: 'dean-fluorosis-cfi',
    summary: "Dean's Community Fluorosis Index: the weighted mean of Dean's fluorosis categories across a surveyed population, read as a public health concern.",
    compute: DF.deanFluorosisCfi,
    // spec-v1798: the library refuses a head count outside 0 to 1,000,000 for every category.
    fields: DF.DEAN_CATEGORIES.map((c) => ({ dom: `dean-${c.key}`, arg: c.key, kind: 'number', required: true, label: `People scored ${c.label} (0 if none)`, min: 0, max: 1e6 })),
  },
];
