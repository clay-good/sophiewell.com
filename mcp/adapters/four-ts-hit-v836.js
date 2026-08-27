// spec-v836 MCP adapter: the 4Ts score in lib/four-ts-hit-v836.js.
// The dom keys mirror the browser renderer (views/group-v836.js) and
// META['four-ts-hit'].example. Clinical domain.

import { fourTsHit } from '../../lib/four-ts-hit-v836.js';

export default [
  {
    id: 'four-ts-hit',
    summary: 'Scores the 4Ts pretest probability of heparin-induced thrombocytopenia over four domains of 0 to 2 points. 6-8 high, 4-5 intermediate, 3 or below low. Two things beyond the arithmetic: the timing window is days 5 to 14, not the narrower 5 to 10 still widely quoted; and a LOW score is a reason NOT to send laboratory testing, because the score rules the diagnosis out far better than it rules it in.',
    compute: fourTsHit,
    fields: [
      { dom: 'fts-thrombocytopenia', arg: 'thrombocytopenia', kind: 'number', required: false, label: 'Thrombocytopenia, 0 to 2' },
      { dom: 'fts-timing', arg: 'timing', kind: 'number', required: false, label: 'Timing of the platelet fall, 0 to 2' },
      { dom: 'fts-thrombosis', arg: 'thrombosis', kind: 'number', required: false, label: 'Thrombosis or other sequelae, 0 to 2' },
      { dom: 'fts-other', arg: 'otherCauses', kind: 'number', required: false, label: 'Other causes of thrombocytopenia, 0 to 2' },
      { dom: 'fts-missing', arg: 'keyInformationMissing', kind: 'boolean', required: false, label: 'Key information is missing' },
    ],
  },
];
