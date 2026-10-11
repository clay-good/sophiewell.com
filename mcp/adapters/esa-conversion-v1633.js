// spec-v1633 MCP adapter: esa-conversion in lib/esa-conversion-v1633.js. The dom keys mirror
// views/group-v1633.js and META['esa-conversion'].example. Clinical domain. Two label rows: Aranesp
// and Mircera. One way: neither label gives a table back to epoetin alfa.

import * as ES from '../../lib/esa-conversion-v1633.js';

export default [
  {
    id: 'esa-conversion',
    summary: 'The starting dose in a switch to Aranesp or Mircera, by the label\'s table. For a patient with chronic kidney disease coming from epoetin alfa or darbepoetin alfa. Aranesp: mcg a week from the weekly epoetin dose, adult or pediatric, with the label\'s interval. Mircera: the adult dose once monthly or every two weeks, or the pediatric dose every 4 weeks, from the weekly epoetin or darbepoetin dose. One way only.',
    compute: ES.esaConversion,
    fields: [
      { dom: 'esa-target', arg: 'target', kind: 'enum', required: true, values: ES.TARGETS.map((d) => d.value), label: 'Product being started' },
      { dom: 'esa-current', arg: 'current', kind: 'enum', required: true, values: ES.CURRENT.map((d) => d.value), label: 'Current ESA' },
      { dom: 'esa-pop', arg: 'population', kind: 'enum', required: true, values: ES.POPULATIONS.map((d) => d.value), label: 'Adult or pediatric' },
      { dom: 'esa-dose', arg: 'weeklyDose', kind: 'number', required: true, label: 'Total weekly dose (epoetin alfa in units, darbepoetin alfa in mcg)' },
      { dom: 'esa-freq', arg: 'epoetinFrequency', kind: 'enum', values: ES.EPOETIN_FREQUENCIES.map((d) => d.value), label: 'To Aranesp: how often the epoetin alfa is given' },
      { dom: 'esa-interval', arg: 'mirceraInterval', kind: 'enum', values: ES.MIRCERA_INTERVALS.map((d) => d.value), label: 'To Mircera, adults: monthly or every two weeks' },
    ],
  },
];
