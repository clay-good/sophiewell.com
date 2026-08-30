// spec-v912 MCP adapter: the NICHD three-tier fetal heart rate categorization in
// lib/nichd-fhr-v912.js. The dom keys mirror the browser renderer (views/group-v912.js) and
// META['nichd-fhr'].example.
//
// Minimal variability is not absent variability, and the result says so. Clinical domain.

import { nichdFhr } from '../../lib/nichd-fhr-v912.js';

export default [
  {
    id: 'nichd-fhr',
    summary: 'Sorts a fetal heart rate tracing into the NICHD three-tier system. Category I needs all of a baseline of 110 to 160 beats per minute, moderate variability, late decelerations absent and variable decelerations absent; early decelerations and accelerations may be present or absent and change nothing. Category III is either absent variability together with recurrent late decelerations, recurrent variable decelerations or bradycardia, or else a sinusoidal pattern. Category II is everything else. CATEGORY II IS A RESIDUAL, NOT A MIDDLE SEVERITY: it is every tracing that is neither I nor III, it covers an enormous range, most tracings fall in it, and it calls for evaluation and continued surveillance rather than standing as a diagnosis. CATEGORY III NEEDS ABSENT VARIABILITY, NOT MINIMAL -- minimal variability with recurrent late decelerations is Category II, and reading minimal as absent is the most common way this system is got wrong. THE CATEGORY DESCRIBES THE TRACING AT A POINT IN TIME; it is not a prediction and none of the three is a management algorithm.',
    compute: nichdFhr,
    fields: [
      { dom: 'nf-baseline', arg: 'baseline', kind: 'number', required: true, label: 'Baseline fetal heart rate', unit: 'beats per minute' },
      { dom: 'nf-variability', arg: 'variability', kind: 'enum', required: false, label: 'Baseline variability', values: ['moderate', 'minimal', 'absent', 'marked'] },
      { dom: 'nf-latedecels', arg: 'lateDecels', kind: 'enum', required: false, label: 'Late decelerations', values: ['absent', 'intermittent', 'recurrent'] },
      { dom: 'nf-variabledecels', arg: 'variableDecels', kind: 'enum', required: false, label: 'Variable decelerations', values: ['absent', 'intermittent', 'recurrent'] },
      { dom: 'nf-sinusoidal', arg: 'sinusoidal', kind: 'enum', required: false, label: 'Sinusoidal pattern (Category III on its own)', values: ['absent', 'present'] },
    ],
  },
];
