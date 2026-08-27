// spec-v817 MCP adapter: ICHD-3 trigeminal neuralgia in
// lib/trigeminal-neuralgia-ichd3-v817.js. The dom keys mirror the browser renderer
// (views/group-v817.js) and META['trigeminal-neuralgia-ichd3'].example. Clinical domain.

import { trigeminalNeuralgiaIchd3 } from '../../lib/trigeminal-neuralgia-ichd3-v817.js';

export default [
  {
    id: 'trigeminal-neuralgia-ichd3',
    summary: 'Applies the ICHD-3 criteria for trigeminal neuralgia. Recurrent one-sided paroxysms confined to trigeminal divisions; ALL THREE pain characteristics (a fraction of a second to 2 minutes, severe, electric shock-like or stabbing); precipitation by innocuous stimuli; and no better ICHD-3 explanation. Criterion B is all three, not at least two, and the trigger in criterion C is mandatory - purely spontaneous pain does not qualify.',
    compute: trigeminalNeuralgiaIchd3,
    fields: [
      { dom: 'tn-unilateral', arg: 'unilateralParoxysms', kind: 'boolean', required: false, label: 'One-sided trigeminal paroxysms' },
      { dom: 'tn-noradiation', arg: 'noRadiationBeyond', kind: 'boolean', required: false, label: 'No radiation beyond the distribution' },
      { dom: 'tn-duration', arg: 'briefDuration', kind: 'boolean', required: false, label: 'Lasts a fraction of a second to 2 minutes' },
      { dom: 'tn-severity', arg: 'severeIntensity', kind: 'boolean', required: false, label: 'Severe intensity' },
      { dom: 'tn-quality', arg: 'shockLikeQuality', kind: 'boolean', required: false, label: 'Electric shock-like or stabbing quality' },
      { dom: 'tn-trigger', arg: 'triggeredByInnocuousStimuli', kind: 'boolean', required: false, label: 'Triggered by innocuous stimuli' },
      { dom: 'tn-noother', arg: 'noBetterExplanation', kind: 'boolean', required: false, label: 'No better ICHD-3 explanation' },
    ],
  },
];
