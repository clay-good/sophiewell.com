// spec-v737 MCP adapter: Short Michigan Alcoholism Screening Test in lib/smast-v737.js.
// The dom keys mirror the browser renderer (views/group-v737.js) and META['smast'].example.
// Thirteen yes/no enums; items 1, 4, 5 score on "no" and the rest on "yes", summed 0-13.
// Clinical domain.

import { smast } from '../../lib/smast-v737.js';

const YN = ['yes', 'no'];

export default [
  {
    id: 'smast',
    summary: "Short Michigan Alcoholism Screening Test (SMAST) (Selzer 1975): 13-item self-administered yes/no screen for alcohol problems. Each item scores 1 point; items 1, 4, 5 are reverse-keyed (a 'no' scores) and the other ten score on a 'yes', summed to 0-13. A total of 3 or more screens positive for a probable alcohol problem; 2 is borderline; higher = more indication of a drinking problem.",
    compute: smast,
    fields: [
      { dom: 'smast-q1', arg: 'q1', kind: 'enum', values: YN, required: true, label: 'Feel you are a normal drinker? (no scores)' },
      { dom: 'smast-q2', arg: 'q2', kind: 'enum', values: YN, required: true, label: 'Relative/friend worries about your drinking?' },
      { dom: 'smast-q3', arg: 'q3', kind: 'enum', values: YN, required: true, label: 'Ever feel guilty about your drinking?' },
      { dom: 'smast-q4', arg: 'q4', kind: 'enum', values: YN, required: true, label: 'Friends/relatives think you are a normal drinker? (no scores)' },
      { dom: 'smast-q5', arg: 'q5', kind: 'enum', values: YN, required: true, label: 'Able to stop drinking when you want to? (no scores)' },
      { dom: 'smast-q6', arg: 'q6', kind: 'enum', values: YN, required: true, label: 'Ever attended an AA meeting?' },
      { dom: 'smast-q7', arg: 'q7', kind: 'enum', values: YN, required: true, label: 'Drinking created problems with a relative/friend?' },
      { dom: 'smast-q8', arg: 'q8', kind: 'enum', values: YN, required: true, label: 'Ever in trouble at work because of drinking?' },
      { dom: 'smast-q9', arg: 'q9', kind: 'enum', values: YN, required: true, label: 'Neglected obligations 2+ days in a row due to drinking?' },
      { dom: 'smast-q10', arg: 'q10', kind: 'enum', values: YN, required: true, label: 'Ever gone to anyone for help about drinking?' },
      { dom: 'smast-q11', arg: 'q11', kind: 'enum', values: YN, required: true, label: 'Ever in a hospital because of drinking?' },
      { dom: 'smast-q12', arg: 'q12', kind: 'enum', values: YN, required: true, label: 'Ever arrested for driving under the influence?' },
      { dom: 'smast-q13', arg: 'q13', kind: 'enum', values: YN, required: true, label: 'Ever arrested for other drunken behavior?' },
    ],
  },
];
