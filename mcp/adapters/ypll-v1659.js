// spec-v1659 MCP adapter: ypll in lib/ypll-v1659.js. The dom keys mirror views/group-v1659.js and
// META['ypll'].example.

import * as YP from '../../lib/ypll-v1659.js';

export default [
  {
    id: 'ypll',
    summary: 'Years of potential life lost before an end point such as 65, from age groups or single ages at death. Also the YPLL rate, by CDC\'s midpoint rule.',
    compute: YP.ypll,
    fields: [
      { dom: 'ypll-end', arg: 'endPoint', kind: 'number', required: true, label: 'End point age (years)' },
      { dom: 'ypll-deaths', arg: 'deaths', kind: 'string', required: true, label: 'Age groups (youngest, oldest, deaths) or one age at death per line' },
      { dom: 'ypll-pop', arg: 'population', kind: 'number', required: false, label: 'Population under the end point (for the rate)' },
      { dom: 'ypll-multiplier', arg: 'multiplier', kind: 'enum', values: ['100', '1000', '10000', '100000'], required: false, label: 'Rate multiplier (default per 1,000)' },
    ]
  },
];
