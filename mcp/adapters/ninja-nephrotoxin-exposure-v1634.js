// spec-v1634 MCP adapter: ninja-nephrotoxin-exposure in lib/ninja-nephrotoxin-exposure-v1634.js.
// The dom keys mirror views/group-v1634.js and META['ninja-nephrotoxin-exposure'].example.
// Clinical domain. All three counts required (0 is an answer).

import * as NJ from '../../lib/ninja-nephrotoxin-exposure-v1634.js';

export default [
  {
    id: 'ninja-nephrotoxin-exposure',
    summary: 'Whether a hospitalized child meets the NINJA definition of nephrotoxic medication exposure. Exposed means 3 or more nephrotoxic medications on the same day, or an IV aminoglycoside or IV vancomycin for 3 or more days; the program then recommends a daily serum creatinine. Which drugs count is the reader\'s decision: no medication list is included.',
    compute: NJ.ninjaNephrotoxinExposure,
    fields: [
      { dom: 'nnx-count', arg: 'nephrotoxinCount', kind: 'number', required: true, label: 'Nephrotoxic medications given on the same day' },
      { dom: 'nnx-ag', arg: 'aminoglycosideDays', kind: 'number', required: true, label: 'Consecutive days of an IV aminoglycoside (0 if none)', unit: 'days' },
      { dom: 'nnx-van', arg: 'vancomycinDays', kind: 'number', required: true, label: 'Consecutive days of IV vancomycin (0 if none)', unit: 'days' },
    ],
  },
];
