// spec-v690 MCP adapter: Edmonton Frail Scale in lib/edmonton-frail-scale-v690.js.
// The dom keys mirror the browser renderer (views/group-v690.js) and
// META['edmonton-frail-scale'].example. Six 0-2 enums plus five booleans across nine
// domains; the sum 0-17 maps to a frailty band. Clinical domain.

import { edmontonFrailScale } from '../../lib/edmonton-frail-scale-v690.js';

export default [
  {
    id: 'edmonton-frail-scale',
    summary: 'Edmonton Frail Scale (EFS; Rolfson 2006): nine domains summed to max 17. Cognition (0-2), hospitalizations (0-2), self-rated health (0-2), IADLs needing help (0-2), social support (0-2), TUG (0-2), plus one point each for >=5 meds, forgetting meds, weight loss, low mood, incontinence. Bands: 0-5 not frail, 6-7 vulnerable, 8-9 mild, 10-11 moderate, 12-17 severe frailty.',
    compute: edmontonFrailScale,
    fields: [
      { dom: 'efs-cog', arg: 'cognition', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Cognition / clock-drawing (points)' },
      { dom: 'efs-hosp', arg: 'hospitalizations', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Hospital admissions past year (points)' },
      { dom: 'efs-health', arg: 'selfRatedHealth', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Self-rated health (points)' },
      { dom: 'efs-iadl', arg: 'iadlHelp', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'IADLs needing help (points)' },
      { dom: 'efs-social', arg: 'socialSupport', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Social support (points)' },
      { dom: 'efs-meds5', arg: 'meds5plus', kind: 'boolean', required: false, label: 'Takes 5 or more prescription medications' },
      { dom: 'efs-medforget', arg: 'medsForget', kind: 'boolean', required: false, label: 'At times forgets medications' },
      { dom: 'efs-weight', arg: 'weightLoss', kind: 'boolean', required: false, label: 'Recent weight loss' },
      { dom: 'efs-mood', arg: 'lowMood', kind: 'boolean', required: false, label: 'Often feels sad or depressed' },
      { dom: 'efs-incont', arg: 'incontinence', kind: 'boolean', required: false, label: 'Urinary incontinence' },
      { dom: 'efs-tug', arg: 'timedUpGo', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Timed Up and Go (points)' },
    ],
  },
];
