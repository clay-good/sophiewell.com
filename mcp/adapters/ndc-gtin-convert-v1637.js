// spec-v1637 MCP adapter: ndc-gtin-convert in lib/ndc-gtin-convert-v1637.js. The dom keys mirror
// views/group-v1637.js and META['ndc-gtin-convert'].example. Administrative domain. The clock is
// read only for the March 7, 2033 NDC format date.

import * as NG from '../../lib/ndc-gtin-convert-v1637.js';

export default [
  {
    id: 'ndc-gtin-convert',
    summary: 'Converts a 10-digit NDC to its GTIN-12 and GTIN-14 with the GS1 check digit. Given a GTIN, it checks the digit and reads the 10 digits in the NDC position. Handles the indicator digit for a case or other grouping. The three NDC segments cannot be recovered from the digits alone.',
    compute: (args) => NG.ndcGtinConvert(args, new Date()),
    fields: [
      { dom: 'ngc-value', arg: 'value', kind: 'string', required: true, label: 'A 10-digit NDC, or a GTIN of 12, 13 or 14 digits' },
      { dom: 'ngc-indicator', arg: 'indicator', kind: 'enum', values: NG.INDICATORS.map((k) => k.value), label: 'From an NDC, a grouping to build as well' },
    ],
  },
];
