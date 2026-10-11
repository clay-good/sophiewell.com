// spec-v1629 MCP adapter: compound-copy-check in lib/compound-copy-check-v1629.js. The dom keys mirror
// views/group-v1629.js and META['compound-copy-check'].example. FDA's January 2018 guidance on
// section 503A; administrative domain. Every answer is required; nothing is defaulted.

import * as CC from '../../lib/compound-copy-check-v1629.js';

const YN = CC.YES_NO.map((y) => y.value);

export default [
  {
    id: 'compound-copy-check',
    summary: 'Applies FDA\'s January 2018 "essentially a copy" tests for a section 503A compounded drug to the reader\'s answers. Gives the percent difference in strength against the commercial product, which conditions are met, and the month\'s count against four prescriptions. A nonbinding enforcement policy; section 503B is out of scope.',
    compute: CC.compoundCopyCheck,
    fields: [
      { dom: 'cc-api', arg: 'sameApi', kind: 'enum', required: true, values: YN, label: 'Same active ingredient as a commercial product (yes or no)' },
      { dom: 'cc-avail', arg: 'availability', kind: 'enum', required: true, values: CC.AVAILABILITY.map((a) => a.value), label: 'Commercial product status: marketed and not in shortage (marketed), on FDA\'s shortage list as currently in shortage (shortage), or discontinued (discontinued)' },
      { dom: 'cc-comp', arg: 'compoundedStrength', kind: 'number', required: true, label: 'Compounded strength (same unit as the commercial strength)' },
      { dom: 'cc-comm', arg: 'commercialStrength', kind: 'number', required: true, label: 'Commercial strength' },
      { dom: 'cc-route', arg: 'sameRoute', kind: 'enum', required: true, values: YN, label: 'Commercial product can be used by the route prescribed (yes or no)' },
      { dom: 'cc-det', arg: 'determination', kind: 'enum', required: true, values: YN, label: 'Prescriber\'s significant-difference determination is documented (yes or no)' },
      { dom: 'cc-count', arg: 'priorCount', kind: 'number', required: true, label: 'Prescriptions filled this month without a determination' },
    ],
  },
];
