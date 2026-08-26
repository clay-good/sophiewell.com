// spec-v805 MCP adapter: AMTS in lib/amts-v805.js.
// The dom keys mirror the browser renderer (views/group-v805.js) and META['amts'].example.
// Ten equally weighted booleans; BOTH cutoffs in common use are reported. Clinical domain.

import { amts } from '../../lib/amts-v805.js';

export default [
  {
    id: 'amts',
    summary: 'Scores the Abbreviated Mental Test (Hodkinson 1972), a ten-question bedside cognitive screen. Each correct answer is worth one point, so the total runs 0-10 and higher is better. TWO cutoffs are in common use and disagree: 6 or below from the validation literature, and under 8 from widespread clinical practice, so a score of exactly 7 falls between them. Both are reported rather than one being chosen.',
    compute: amts,
    fields: [
      { dom: 'amts-age', arg: 'age', kind: 'boolean', required: false, label: 'Age stated correctly' },
      { dom: 'amts-time', arg: 'time', kind: 'boolean', required: false, label: 'Time to the nearest hour' },
      { dom: 'amts-addr', arg: 'addressRecall', kind: 'boolean', required: false, label: 'Recalls the address given at the star...' },
      { dom: 'amts-year', arg: 'year', kind: 'boolean', required: false, label: 'The current year' },
      { dom: 'amts-place', arg: 'place', kind: 'boolean', required: false, label: 'The name of the place' },
      { dom: 'amts-two', arg: 'twoPersons', kind: 'boolean', required: false, label: 'Recognizes two people' },
      { dom: 'amts-dob', arg: 'dateOfBirth', kind: 'boolean', required: false, label: 'Date of birth' },
      { dom: 'amts-war', arg: 'warYear', kind: 'boolean', required: false, label: 'The year the First World War started' },
      { dom: 'amts-monarch', arg: 'monarch', kind: 'boolean', required: false, label: 'The name of the present monarch' },
      { dom: 'amts-count', arg: 'countBackwards', kind: 'boolean', required: false, label: 'Counts backward from 20 to 1' },
    ],
  },
];
