// spec-v183 MCP wave 14: adapters for the four lib/function-v154.js functional /
// fall-risk / performance-status tiles. dom keys mirror views/group-v154.js; arg
// names mirror the lib signatures. Berg Balance takes 14 fixed item scores whose
// lib arg names are q1..q14 (the renderer builds the same object), so the default
// makeToArgs applies without a bespoke transform.

import * as F from '../../lib/function-v154.js';

const BERG_ITEMS = [
  'Sitting to standing', 'Standing unsupported', 'Sitting unsupported',
  'Standing to sitting', 'Transfers', 'Standing with eyes closed',
  'Standing with feet together', 'Reaching forward with outstretched arm',
  'Retrieving object from floor', 'Turning to look behind',
  'Turning 360 degrees', 'Placing alternate foot on step',
  'Standing with one foot in front', 'Standing on one leg',
];

export default [
  {
    id: 'berg-balance',
    summary: 'Berg Balance Scale (Berg 1989): fourteen 0–4 balance tasks summed to a 0–56 total; lower totals indicate greater fall risk.',
    compute: F.bergBalance,
    fields: BERG_ITEMS.map((label, i) => ({ dom: `berg-q${i + 1}`, arg: `q${i + 1}`, kind: 'number', label: `${i + 1}. ${label} (0–4)` })),
  },
  {
    id: 'tug',
    summary: 'Timed Up and Go (Podsiadlo 1991): seconds to rise, walk 3 m, turn, and sit; ≥ 12 s meets the CDC STEADI increased-fall-risk threshold.',
    compute: F.tug,
    fields: [
      { dom: 'tug-secs', arg: 'seconds', kind: 'number', required: true, label: 'Time (seconds)' },
    ],
  },
  {
    id: 'tinetti-poma',
    summary: 'Tinetti POMA (Tinetti 1986): balance (0–16) + gait (0–12) sub-scores to a 0–28 total; lower totals indicate higher fall risk.',
    compute: F.tinettiPoma,
    fields: [
      { dom: 'poma-balance', arg: 'balance', kind: 'number', label: 'Balance sub-score (0–16)' },
      { dom: 'poma-gait', arg: 'gait', kind: 'number', label: 'Gait sub-score (0–12)' },
    ],
  },
  {
    id: 'pps',
    summary: 'Palliative Performance Scale v2 (Anderson 1996): ambulation, activity/disease evidence, self-care, intake, and consciousness map to a 0–100% performance level.',
    compute: F.pps,
    fields: [
      { dom: 'pps-amb', arg: 'ambulation', kind: 'enum', values: ['full', 'reduced', 'mainly-sit', 'mainly-bed', 'bed-bound', 'death'], label: 'Ambulation' },
      { dom: 'pps-act', arg: 'activity', kind: 'enum', values: ['normal-no-evidence', 'normal-some-evidence', 'normal-effort', 'unable-job', 'unable-hobby', 'unable-any-work', 'unable-most', 'unable-any'], label: 'Activity & evidence of disease' },
      { dom: 'pps-self', arg: 'selfCare', kind: 'enum', values: ['full', 'occasional', 'considerable', 'mainly', 'total'], label: 'Self-care' },
      { dom: 'pps-intake', arg: 'intake', kind: 'enum', values: ['normal', 'reduced', 'minimal', 'mouth-care'], label: 'Intake' },
      { dom: 'pps-cons', arg: 'conscious', kind: 'enum', values: ['full', 'confusion', 'drowsy', 'coma'], label: 'Level of consciousness' },
    ],
  },
];
