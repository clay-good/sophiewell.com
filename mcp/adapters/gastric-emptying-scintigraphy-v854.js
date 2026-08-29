// spec-v854 MCP adapter: reading a standardized 4-hour gastric emptying study in
// lib/gastric-emptying-scintigraphy-v854.js. The dom keys mirror the browser renderer
// (views/group-v854.js) and META['gastric-emptying-scintigraphy'].example.
//
// retention4h is the argument that carries the grade. Without it the tool returns an ungraded
// result and says so; do not substitute the 2-hour value for it. Clinical domain.

import { gastricEmptyingScintigraphy } from '../../lib/gastric-emptying-scintigraphy-v854.js';

export default [
  {
    id: 'gastric-emptying-scintigraphy',
    summary: 'Reads a standardized 4-hour gastric emptying study against its own published thresholds. Emptying is delayed above 60 percent retention at 2 hours or above 10 percent at 4 hours, and rapid below 30 percent at 1 hour against a normal 1-hour range of 30 to 90 percent. THE GRADE COMES FROM THE 4-HOUR VALUE AND FROM NOTHING ELSE: 11 to 20 percent is mild, 21 to 35 moderate, 36 to 50 severe and above 50 very severe, so a normal 2-hour value does not rule delayed emptying out and a study stopped at 2 hours cannot be graded. It also flags the two conditions that invalidate the numbers: a blood glucose above 250 to 275 mg/dL delays emptying by itself, and prokinetics or opiates have to be off for two days. It does not by itself diagnose the disease, which needs symptoms as well.',
    compute: gastricEmptyingScintigraphy,
    fields: [
      { dom: 'ges-h1', arg: 'retention1h', kind: 'number', required: false, label: 'Meal still in the stomach at 1 hour: normal 30 to 90, below 30 is rapid', unit: 'percent' },
      { dom: 'ges-h2', arg: 'retention2h', kind: 'number', required: false, label: 'Meal still in the stomach at 2 hours: delayed above 60', unit: 'percent' },
      { dom: 'ges-h4', arg: 'retention4h', kind: 'number', required: false, label: 'Meal still in the stomach at 4 hours: the value that grades the study, delayed above 10', unit: 'percent' },
      { dom: 'ges-glu', arg: 'glucose', kind: 'number', required: false, label: 'Blood glucose at the time of the study', unit: 'mg/dL' },
      { dom: 'ges-drugs', arg: 'drugsHeld', kind: 'boolean', required: false, label: 'Drugs that speed emptying up or slow it down were stopped two days beforehand' },
    ],
  },
];
