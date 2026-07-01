// spec-v183 MCP wave 10: adapters for lib/ltcga-v176.js — falls-risk & physical-performance instruments — STRATIFY, the CDC STEADI battery (30-s chair stand, 4-stage balance, functional reach, gait speed, STEADI algorithm).
// dom keys mirror views/group-v176.js; the compute arg names are the
// verbatim keys those renderers pass. Kind is number for graded / free-numeric
// inputs and enum for the yes/no and sex selects. Default makeToArgs round-trips.

import * as F from '../../lib/ltcga-v176.js';

export default [
  {
    id: 'stratify',
    summary: 'STRATIFY inpatient falls-risk tool: four yes/no risk factors plus Barthel transfer and mobility (0–3). Score 0–5; ≥ 2 high fall risk.',
    compute: F.stratify,
    fields: [
    { dom: 'stratify-fall', arg: 'recentFall', kind: 'enum', values: ["yes","no"], required: true, label: 'Recent Fall' },
    { dom: 'stratify-agitated', arg: 'agitated', kind: 'enum', values: ["yes","no"], required: true, label: 'Agitated' },
    { dom: 'stratify-visual', arg: 'visualImpairment', kind: 'enum', values: ["yes","no"], required: true, label: 'Visual Impairment' },
    { dom: 'stratify-toilet', arg: 'frequentToileting', kind: 'enum', values: ["yes","no"], required: true, label: 'Frequent Toileting' },
    { dom: 'stratify-transfer', arg: 'transfer', kind: 'number', required: true, label: 'Transfer' },
    { dom: 'stratify-mobility', arg: 'mobility', kind: 'number', required: true, label: 'Mobility' },
    ],
  },
  {
    id: 'chair-stand-30s',
    summary: '30-Second Chair Stand (CDC STEADI): full sit-to-stand repetitions in 30 seconds compared with the below-average cut-point for age and sex.',
    compute: F.chairStand30s,
    fields: [
    { dom: 'chair-stands', arg: 'stands', kind: 'number', required: true, label: 'Stands' },
    { dom: 'chair-age', arg: 'age', kind: 'number', required: true, label: 'Age' },
    { dom: 'chair-sex', arg: 'sex', kind: 'enum', values: ["male","female"], required: true, label: 'Sex' },
    ],
  },
  {
    id: 'four-stage-balance',
    summary: '4-Stage Balance Test (CDC STEADI): seconds the full tandem stance is held; holding under 10 s indicates increased fall risk.',
    compute: F.fourStageBalance,
    fields: [
    { dom: 'balance-tandem', arg: 'tandemSeconds', kind: 'number', required: true, label: 'Tandem Seconds' },
    ],
  },
  {
    id: 'functional-reach',
    summary: 'Functional Reach Test: maximal forward reach (cm) against the age- and sex-specific fall-risk threshold.',
    compute: F.functionalReach,
    fields: [
    { dom: 'reach-distance', arg: 'reachCm', kind: 'number', required: true, label: 'Reach Cm' },
    { dom: 'reach-age', arg: 'age', kind: 'number', required: true, label: 'Age' },
    { dom: 'reach-sex', arg: 'sex', kind: 'enum', values: ["male","female"], required: true, label: 'Sex' },
    ],
  },
  {
    id: 'gait-speed',
    summary: 'Habitual gait speed: walked distance (m) divided by time (s), against the healthy-norm and mobility-limitation thresholds.',
    compute: F.gaitSpeed,
    fields: [
    { dom: 'gait-distance', arg: 'distanceM', kind: 'number', required: true, label: 'Distance M' },
    { dom: 'gait-time', arg: 'timeS', kind: 'number', required: true, label: 'Time S' },
    ],
  },
  {
    id: 'steadi-algorithm',
    summary: 'CDC STEADI fall-risk screening algorithm: key screening questions (fell past year, feels unsteady, worries about falling) stratifying to low / moderate / high fall risk.',
    compute: F.steadiAlgorithm,
    fields: [
    { dom: 'steadi-fell', arg: 'fellPastYear', kind: 'enum', values: ["yes","no"], required: true, label: 'Fell Past Year' },
    { dom: 'steadi-count', arg: 'numberOfFalls', kind: 'number', required: true, label: 'Number Of Falls' },
    { dom: 'steadi-injury', arg: 'fallWithInjury', kind: 'enum', values: ["yes","no"], required: true, label: 'Fall With Injury' },
    { dom: 'steadi-unsteady', arg: 'feelsUnsteady', kind: 'enum', values: ["yes","no"], required: true, label: 'Feels Unsteady' },
    { dom: 'steadi-worried', arg: 'worriesAboutFalling', kind: 'enum', values: ["yes","no"], required: true, label: 'Worries About Falling' },
    { dom: 'steadi-gait', arg: 'gaitBalanceProblem', kind: 'enum', values: ["yes","no"], required: true, label: 'Gait Balance Problem' },
    ],
  },
];
