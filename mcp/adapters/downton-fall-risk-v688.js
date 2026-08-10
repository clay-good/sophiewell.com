// spec-v688 MCP adapter: Downton Fall Risk Index in lib/downton-fall-risk-v688.js.
// The dom keys mirror the browser renderer (views/group-v688.js) and
// META['downton-fall-risk'].example. Nine booleans plus two enums; a count 0-11 screens
// fall risk. Clinical domain.

import { downtonFallRisk } from '../../lib/downton-fall-risk-v688.js';

export default [
  {
    id: 'downton-fall-risk',
    summary: 'Downton Fall Risk Index (Downton 1993): one point each for known previous falls; five medication classes (tranquillizers/sedatives, diuretics, antihypertensives, antiparkinson, antidepressants); three sensory deficits (visual, hearing, limb); a confused mental state; and an unsafe gait. Total 0-11; >= 3 = high fall risk. Note: other meds score 0, and an "unable to walk" gait scores 0 (unsafe scores 1).',
    compute: downtonFallRisk,
    fields: [
      { dom: 'dfr-falls', arg: 'previousFalls', kind: 'boolean', required: false, label: 'Known previous falls' },
      { dom: 'dfr-med-tranq', arg: 'medTranquilizer', kind: 'boolean', required: false, label: 'Tranquillizers or sedatives' },
      { dom: 'dfr-med-diuretic', arg: 'medDiuretic', kind: 'boolean', required: false, label: 'Diuretics' },
      { dom: 'dfr-med-antihtn', arg: 'medAntihypertensive', kind: 'boolean', required: false, label: 'Antihypertensives (other than diuretics)' },
      { dom: 'dfr-med-parkinson', arg: 'medAntiparkinson', kind: 'boolean', required: false, label: 'Antiparkinson drugs' },
      { dom: 'dfr-med-antidep', arg: 'medAntidepressant', kind: 'boolean', required: false, label: 'Antidepressants' },
      { dom: 'dfr-sens-visual', arg: 'sensoryVisual', kind: 'boolean', required: false, label: 'Visual impairment' },
      { dom: 'dfr-sens-hearing', arg: 'sensoryHearing', kind: 'boolean', required: false, label: 'Hearing impairment' },
      { dom: 'dfr-sens-limb', arg: 'sensoryLimb', kind: 'boolean', required: false, label: 'Limb deficit (amputation, neuropathy)' },
      { dom: 'dfr-mental', arg: 'mentalState', kind: 'enum', values: ['oriented', 'confused'], required: true, label: 'Mental state' },
      { dom: 'dfr-gait', arg: 'gait', kind: 'enum', values: ['normal', 'safe-with-aids', 'unsafe', 'unable'], required: true, label: 'Gait' },
    ],
  },
];
