// spec-v1636 MCP adapter: us-antivenom-dose in lib/us-antivenom-dose-v1636.js. The dom keys mirror
// views/group-v1636.js and META['us-antivenom-dose'].example. Clinical domain. Three label rows.

import * as AV from '../../lib/us-antivenom-dose-v1636.js';

export default [
  {
    id: 'us-antivenom-dose',
    summary: 'CroFab, Anavip and Anascorp: the vials in a dose, the saline to reconstitute them, the diluted volume and infusion time, and the running vial count. With the time initial control was achieved it gives the three CroFab maintenance times or the end of the Anavip observation period. Whether control has been achieved is the reader\'s finding.',
    compute: (args) => AV.usAntivenomDose(args, new Date()),
    fields: [
      { dom: 'uad-product', arg: 'product', kind: 'enum', required: true, values: AV.PRODUCTS.map((x) => x.value), label: 'Product' },
      { dom: 'uad-dose', arg: 'dose', kind: 'enum', required: true, values: AV.DOSES.map((x) => x.value), label: 'Which dose this is' },
      { dom: 'uad-vials', arg: 'vials', kind: 'number', label: 'Vials in this dose (CroFab initial or further dose: the label gives a range)' },
      { dom: 'uad-before', arg: 'vialsBefore', kind: 'number', label: 'Vials given before this dose (optional)' },
      { dom: 'uad-control', arg: 'controlTime', kind: 'string', label: 'Time initial control was achieved (YYYY-MM-DDTHH:MM, optional)' },
    ],
  },
];
