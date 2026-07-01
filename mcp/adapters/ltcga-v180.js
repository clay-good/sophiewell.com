// spec-v183 MCP wave 13: adapters for the two lib/ltcga-v180.js older-adult
// prognosis tiles (LTC-GA program, Group G). dom keys mirror views/group-v180.js
// and META.example.fields; arg names mirror the lib signatures (o.age band,
// o.male, o.heartFailure, o.vomiting, o.endStage, …). Both are point-table /
// count instruments, so no field carries a unit.

import * as F from '../../lib/ltcga-v180.js';

export default [
  {
    id: 'lee-mortality-index',
    summary: 'Lee 4-Year Mortality Index for older adults (Lee, JAMA 2006): a weighted point sum (age band + male sex + comorbidities + smoking + BMI < 25 + functional difficulties, 0–26) mapped by table lookup to the validation-cohort 4-year all-cause mortality band.',
    compute: F.leeMortalityIndex,
    fields: [
      { dom: 'lee-age', arg: 'age', kind: 'enum', values: ['60to64', '65to69', '70to74', '75to79', '80to84', '85plus'], required: true, label: 'Age band (years)' },
      { dom: 'lee-male', arg: 'male', kind: 'bool', label: 'Male sex' },
      { dom: 'lee-dm', arg: 'diabetes', kind: 'bool', label: 'Diabetes mellitus' },
      { dom: 'lee-cancer', arg: 'cancer', kind: 'bool', label: 'Cancer (excluding non-melanoma skin)' },
      { dom: 'lee-lung', arg: 'lung', kind: 'bool', label: 'Chronic lung disease limiting activity or needing oxygen' },
      { dom: 'lee-chf', arg: 'heartFailure', kind: 'bool', label: 'Congestive heart failure' },
      { dom: 'lee-smoke', arg: 'smoker', kind: 'bool', label: 'Current smoker' },
      { dom: 'lee-bmi', arg: 'bmiUnder25', kind: 'bool', label: 'BMI < 25 kg/m²' },
      { dom: 'lee-bath', arg: 'bathing', kind: 'bool', label: 'Difficulty bathing' },
      { dom: 'lee-walk', arg: 'walking', kind: 'bool', label: 'Difficulty walking several blocks' },
      { dom: 'lee-money', arg: 'money', kind: 'bool', label: 'Difficulty managing money' },
      { dom: 'lee-push', arg: 'pushing', kind: 'bool', label: 'Difficulty pushing / pulling large objects' },
    ],
  },
  {
    id: 'chess-scale',
    summary: 'interRAI CHESS scale (Hirdes, J Am Geriatr Soc 2003): signs/symptoms counted and capped at 2, plus one point each for decline in decision-making, decline in ADL status, and an end-stage (≤ 6-month) prognosis — a 0–5 health-instability score.',
    compute: F.chessScale,
    fields: [
      { dom: 'chess-vomit', arg: 'vomiting', kind: 'bool', label: 'Vomiting' },
      { dom: 'chess-edema', arg: 'edema', kind: 'bool', label: 'Peripheral edema' },
      { dom: 'chess-dyspnea', arg: 'dyspnea', kind: 'bool', label: 'Dyspnea' },
      { dom: 'chess-wtloss', arg: 'weightLoss', kind: 'bool', label: 'Weight loss' },
      { dom: 'chess-dehydr', arg: 'dehydration', kind: 'bool', label: 'Dehydration' },
      { dom: 'chess-intake', arg: 'reducedIntake', kind: 'bool', label: 'Leaving ≥ 25% of food uneaten at most meals' },
      { dom: 'chess-cog', arg: 'declineCognition', kind: 'bool', label: 'Decline in cognition / decision-making' },
      { dom: 'chess-adl', arg: 'declineAdl', kind: 'bool', label: 'Decline in ADL status' },
      { dom: 'chess-eol', arg: 'endStage', kind: 'bool', label: 'End-stage disease, prognosis ≤ 6 months' },
    ],
  },
];
