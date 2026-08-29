// spec-v850 MCP adapter: the RoPE index in lib/rope-score-v850.js. The dom keys mirror the
// browser renderer (views/group-v850.js) and META['rope-score'].example.
//
// The four history booleans are the ABSENCE of a risk factor, as the source scores them.
// Clinical domain.

import { ropeScore } from '../../lib/rope-score-v850.js';

export default [
  {
    id: 'rope-score',
    summary: 'Applies the RoPE index (Risk of Paradoxical Embolism) after a cryptogenic stroke in which a patent foramen ovale was found. One point each for no hypertension, no diabetes, no prior stroke or transient ischemic attack, nonsmoker and a cortical infarct on imaging, plus 5 points for age 18 to 29 down to none from 70; total 0 to 10. THE SCORE IS NOT A RISK SCORE. It estimates the PFO-attributable fraction, which rises from 0 percent at 0 to 3 up to 88 percent at 9 to 10, while two-year recurrence runs the other way from 20 percent down to 2 percent. It does not detect a hole, grade a shunt or select closure.',
    compute: ropeScore,
    fields: [
      { dom: 'rope-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'rope-htn', arg: 'noHypertension', kind: 'boolean', required: false, label: 'No history of high blood pressure' },
      { dom: 'rope-dm', arg: 'noDiabetes', kind: 'boolean', required: false, label: 'No history of diabetes' },
      { dom: 'rope-prior', arg: 'noPriorStroke', kind: 'boolean', required: false, label: 'No previous stroke or transient ischemic attack' },
      { dom: 'rope-smoke', arg: 'nonsmoker', kind: 'boolean', required: false, label: 'Nonsmoker' },
      { dom: 'rope-cortical', arg: 'corticalInfarct', kind: 'boolean', required: false, label: 'Cortical infarct on imaging' },
    ],
  },
];
