// spec-v183 MCP wave 46: adapters for the seven neurology instruments in
// lib/neurology-v224.js — ID Migraine, the ONLS neuropathy limitation scale, the
// END-IT autoimmune-encephalitis-status score, the Engel and ILAE epilepsy-
// surgery outcome classifications, the Salzburg NCSE consensus criteria, and the
// Dizziness Handicap Inventory. dom keys mirror views/group-v224.js. The ONLS
// arm/leg, END-IT imaging, Engel outcome, and Salzburg EEG-pattern selects carry
// numeric-string values (modeled as enums); the rest are boolean items and counts.

import * as F from '../../lib/neurology-v224.js';

export default [
  {
    id: 'id-migraine',
    summary: 'ID Migraine (Lipton 2003): nausea, photophobia, and disability screen for migraine; ≥ 2 of 3 is a positive screen.',
    compute: F.idMigraine,
    fields: [
      { dom: 'idm-nausea', arg: 'nausea', kind: 'bool', required: false, label: 'Nausea with headaches' },
      { dom: 'idm-photo', arg: 'photophobia', kind: 'bool', required: false, label: 'Light bothers you (photophobia)' },
      { dom: 'idm-dis', arg: 'disability', kind: 'bool', required: false, label: 'Headaches limit activity ≥ 1 day' },
    ],
  },
  {
    id: 'onls',
    summary: 'Overall Neuropathy Limitations Scale (Graham & Hughes 2006): an arm scale (0–5) plus a leg scale (0–7) give a 0–12 total where a higher score marks greater neuropathy-related functional limitation.',
    compute: F.onls,
    fields: [
      { dom: 'onls-arm', arg: 'arm', kind: 'enum', values: ['0', '1', '2', '3', '4', '5'], required: true, label: 'Arm scale (0–5)' },
      { dom: 'onls-leg', arg: 'leg', kind: 'enum', values: ['0', '1', '2', '3', '4', '5', '6', '7'], required: true, label: 'Leg scale (0–7)' },
    ],
  },
  {
    id: 'end-it-score',
    summary: 'END-IT score (Gao 2016): encephalitis, nonconvulsive status epilepticus, diazepam resistance, imaging findings, and intubation give a 0–6 score where ≥ 3 predicts an unfavorable outcome in autoimmune-encephalitis status epilepticus.',
    compute: F.endIt,
    fields: [
      { dom: 'end-enc', arg: 'encephalitis', kind: 'bool', required: false, label: 'Encephalitis (+1)' },
      { dom: 'end-ncse', arg: 'ncse', kind: 'bool', required: false, label: 'Nonconvulsive status epilepticus (+1)' },
      { dom: 'end-diaz', arg: 'diazepamResistance', kind: 'bool', required: false, label: 'Diazepam resistance (+1)' },
      { dom: 'end-img', arg: 'imaging', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Imaging (normal / unilateral / bilateral)' },
      { dom: 'end-intub', arg: 'intubation', kind: 'bool', required: false, label: 'Intubation (+1)' },
    ],
  },
  {
    id: 'engel-classification',
    summary: 'Engel epilepsy-surgery outcome classification (Engel 1993): Class I free of disabling seizures, II rare disabling, III worthwhile improvement, IV no worthwhile improvement.',
    compute: F.engel,
    fields: [
      { dom: 'eng-out', arg: 'outcome', kind: 'enum', values: ['1', '2', '3', '4'], required: true, label: 'Postoperative seizure outcome (class)' },
    ],
  },
  {
    id: 'ilae-surgical-outcome',
    summary: 'ILAE epilepsy-surgery outcome classification (Wieser 2001): seizure-freedom, auras-only status, and current vs baseline seizure days per year map to outcome class 1–6.',
    compute: F.ilaeOutcome,
    fields: [
      { dom: 'ilae-free', arg: 'seizureFree', kind: 'bool', required: false, label: 'Completely seizure-free, no auras' },
      { dom: 'ilae-aura', arg: 'aurasOnly', kind: 'bool', required: false, label: 'Auras only, no other seizures' },
      { dom: 'ilae-days', arg: 'seizureDays', kind: 'number', required: true, label: 'Current seizure days per year' },
      { dom: 'ilae-base', arg: 'baselineDays', kind: 'number', required: true, label: 'Baseline (preoperative) seizure days per year' },
    ],
  },
  {
    id: 'salzburg-ncse-criteria',
    summary: 'Salzburg consensus criteria for nonconvulsive status epilepticus (Leitinger 2015): the EEG pattern plus secondary criteria (evolution, subtle ictal phenomena, clinical/EEG improvement) classify definite, possible, or not-fulfilled NCSE.',
    compute: F.salzburg,
    fields: [
      { dom: 'salz-pat', arg: 'pattern', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'EEG pattern (worst 10-second epoch)' },
      { dom: 'salz-evo', arg: 'evolution', kind: 'bool', required: false, label: 'Spatiotemporal evolution' },
      { dom: 'salz-ictal', arg: 'subtleIctal', kind: 'bool', required: false, label: 'Subtle clinical ictal phenomena' },
      { dom: 'salz-both', arg: 'clinicalEegImprovement', kind: 'bool', required: false, label: 'Clinical and EEG improvement after IV antiseizure medication' },
      { dom: 'salz-eeg', arg: 'eegOnlyImprovement', kind: 'bool', required: false, label: 'EEG-only improvement after IV antiseizure medication' },
    ],
  },
  {
    id: 'dhi',
    summary: 'Dizziness Handicap Inventory (Jacobson & Newman 1990): 25 items scored No 0 / Sometimes 2 / Yes 4 give a 0–100 total (mild 0–30, moderate 31–60, severe 61–100).',
    compute: F.dhi,
    fields: [
      { dom: 'dhi-yes', arg: 'numberYes', kind: 'number', required: true, label: 'Number of "Yes" answers (0–25)' },
      { dom: 'dhi-some', arg: 'numberSometimes', kind: 'number', required: true, label: 'Number of "Sometimes" answers (0–25)' },
    ],
  },
];
