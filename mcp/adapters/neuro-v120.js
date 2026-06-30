// spec-v183 MCP wave 6: adapters for the five lib/neuro-v120.js neurology
// bedside scores (status-epilepticus prognosis, seizure-recurrence risk, and two
// diagnostic patterns). dom keys mirror views/group-v120.js; graded selects are
// enums the lib lvl()-coerces; the HINTS exam and POUND are categorical / count
// instruments whose examples round-trip through the band/note text.

import * as F from '../../lib/neuro-v120.js';

export default [
  {
    id: 'stess',
    summary: 'Status Epilepticus Severity Score (Rossetti 2008): a 0-6 prognostic score from level of consciousness (0-1), seizure type (0-2), age >= 65 (+2), and no prior seizure history (+1); a score >= 3 is unfavorable.',
    compute: F.stess,
    fields: [
      { dom: 'st-con', arg: 'consciousness', kind: 'enum', values: ['0', '1'], required: true, label: 'Consciousness (alert/somnolent 0, stuporous/comatose 1)' },
      { dom: 'st-sz', arg: 'seizureType', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Worst seizure type' },
      { dom: 'st-age', arg: 'age65', kind: 'bool', label: 'Age 65 or older (+2)' },
      { dom: 'st-prior', arg: 'noPrior', kind: 'bool', label: 'No / unknown prior seizure history (+1)' },
    ],
  },
  {
    id: 'helps2b',
    summary: '2HELPS2B score (Struck 2017): a 0-7 estimate of electrographic-seizure risk on continuous EEG from BIRDs (+2), periodic/rhythmic patterns (+1), sporadic epileptiform discharges (+1), frequency > 2 Hz (+1), plus features (+1), and prior clinical seizure (+1).',
    compute: F.helps2b,
    fields: [
      { dom: 'h2-birds', arg: 'birds', kind: 'bool', label: 'Brief potentially-ictal rhythmic discharges (+2)' },
      { dom: 'h2-periodic', arg: 'periodic', kind: 'bool', label: 'LPDs / LRDA / BIPDs (+1)' },
      { dom: 'h2-sporadic', arg: 'sporadic', kind: 'bool', label: 'Sporadic epileptiform discharges (+1)' },
      { dom: 'h2-fast', arg: 'fast', kind: 'bool', label: 'Periodic / rhythmic pattern > 2 Hz (+1)' },
      { dom: 'h2-plus', arg: 'plus', kind: 'bool', label: 'Plus features (+1)' },
      { dom: 'h2-prior', arg: 'priorSeizure', kind: 'bool', label: 'Prior seizure history (+1)' },
    ],
  },
  {
    id: 'mess-first-seizure',
    summary: 'MESS (Multicentre Study of Early Epilepsy and Single Seizures, Kim 2006): a 0-4 seizure-recurrence risk after a first unprovoked seizure from number of seizures (0-2), a neurological disorder, and an abnormal EEG; banded low / medium / high.',
    compute: F.messFirstSeizure,
    fields: [
      { dom: 'me-sz', arg: 'seizures', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Seizures to date (1 / 2-3 / 4+)' },
      { dom: 'me-neuro', arg: 'neuroDisorder', kind: 'bool', label: 'Neurological disorder' },
      { dom: 'me-eeg', arg: 'abnormalEeg', kind: 'bool', label: 'Abnormal EEG' },
    ],
  },
  {
    id: 'pound-migraine',
    summary: 'POUND mnemonic (Detsky 2006): a 0-5 count of migraine features (Pulsatile, 4-72 hours, Unilateral, Nausea, Disabling); 4 or more strongly favors migraine.',
    compute: F.poundMigraine,
    fields: [
      { dom: 'po-puls', arg: 'pulsatile', kind: 'bool', label: 'Pulsatile / throbbing' },
      { dom: 'po-hours', arg: 'hours', kind: 'bool', label: 'Duration 4-72 hours' },
      { dom: 'po-uni', arg: 'unilateral', kind: 'bool', label: 'Unilateral' },
      { dom: 'po-nausea', arg: 'nausea', kind: 'bool', label: 'Nausea or vomiting' },
      { dom: 'po-dis', arg: 'disabling', kind: 'bool', label: 'Disabling intensity' },
    ],
  },
  {
    id: 'hints',
    summary: 'HINTS / HINTS-plus exam (Kattah 2009) for acute vestibular syndrome: classifies a central (stroke) versus peripheral (benign) pattern from the head-impulse test, nystagmus direction, skew deviation, and new unilateral hearing loss.',
    compute: F.hints,
    fields: [
      { dom: 'hi-impulse', arg: 'headImpulse', kind: 'enum', values: ['abnormal', 'normal'], required: true, label: 'Head-impulse test (abnormal = peripheral, normal = central)' },
      { dom: 'hi-nys', arg: 'nystagmus', kind: 'enum', values: ['fixed', 'changing'], label: 'Nystagmus (fixed = peripheral, direction-changing = central)' },
      { dom: 'hi-skew', arg: 'skew', kind: 'enum', values: ['absent', 'present'], label: 'Skew deviation (present = central)' },
      { dom: 'hi-hear', arg: 'hearingLoss', kind: 'bool', label: 'New unilateral hearing loss (HINTS-plus)' },
    ],
  },
];
