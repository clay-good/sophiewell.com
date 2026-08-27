// spec-v818 MCP adapter: ICHD-3 tension-type headache in
// lib/tension-headache-ichd3-v818.js. The dom keys mirror the browser renderer
// (views/group-v818.js) and META['tension-headache-ichd3'].example. `nausea` is a severity
// enum, not a boolean, because the episodic and chronic forms tolerate different amounts of
// it. Clinical domain.

import { tensionHeadacheIchd3 } from '../../lib/tension-headache-ichd3-v818.js';

export default [
  {
    id: 'tension-headache-ichd3',
    summary: 'Applies the ICHD-3 tension-type headache criteria. All three subtypes are assessed together: 2.1 infrequent episodic (10+ episodes on under 1 day a month), 2.2 frequent episodic (10+ on 1-14 days a month for over 3 months) and 2.3 chronic (15+ days a month for over 3 months, no episode count needed). The symptom rule LOOSENS in the chronic form - mild nausea blocks the episodic forms and is allowed in the chronic one.',
    compute: tensionHeadacheIchd3,
    fields: [
      { dom: 'tth-days', arg: 'headacheDaysPerMonth', kind: 'number', required: false, label: 'Headache days per month' },
      { dom: 'tth-episodes', arg: 'episodeCount', kind: 'number', required: false, label: 'Number of episodes' },
      { dom: 'tth-months', arg: 'monthsOfPattern', kind: 'number', required: false, label: 'Months the pattern has run' },
      { dom: 'tth-duration', arg: 'duration', kind: 'enum', required: false, label: 'Episode duration', values: ['under-30-min', '30-min-to-2-hours', 'hours-to-7-days', 'over-7-days-or-unremitting'] },
      { dom: 'tth-bilateral', arg: 'bilateral', kind: 'boolean', required: false, label: 'Both-sided location' },
      { dom: 'tth-pressing', arg: 'pressing', kind: 'boolean', required: false, label: 'Pressing or tightening quality' },
      { dom: 'tth-mild', arg: 'mildOrModerate', kind: 'boolean', required: false, label: 'Mild or moderate intensity' },
      { dom: 'tth-notaggravated', arg: 'notAggravated', kind: 'boolean', required: false, label: 'Not worse with routine activity' },
      { dom: 'tth-nausea', arg: 'nausea', kind: 'enum', required: false, label: 'Nausea severity', values: ['none', 'mild', 'moderate', 'severe'] },
      { dom: 'tth-vomiting', arg: 'vomiting', kind: 'boolean', required: false, label: 'Vomiting' },
      { dom: 'tth-photophobia', arg: 'photophobia', kind: 'boolean', required: false, label: 'Photophobia' },
      { dom: 'tth-phonophobia', arg: 'phonophobia', kind: 'boolean', required: false, label: 'Phonophobia' },
      { dom: 'tth-noother', arg: 'noBetterExplanation', kind: 'boolean', required: false, label: 'No better ICHD-3 explanation' },
    ],
  },
];
