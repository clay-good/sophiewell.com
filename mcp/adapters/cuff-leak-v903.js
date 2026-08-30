// spec-v903 MCP adapter: the cuff leak test in lib/cuff-leak-v903.js. The dom keys mirror the
// browser renderer (views/group-v903.js) and META['cuff-leak'].example.
//
// It reports against BOTH cutoffs because the guideline fixes neither. Clinical domain.

import { cuffLeak } from '../../lib/cuff-leak-v903.js';

export default [
  {
    id: 'cuff-leak',
    summary: 'Computes the cuff leak volume before extubation and reports it against both cutoffs in common use. The leak is the inspired tidal volume minus the averaged expired volume with the cuff down, and the cutoffs are: an absolute leak under 110 mL, and a leak under 10 to 15 percent of the inspired volume. THE GUIDELINE RECOMMENDS THE TEST ONLY IN PATIENTS AT HIGH RISK of post-extubation stridor, because performed on everybody it delays extubations that did not need delaying. A FAILED TEST IS NOT AN INSTRUCTION TO KEEP THE TUBE IN: for a patient who fails and is otherwise ready, systemic steroids at least 4 hours before extubation are suggested, and extubation need not be deferred beyond that. THE POSITIVE PREDICTIVE VALUE IS POOR. The threshold is not settled, so both are reported and neither is offered as the answer.',
    compute: cuffLeak,
    fields: [
      { dom: 'cl-inspiredml', arg: 'inspiredMl', kind: 'number', required: true, label: 'Inspired tidal volume with the cuff up, mL', unit: 'mL' },
      { dom: 'cl-expiredcuffdownml', arg: 'expiredCuffDownMl', kind: 'number', required: true, label: 'Averaged expired volume with the cuff down, mL', unit: 'mL' },
      { dom: 'cl-highrisk', arg: 'highRisk', kind: 'boolean', required: false, label: 'At high risk of post-extubation stridor (the group the guideline recommends testing)' },
    ],
  },
];
