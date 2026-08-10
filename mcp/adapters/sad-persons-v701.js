// spec-v701 MCP adapter: SAD PERSONS suicide-risk screen in lib/sad-persons-v701.js.
// The dom keys mirror the browser renderer (views/group-v701.js) and
// META['sad-persons'].example. Ten booleans; a count 0-10 maps to a numeric risk band.
// Clinical domain. SAD PERSONS is a screen, not a rule-out (low sensitivity).

import { sadPersons } from '../../lib/sad-persons-v701.js';

export default [
  {
    id: 'sad-persons',
    summary: 'SAD PERSONS scale (Patterson 1983): mnemonic 10-item suicide-risk screen, one point each for male Sex, Age <19 or >45, Depression, Previous attempt, Ethanol/substance use, Rational thinking loss, Social supports lacking, Organized plan, No spouse/partner, Sickness. Total 0-10; 0-4 lower, 5-6 moderate, 7-10 high. LOW sensitivity - a screen to prompt full assessment, never a rule-out or discharge justification.',
    compute: sadPersons,
    fields: [
      { dom: 'sad-sex', arg: 'maleSex', kind: 'boolean', required: false, label: 'Male sex' },
      { dom: 'sad-age', arg: 'ageRisk', kind: 'boolean', required: false, label: 'Age under 19 or over 45 years' },
      { dom: 'sad-depression', arg: 'depression', kind: 'boolean', required: false, label: 'Depression' },
      { dom: 'sad-prev', arg: 'previousAttempt', kind: 'boolean', required: false, label: 'Previous suicide attempt' },
      { dom: 'sad-etoh', arg: 'substanceUse', kind: 'boolean', required: false, label: 'Excess alcohol or substance use' },
      { dom: 'sad-rational', arg: 'rationalThinkingLoss', kind: 'boolean', required: false, label: 'Rational thinking loss (psychosis or organic illness)' },
      { dom: 'sad-supports', arg: 'lackingSupports', kind: 'boolean', required: false, label: 'Social supports lacking' },
      { dom: 'sad-plan', arg: 'organizedPlan', kind: 'boolean', required: false, label: 'Organized plan' },
      { dom: 'sad-spouse', arg: 'noSpouse', kind: 'boolean', required: false, label: 'No spouse or partner' },
      { dom: 'sad-sickness', arg: 'sickness', kind: 'boolean', required: false, label: 'Sickness (chronic or serious illness)' },
    ],
  },
];
