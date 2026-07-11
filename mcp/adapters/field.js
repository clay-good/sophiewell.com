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

// The Rule-of-Nines region keys are read from the lib's own table so the schema
// cannot drift; the Lund-Browder region list mirrors the browser tile (its
// compute simply sums the entered percents, so the exact keys are cosmetic).
const NINES_KEYS = Object.keys(F.RULE_OF_NINES_ADULT);
const LUND_REGIONS = [
  'head', 'neck', 'anterior-trunk', 'posterior-trunk', 'arm-left', 'arm-right',
  'forearm-left', 'forearm-right', 'hand-left', 'hand-right', 'thigh-left',
  'thigh-right', 'leg-left', 'leg-right', 'foot-left', 'foot-right', 'genitalia',
];

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

  // --- wave 78: the flat-input burn / airway / drug-dose recipes ----------
  {
    id: 'burn-fluid',
    summary: 'Burn resuscitation fluid: the Parkland (4 mL/kg/%TBSA) and modified Brooke (2 mL/kg/%TBSA) formulas from weight and burn surface area, each split into the first-8-hour and subsequent-16-hour volumes; an optional hours-since-injury shows the remaining volume owed in the first-8-hour window.',
    compute: F.burnFluid,
    fields: [
      { dom: 'bf-w', arg: 'weightKg', kind: 'number', required: true, label: 'Patient weight', unit: 'kg' },
      { dom: 'bf-bsa', arg: 'tbsaPercent', kind: 'number', required: true, label: 'Burn surface area', unit: '% TBSA' },
      { dom: 'bf-h', arg: 'hoursSinceInjury', kind: 'number', label: 'Hours since injury (optional, 0-8)' },
    ],
  },
  {
    id: 'peds-ett',
    summary: 'Pediatric endotracheal-tube size and insertion depth: uncuffed internal diameter = age/4 + 4 mm (cuffed = age/4 + 3.5), depth at the lip = 3 x tube size.',
    compute: F.pediatricEtt,
    fields: [
      { dom: 'pet-age', arg: 'ageYears', kind: 'number', required: true, label: 'Patient age', unit: 'years' },
      { dom: 'pet-cuffed', arg: 'cuffed', kind: 'enum', values: ['uncuffed', 'cuffed'], required: true, label: 'Tube type', to: (v) => v === 'cuffed' },
    ],
  },
  {
    id: 'naloxone',
    summary: 'Naloxone dosing reference for opioid overdose (FDA labeling / CDC guidance): the initial dose, re-dose interval, and escalation ceiling by population (adult / pediatric) and route (IV / IM / intranasal / SC); pediatric doses use the entered weight.',
    compute: F.naloxoneDose,
    fields: [
      { dom: 'nx-pop', arg: 'population', kind: 'enum', values: ['adult', 'pediatric'], required: true, label: 'Population' },
      { dom: 'nx-route', arg: 'route', kind: 'enum', values: ['iv', 'im', 'in', 'sc'], required: true, label: 'Route (IV / IM / intranasal / SC)' },
      { dom: 'nx-w', arg: 'weightKg', kind: 'number', label: 'Pediatric weight (if pediatric)', unit: 'kg' },
    ],
  },
  {
    id: 'peds-weight-dose',
    summary: 'Weight-based pediatric resuscitation dosing: the per-dose amount for a chosen medication recipe (epinephrine IV/IO or IM, atropine, amiodarone, naloxone, D10 dextrose, normal-saline bolus) from the patient weight, with the per-dose cap applied when the weight-based dose exceeds it.',
    compute: F.pedsDose,
    fields: [
      { dom: 'pwd-w', arg: 'weightKg', kind: 'number', required: true, label: 'Patient weight', unit: 'kg' },
      { dom: 'pwd-r', arg: 'recipe', kind: 'enum', values: ['epinephrine-iv-io', 'epinephrine-im-anaphyl', 'atropine', 'amiodarone', 'naloxone', 'dextrose-d10', 'fluid-bolus-ns'], required: true, label: 'Medication recipe' },
    ],
  },
  {
    id: 'bsa_burn',
    summary: 'Burn total-body-surface-area estimate: the adult Rule of Nines (check the involved regions, each weighted 9 / 18 / 1 percent) or the Lund-Browder chart (enter the percent affected per region). Returns the total %TBSA.',
    // Method-branched: the Rule-of-Nines path sums the checked region weights,
    // the Lund-Browder path sums the entered per-region percents. The bespoke
    // toArgs builds the right selection object; the compute dispatches on method.
    compute: (a) => (a.method === 'lund' ? F.lundBrowder(a.percents) : F.ruleOfNines(a.sel)),
    toArgs: (inputs) => {
      if (inputs['bb-method'] === 'lund') {
        const percents = {};
        for (const r of LUND_REGIONS) {
          const key = `bb-l-${r}`;
          if (Object.prototype.hasOwnProperty.call(inputs, key) && inputs[key] !== '' && inputs[key] != null) {
            percents[r] = Number(inputs[key]);
          }
        }
        return { method: 'lund', percents };
      }
      const sel = {};
      for (const k of NINES_KEYS) {
        const v = inputs[`bb-n-${k}`];
        sel[k] = v === true || v === 1 || v === '1' || v === 'true' || v === 'yes';
      }
      return { method: 'nines', sel };
    },
    fields: [
      { dom: 'bb-method', arg: 'method', kind: 'enum', values: ['nines', 'lund'], required: true, label: 'Method (Rule of Nines / Lund-Browder)' },
      ...NINES_KEYS.map((k) => ({ dom: `bb-n-${k}`, arg: `bb-n-${k}`, kind: 'bool', label: `Rule of Nines: ${k} (${F.RULE_OF_NINES_ADULT[k]}%)` })),
      ...LUND_REGIONS.map((r) => ({ dom: `bb-l-${r}`, arg: `bb-l-${r}`, kind: 'number', label: `Lund-Browder: ${r} (% affected)` })),
    ],
  },
  // --- wave 107: the NEXUS c-spine rule, now that its compute is a pure lib fn
  {
    id: 'nexus-cspine',
    summary: 'NEXUS low-risk cervical-spine criteria (Hoffman JR et al. NEJM 2000): cervical-spine imaging is NOT required when ALL FIVE low-risk criteria are met - no posterior midline tenderness, no intoxication, normal alertness, no focal neurologic deficit, and no painful distracting injury. Reports the rule result and the met-criteria count, not an imaging order.',
    compute: F.nexusCspine,
    fields: [
      { dom: 'nx-tender', arg: 'noTenderness', kind: 'bool', label: 'No posterior midline cervical-spine tenderness' },
      { dom: 'nx-intox', arg: 'noIntoxication', kind: 'bool', label: 'No evidence of intoxication' },
      { dom: 'nx-alert', arg: 'normalAlertness', kind: 'bool', label: 'Normal level of alertness' },
      { dom: 'nx-focal', arg: 'noFocalDeficit', kind: 'bool', label: 'No focal neurologic deficit' },
      { dom: 'nx-distract', arg: 'noDistractingInjury', kind: 'bool', label: 'No painful distracting injury' },
    ],
  },
];
