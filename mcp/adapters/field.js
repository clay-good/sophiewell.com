// spec-v183 MCP wave 70: adapters for the flat prehospital / mass-casualty
// triage screens in lib/field.js - the Cincinnati Prehospital Stroke Scale,
// FAST / BE-FAST, and the START (adult) and JumpSTART (pediatric) MCI triage
// algorithms. dom keys mirror views/group-i.js.
//
// The remaining lib/field.js tiles are deferred to a dedicated pass: the trauma
// field-triage tile reads variable criterion keys from a shipped data/ shard
// (data-driven, not a fixed field list), and the burn / airway / drug-dose
// tiles (bsa_burn's rule-of-nines region array, burn-fluid, peds-ett,
// naloxone, peds-weight-dose) take array inputs or recipe-table lookups that
// need a bespoke toArgs.

import * as F from '../../lib/field.js';

export default [
  {
    id: 'cincinnati',
    summary: 'Cincinnati Prehospital Stroke Scale: facial droop, arm drift, and abnormal speech each 0 (normal) or 1 (abnormal); any single abnormal finding is a positive screen. Returns the abnormal count and positivity.',
    // Echo the three-item denominator so the "N of 3" the tile reports appears
    // in the JSON (self-describing enrichment).
    compute: (a) => {
      const r = F.cincinnatiStroke(a);
      return r == null ? null : { ...r, itemCount: 3 };
    },
    fields: [
      { dom: 'cps-face', arg: 'facialDroop', kind: 'number', required: true, label: 'Facial droop (0 normal / 1 abnormal)' },
      { dom: 'cps-arm', arg: 'armDrift', kind: 'number', required: true, label: 'Arm drift (0 normal / 1 abnormal)' },
      { dom: 'cps-speech', arg: 'abnormalSpeech', kind: 'number', required: true, label: 'Abnormal speech (0 normal / 1 abnormal)' },
    ],
  },
  {
    id: 'fast',
    summary: 'FAST / BE-FAST stroke screen: any positive finding among balance loss, eye/vision change, face droop, arm weakness, or speech change is a positive screen (the balance and eyes items are the BE-FAST extension).',
    // fast(answers, opts) takes a second options object; the browser tile always
    // scores the extended BE-FAST item set.
    compute: (a) => F.fast(a, { extended: true }),
    fields: [
      { dom: 'fast-balance', arg: 'balance', kind: 'bool', label: 'Balance loss (BE-FAST)' },
      { dom: 'fast-eyes', arg: 'eyes', kind: 'bool', label: 'Eyes: vision change (BE-FAST)' },
      { dom: 'fast-face', arg: 'face', kind: 'bool', label: 'Face droop' },
      { dom: 'fast-arms', arg: 'arms', kind: 'bool', label: 'Arm weakness' },
      { dom: 'fast-speech', arg: 'speech', kind: 'bool', label: 'Speech change' },
    ],
  },
  {
    id: 'start-triage',
    summary: 'START adult mass-casualty triage: sorts to Minor (green), Delayed (yellow), Immediate (red), or Expectant (black) from ability to walk, breathing (and whether it returns after airway repositioning), respiratory rate, perfusion (radial pulse / cap refill), and ability to follow commands.',
    compute: F.startTriage,
    fields: [
      { dom: 'st-walk', arg: 'canWalk', kind: 'bool', label: 'Patient can walk' },
      { dom: 'st-breath', arg: 'isBreathing', kind: 'bool', label: 'Patient is breathing (before any maneuver)' },
      { dom: 'st-reposition', arg: 'breathsAfterReposition', kind: 'enum', values: ['na', 'yes', 'no'], label: 'Breaths return after airway repositioning?', to: (v) => (v === 'yes' ? true : v === 'no' ? false : undefined) },
      { dom: 'st-rr', arg: 'respiratoryRate', kind: 'number', label: 'Respiratory rate', unit: 'breaths/min' },
      { dom: 'st-perf', arg: 'hasRadialPulseAndCapRefillUnder2s', kind: 'bool', label: 'Radial pulse present and cap refill < 2 s' },
      { dom: 'st-cmd', arg: 'followsCommands', kind: 'bool', label: 'Follows simple commands' },
    ],
  },
  {
    id: 'jumpstart-triage',
    summary: 'JumpSTART pediatric mass-casualty triage: sorts to Minor / Delayed / Immediate / Expectant from ability to walk, breathing (and whether it returns after 5 rescue breaths), respiratory rate (15-45 normal band), palpable pulse, and AVPU appropriateness.',
    compute: F.jumpStartTriage,
    fields: [
      { dom: 'js-walk', arg: 'canWalk', kind: 'bool', label: 'Child can walk' },
      { dom: 'js-breath', arg: 'isBreathing', kind: 'bool', label: 'Child is breathing (before any maneuver)' },
      { dom: 'js-rescue', arg: 'breathsAfterRescue', kind: 'enum', values: ['na', 'yes', 'no'], label: 'After 5 rescue breaths, breathing returned?', to: (v) => (v === 'yes' ? true : v === 'no' ? false : undefined) },
      { dom: 'js-rr', arg: 'respiratoryRate', kind: 'number', label: 'Respiratory rate', unit: 'breaths/min' },
      { dom: 'js-pulse', arg: 'palpablePulse', kind: 'bool', label: 'Palpable peripheral pulse' },
      { dom: 'js-avpu', arg: 'avpuAppropriate', kind: 'bool', label: 'AVPU appropriate (A, V, or appropriate P)' },
    ],
  },
];
