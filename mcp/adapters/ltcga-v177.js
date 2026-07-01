// spec-v183 MCP wave 10: adapters for lib/ltcga-v177.js — frailty & sarcopenia case-finders — SARC-F, SARC-CalF, PRISMA-7, and the SOF Frailty Index.
// dom keys mirror views/group-v177.js; the compute arg names are the
// verbatim keys those renderers pass. Kind is number for graded / free-numeric
// inputs and enum for the yes/no and sex selects. Default makeToArgs round-trips.

import * as F from '../../lib/ltcga-v177.js';

export default [
  {
    id: 'sarc-f',
    summary: 'SARC-F sarcopenia screen: five self-reported items (strength, walking, rising, stairs, falls) each 0–2. Total 0–10; ≥ 4 positive.',
    compute: F.sarcF,
    fields: [
    { dom: 'sarcf-strength', arg: 'strength', kind: 'number', required: true, label: 'Strength' },
    { dom: 'sarcf-walk', arg: 'assistanceWalking', kind: 'number', required: true, label: 'Assistance Walking' },
    { dom: 'sarcf-rise', arg: 'riseFromChair', kind: 'number', required: true, label: 'Rise From Chair' },
    { dom: 'sarcf-stairs', arg: 'climbStairs', kind: 'number', required: true, label: 'Climb Stairs' },
    { dom: 'sarcf-falls', arg: 'falls', kind: 'number', required: true, label: 'Falls' },
    ],
  },
  {
    id: 'sarc-calf',
    summary: 'SARC-CalF: the SARC-F five items plus calf circumference (a low calf adds 10 points). Total 0–20; ≥ 11 positive for sarcopenia.',
    compute: F.sarcCalf,
    fields: [
    { dom: 'sarcf-strength', arg: 'strength', kind: 'number', required: true, label: 'Strength' },
    { dom: 'sarcf-walk', arg: 'assistanceWalking', kind: 'number', required: true, label: 'Assistance Walking' },
    { dom: 'sarcf-rise', arg: 'riseFromChair', kind: 'number', required: true, label: 'Rise From Chair' },
    { dom: 'sarcf-stairs', arg: 'climbStairs', kind: 'number', required: true, label: 'Climb Stairs' },
    { dom: 'sarcf-falls', arg: 'falls', kind: 'number', required: true, label: 'Falls' },
    { dom: 'calf-cm', arg: 'calfCm', kind: 'number', required: true, label: 'Calf Cm' },
    { dom: 'calf-sex', arg: 'sex', kind: 'enum', values: ["male","female"], required: true, label: 'Sex' },
    ],
  },
  {
    id: 'prisma-7',
    summary: 'PRISMA-7 frailty case-finder: seven yes/no items. ≥ 3 suggests frailty / moderate-to-severe disability.',
    compute: F.prisma7,
    fields: [
    { dom: 'prisma-age', arg: 'over85', kind: 'enum', values: ["yes","no"], required: true, label: 'Over85' },
    { dom: 'prisma-male', arg: 'male', kind: 'enum', values: ["yes","no"], required: true, label: 'Male' },
    { dom: 'prisma-limit', arg: 'healthLimitActivities', kind: 'enum', values: ["yes","no"], required: true, label: 'Health Limit Activities' },
    { dom: 'prisma-help', arg: 'needHelpRegularly', kind: 'enum', values: ["yes","no"], required: true, label: 'Need Help Regularly' },
    { dom: 'prisma-home', arg: 'healthStayHome', kind: 'enum', values: ["yes","no"], required: true, label: 'Health Stay Home' },
    { dom: 'prisma-support', arg: 'canCountOnSomeone', kind: 'enum', values: ["yes","no"], required: true, label: 'Can Count On Someone' },
    { dom: 'prisma-aid', arg: 'usesMobilityAid', kind: 'enum', values: ["yes","no"], required: true, label: 'Uses Mobility Aid' },
    ],
  },
  {
    id: 'sof-frailty-index',
    summary: 'Study of Osteoporotic Fractures Frailty Index: weight loss ≥ 5%, inability to rise 5× from a chair, and reduced energy. 0 robust, 1 pre-frail, ≥ 2 frail.',
    compute: F.sofFrailtyIndex,
    fields: [
    { dom: 'sof-weight', arg: 'weightLoss5pct', kind: 'enum', values: ["yes","no"], required: true, label: 'Weight Loss5pct' },
    { dom: 'sof-rise', arg: 'cannotRise5x', kind: 'enum', values: ["yes","no"], required: true, label: 'Cannot Rise5x' },
    { dom: 'sof-energy', arg: 'reducedEnergy', kind: 'enum', values: ["yes","no"], required: true, label: 'Reduced Energy' },
    ],
  },
];
