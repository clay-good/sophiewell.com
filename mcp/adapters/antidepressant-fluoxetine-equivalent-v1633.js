// spec-v1633 MCP adapter: antidepressant-fluoxetine-equivalent in
// lib/antidepressant-fluoxetine-equivalent-v1633.js. The dom keys mirror views/group-v1633.js and
// META['antidepressant-fluoxetine-equivalent'].example. Clinical domain. One paper (Hayasaka 2015),
// read from its abstract.

import * as AE from '../../lib/antidepressant-fluoxetine-equivalent-v1633.js';

export default [
  {
    id: 'antidepressant-fluoxetine-equivalent',
    summary: 'An antidepressant dose in fluoxetine equivalents, by Hayasaka 2015. It scales the daily dose by the paper\'s dose equal to fluoxetine 40 mg a day, for 23 antidepressants. A measure of dose intensity for research and audit, not a plan for switching or cross-tapering. Citalopram, duloxetine and vortioxetine are not in the paper\'s primary analysis.',
    compute: AE.antidepressantFluoxetineEquivalent,
    fields: [
      { dom: 'afe-drug', arg: 'drug', kind: 'enum', required: true, values: AE.DRUGS.map((d) => d.value), label: 'Antidepressant' },
      { dom: 'afe-dose', arg: 'dailyDose', kind: 'number', required: true, label: 'Daily dose', unit: 'mg' },
    ],
  },
];
