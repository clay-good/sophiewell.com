// spec-v925 MCP adapter: the delta check in lib/delta-check-v925.js. The dom keys mirror the
// browser renderer (views/group-v925.js) and META['delta-check'].example.
//
// No thresholds are supplied: they are local, and with none entered nothing is flagged.
// Clinical domain.

import { deltaCheck } from '../../lib/delta-check-v925.js';

export default [
  {
    id: 'delta-check',
    summary: 'Reports how far a result has moved from the last one on the same patient, three ways: the absolute difference, that difference as a percent of the previous result, and the rate per 24 hours of elapsed time. THE THRESHOLDS ARE LOCAL -- there is no published universal set, every laboratory sets its own from its own population and analyzers, so they are taken as inputs and nothing is supplied; with none entered the deltas are reported and nothing is flagged. A FLAG IS A CHANGE, NOT AN ERROR: the check was invented to catch mislabeled and mixed-up specimens and most of what it flags is real clinical change, so a flag is a reason to look rather than evidence of a specimen problem. RATE IS THE PART THAT GETS LEFT OUT -- the same difference over six hours and over six days are not the same finding, and a laboratory setting only an absolute threshold will flag slow drift and miss fast change, which is why the elapsed time is required. Where the analyte\'s biological variation is known, the reference change value is the principled threshold instead.',
    compute: deltaCheck,
    fields: [
      { dom: 'dc-previous', arg: 'previousResult', kind: 'number', required: true, label: 'Previous result' },
      { dom: 'dc-current', arg: 'currentResult', kind: 'number', required: true, label: 'Current result, in the same units' },
      { dom: 'dc-hours', arg: 'hoursBetween', kind: 'number', required: true, label: 'Hours between the two results' },
      { dom: 'dc-absthreshold', arg: 'absoluteThreshold', kind: 'number', required: false, label: 'Absolute delta threshold, if the laboratory has one' },
      { dom: 'dc-pctthreshold', arg: 'percentThreshold', kind: 'number', required: false, label: 'Percent delta threshold, if the laboratory has one' },
      { dom: 'dc-ratethreshold', arg: 'rateThreshold', kind: 'number', required: false, label: 'Rate threshold per 24 hours, if the laboratory has one' },
    ],
  },
];
