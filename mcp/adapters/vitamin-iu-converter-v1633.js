// spec-v1633 MCP adapter: vitamin-iu-converter in lib/vitamin-iu-converter-v1633.js. The dom keys
// mirror views/group-v1633.js and META['vitamin-iu-converter'].example. A unit conversion by FDA's
// 2019 labeling guidance; the source form is a required choice for vitamins A and E.

import * as VI from '../../lib/vitamin-iu-converter-v1633.js';

export default [
  {
    id: 'vitamin-iu-converter',
    summary: 'Vitamin units converted by FDA\'s labeling factors. IU to mcg for vitamin D, IU to mcg RAE for vitamin A by source form, IU to mg alpha-tocopherol for natural or synthetic vitamin E, each in either direction; food folate and folic acid to mcg DFE; niacin and tryptophan to mg NE. Each result is also given as a percent of the 2016 Daily Value. There is no single vitamin A or E factor without the form.',
    compute: VI.vitaminIuConverter,
    fields: [
      { dom: 'viu-quantity', arg: 'quantity', kind: 'enum', required: true, values: VI.QUANTITIES.map((d) => d.value), label: 'Vitamin and form' },
      { dom: 'viu-direction', arg: 'direction', kind: 'enum', values: VI.DIRECTIONS.map((d) => d.value), label: 'Direction (vitamins A, D and E)' },
      { dom: 'viu-amount', arg: 'amount', kind: 'number', label: 'Amount (IU or metric; for folate, mcg of food folate; for niacin, mg of niacin)' },
      { dom: 'viu-amount2', arg: 'amount2', kind: 'number', label: 'Folate: mcg of folic acid. Niacin: mg of tryptophan' },
    ],
  },
];
