// spec-v1639 MCP adapter: topical-quantity-ftu in lib/topical-quantity-ftu-v1639.js. The dom keys
// mirror views/group-v1639.js and META['topical-quantity-ftu'].example. No clock.

import * as FT from '../../lib/topical-quantity-ftu-v1639.js';

export default [
  {
    id: 'topical-quantity-ftu',
    summary: 'Grams of a cream or ointment for a course, from fingertip units by body area in adults. From Long and Finlay 1991; one fingertip unit is 0.49 g in men and 0.43 g in women. Gives fingertip units and grams per application, grams for the course and tubes. Measured means, not a prescribing rule.',
    compute: FT.topicalQuantityFtu,
    fields: [
      { dom: 'ftu-sex', arg: 'sex', kind: 'enum', required: true, values: FT.SEXES.map((s) => s.value), label: 'Sex (sets the grams in one fingertip unit)' },
      ...FT.AREAS.map((a) => ({ dom: a.dom, arg: a.arg, kind: 'number', label: `${a.label}: how many treated (0${a.max === 2 ? ', 1 or 2' : ' or 1'})`, min: 0, max: a.max })),
      { dom: 'ftu-apps', arg: 'applicationsPerDay', kind: 'number', required: true, label: 'Applications per day' },
      { dom: 'ftu-days', arg: 'days', kind: 'number', required: true, label: 'Days of treatment', unit: 'days' },
      { dom: 'ftu-tube', arg: 'tubeGrams', kind: 'number', label: 'Tube size (optional)', unit: 'g' },
    ],
  },
];
