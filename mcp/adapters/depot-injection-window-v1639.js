// spec-v1639 MCP adapter: depot-injection-window in lib/depot-injection-window-v1639.js. The dom keys
// mirror views/group-v1639.js and META['depot-injection-window'].example. Five label rows: Depo-Provera
// CI, depo-subQ provera 104, Vivitrol, Sublocade and Brixadi.

import * as DW from '../../lib/depot-injection-window-v1639.js';

export default [
  {
    id: 'depot-injection-window',
    summary: 'Next due date and window for a depot injection, from each label. Depo-Provera (13 weeks) and depo-subQ provera 104 (12 to 14 weeks) with CDC\'s 15-week line beside the label; Vivitrol (4 weeks or a month); Sublocade (26 days between maintenance doses); Brixadi weekly and monthly. Places a planned date; does not say whether to inject.',
    compute: DW.depotInjectionWindow,
    fields: [
      { dom: 'diw-product', arg: 'product', kind: 'enum', required: true, values: DW.PRODUCTS.map((p) => p.value), label: 'Product' },
      { dom: 'diw-last', arg: 'lastInjection', kind: 'string', required: true, label: 'Date of the last injection (YYYY-MM-DD)' },
      { dom: 'diw-planned', arg: 'plannedDate', kind: 'string', label: 'Today\'s or the planned date (YYYY-MM-DD, optional)' },
      { dom: 'diw-sublocade', arg: 'sublocadeNext', kind: 'enum', values: DW.SUBLOCADE_NEXT.map((p) => p.value), label: 'Sublocade: which injection is next' },
    ],
  },
];
