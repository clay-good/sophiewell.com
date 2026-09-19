// spec-v1390: MCP adapter. The dom keys mirror views/group-v1390.js and this tile's META example.
// A blank element is "not assessed"; only the chosen path's elements are read.

import * as TXC from '../../lib/tx-emergency-detention-criteria-v1390.js';

const C = ['met', 'not-met'];

export default [
  {
    id: 'tx-emergency-detention-criteria',
    summary: 'Checks the Texas emergency detention elements for the chosen path, as SB 1164 rewrote them on September 1, 2025. Paths: a peace officer without a warrant (573.001), a magistrate\'s warrant (573.012), or the physician\'s statement for admission (573.022). The mental illness element is met by a substantial risk of serious harm, severe emotional distress and deterioration, or an inability to recognize symptoms or weigh treatment. The last two are new, so a pre-2025 form shows them as unassessed.',
    compute: TXC.txEmergencyDetentionCriteria,
    fields: [
      { dom: 'txc-path', arg: 'path', kind: 'enum', required: true, label: 'Path', values: TXC.PATHS.map((p) => p.value) },
      { dom: 'txc-mi', arg: 'mentalIllness', kind: 'enum', label: 'Has mental illness', values: C },
      { dom: 'txc-harm', arg: 'harmRisk', kind: 'enum', label: 'Substantial risk of serious harm', values: C },
      { dom: 'txc-distress', arg: 'distress', kind: 'enum', label: 'Severe emotional distress and deterioration', values: C },
      { dom: 'txc-insight', arg: 'insight', kind: 'enum', label: 'Cannot recognize symptoms or weigh treatment', values: C },
      { dom: 'txc-likely', arg: 'likelyHarm', kind: 'enum', label: 'Likely without detention to suffer or inflict serious harm', values: C },
      { dom: 'txc-notime', arg: 'noTime', kind: 'enum', label: 'Not enough time to obtain a warrant (officer)', values: C },
      { dom: 'txc-imminent', arg: 'imminent', kind: 'enum', label: 'Harm imminent unless immediately restrained', values: C },
      { dom: 'txc-restraint', arg: 'restraintNeeded', kind: 'enum', label: 'Restraint needs emergency detention (magistrate)', values: C },
      { dom: 'txc-acceptable', arg: 'acceptable', kind: 'enum', label: 'Statement acceptable to the facility (physician)', values: C },
      { dom: 'txc-least', arg: 'leastRestrictive', kind: 'enum', label: 'Detention is the least restrictive means (physician)', values: C },
      { dom: 'txc-desc-ill', arg: 'describesIllness', kind: 'enum', label: 'Describes the mental illness (physician)', values: C },
      { dom: 'txc-desc-risk', arg: 'describesRisk', kind: 'enum', label: 'Specifically describes the risk of harm (physician)', values: C },
      { dom: 'txc-detail', arg: 'detailedInfo', kind: 'enum', label: 'Gives the detailed basis for the opinion (physician)', values: C },
    ],
  },
];
