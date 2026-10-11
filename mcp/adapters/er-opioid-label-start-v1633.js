// spec-v1633 MCP adapter: er-opioid-label-start in lib/er-opioid-label-start-v1633.js. The dom keys
// mirror views/group-v1633.js and META['er-opioid-label-start'].example. Clinical domain. Three label
// rows: Hysingla ER, Butrans and Belbuca. One way: none of the tables runs in reverse.

import * as EO from '../../lib/er-opioid-label-start-v1633.js';

export default [
  {
    id: 'er-opioid-label-start',
    summary: 'The starting dose of Hysingla ER, Butrans or Belbuca by that product\'s own label. Hysingla ER: the label\'s conversion factors for seven prior oral opioids, less 25%, rounded down to a tablet strength, with the 20 mg floor. Butrans and Belbuca: the label\'s row for the prior daily oral morphine equivalent, with the taper it requires first and the dose above which it says to consider another analgesic. One way only.',
    compute: EO.erOpioidLabelStart,
    fields: [
      { dom: 'eos-product', arg: 'product', kind: 'enum', required: true, values: EO.PRODUCTS.map((d) => d.value), label: 'Product' },
      { dom: 'eos-med', arg: 'morphineEquivalentMg', kind: 'number', label: 'Butrans or Belbuca: prior total daily dose in oral morphine equivalents', unit: 'mg' },
      ...EO.HYSINGLA_FACTORS.map((f) => ({ dom: `eos-${f.name}`, arg: f.arg, kind: 'number', label: `Hysingla ER: prior daily oral ${f.name}`, unit: 'mg' })),
    ],
  },
];
