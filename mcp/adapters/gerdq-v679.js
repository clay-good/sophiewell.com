// spec-v679 MCP adapter: GerdQ reflux questionnaire in lib/gerdq-v679.js.
// The dom keys mirror the browser renderer (views/group-v679.js) and
// META['gerdq'].example. Six frequency enums (band 0-3 = 0 / 1 / 2-3 / 4-7 days); a
// weighted sum 0-18 screens for GERD. Clinical domain.

import { gerdq } from '../../lib/gerdq-v679.js';

const DAYS = ['0', '1', '2', '3']; // band index: 0 days / 1 day / 2-3 days / 4-7 days

export default [
  {
    id: 'gerdq',
    summary: 'GerdQ (Jones 2009): six-item screen for gastroesophageal reflux disease over the past week. Positive predictors score 0-3 with frequency (heartburn, regurgitation, sleep disturbance, over-the-counter medication); negative predictors are reverse-scored 3-0 (epigastric pain, nausea). Each field is a frequency band 0-3 (0 days / 1 day / 2-3 days / 4-7 days). Total 0-18; >= 8 = high likelihood of GERD (approx GERD probability 0-2 ~0%, 3-7 ~50%, 8-10 ~79%, 11-18 ~89%). Impact subscore (sleep + medication) 0-6.',
    compute: gerdq,
    fields: [
      { dom: 'gq-heartburn', arg: 'heartburn', kind: 'enum', values: DAYS, required: true, label: 'Heartburn frequency band (0-3)' },
      { dom: 'gq-regurgitation', arg: 'regurgitation', kind: 'enum', values: DAYS, required: true, label: 'Regurgitation frequency band (0-3)' },
      { dom: 'gq-epigastric', arg: 'epigastric', kind: 'enum', values: DAYS, required: true, label: 'Epigastric pain frequency band (0-3; reverse-scored)' },
      { dom: 'gq-nausea', arg: 'nausea', kind: 'enum', values: DAYS, required: true, label: 'Nausea frequency band (0-3; reverse-scored)' },
      { dom: 'gq-sleep', arg: 'sleep', kind: 'enum', values: DAYS, required: true, label: 'Reflux-related sleep disturbance band (0-3)' },
      { dom: 'gq-medication', arg: 'medication', kind: 'enum', values: DAYS, required: true, label: 'Extra over-the-counter reflux medication band (0-3)' },
    ],
  },
];
