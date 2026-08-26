// spec-v787 MCP adapter: ECG atrial-enlargement criteria in lib/atrial-enlargement-v787.js.
// The dom keys mirror the browser renderer (views/group-v787.js) and
// META['atrial-enlargement'].example. Six optional P wave measurements; a criterion is
// evaluated only from the measurements supplied. Clinical domain.

import { atrialEnlargement } from '../../lib/atrial-enlargement-v787.js';

export default [
  {
    id: 'atrial-enlargement',
    summary: 'ECG criteria for atrial enlargement, the atrial companion to the LVH voltage criteria. LEFT is met by any one of: P duration in lead II >= 120 ms; a notched limb-lead P with inter-peak >= 40 ms; a V1 terminal negative deflection >= 40 ms long AND >= 1 mm deep (the Morris index). RIGHT is met by a P amplitude > 2.5 mm in lead II or > 1.5 mm in V1. The thresholds are not symmetric: left are >=, right are strictly >. Sensitivity for the left criteria is about 50% at about 90% specificity.',
    compute: atrialEnlargement,
    fields: [
      { dom: 'ae-pdur', arg: 'pDurationII', kind: 'number', required: false, label: 'P duration, lead II', unit: 'ms' },
      { dom: 'ae-notch', arg: 'notchInterpeak', kind: 'number', required: false, label: 'Notch inter-peak', unit: 'ms' },
      { dom: 'ae-ptfdur', arg: 'ptfDuration', kind: 'number', required: false, label: 'V1 terminal force duration', unit: 'ms' },
      { dom: 'ae-ptfdepth', arg: 'ptfDepth', kind: 'number', required: false, label: 'V1 terminal force depth', unit: 'mm' },
      { dom: 'ae-ampii', arg: 'pAmplitudeII', kind: 'number', required: false, label: 'P amplitude, lead II', unit: 'mm' },
      { dom: 'ae-ampv1', arg: 'pAmplitudeV1', kind: 'number', required: false, label: 'P amplitude, V1', unit: 'mm' },
    ],
  },
];
