// spec-v888 MCP adapter: the FeNO interpretation in lib/feno-v888.js. The dom keys mirror the
// browser renderer (views/group-v888.js) and META.feno.example.
//
// The cutpoints are age-specific, so pass the age group. Clinical domain.

import { feno } from '../../lib/feno-v888.js';

export default [
  {
    id: 'feno',
    summary: 'Reads a fractional exhaled nitric oxide measurement against the age-specific cutpoints published in 2011. In a person twelve years or older, below 25 parts per billion is low, 25 to 50 is intermediate and above 50 is high; in a child under twelve, below 20 is low, 20 to 35 is intermediate and above 35 is high. IT MEASURES EOSINOPHILIC AIRWAY INFLAMMATION, NOT ASTHMA, so a low value does not exclude asthma and instead argues against eosinophilic inflammation and against a corticosteroid response at that moment. THE INTERMEDIATE BAND IS NOT A MILDLY RAISED RESULT: the guideline says to interpret it cautiously and in context. THE CUTPOINTS DIFFER BY AGE. Corticosteroids and smoking lower the number while atopy and rhinitis raise it, and a change over time says more than a single value against a population cutpoint.',
    compute: feno,
    fields: [
      { dom: 'fe-fenoppb', arg: 'fenoPpb', kind: 'number', required: true, label: 'Fractional exhaled nitric oxide, parts per billion', unit: 'ppb' },
      { dom: 'fe-agegroup', arg: 'ageGroup', kind: 'enum', required: false, label: 'Age group, for the cutpoints', values: ['adult', 'child'] },
      { dom: 'fe-oncorticosteroid', arg: 'onCorticosteroid', kind: 'boolean', required: false, label: 'On an inhaled or oral corticosteroid (lowers the number)' },
      { dom: 'fe-currentsmoker', arg: 'currentSmoker', kind: 'boolean', required: false, label: 'Currently smoking (lowers the number)' },
      { dom: 'fe-atopyorrhinitis', arg: 'atopyOrRhinitis', kind: 'boolean', required: false, label: 'Atopy, allergen exposure, or rhinitis (raises the number)' },
      { dom: 'fe-recentspirometry', arg: 'recentSpirometry', kind: 'boolean', required: false, label: 'Spirometry performed shortly before (can move the number)' },
    ],
  },
];
