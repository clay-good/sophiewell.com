// spec-v738 MCP adapter: CAGE-AID (CAGE Adapted to Include Drugs) in lib/cage-aid-v738.js.
// The dom keys mirror the browser renderer (views/group-v738.js) and META['cage-aid'].example.
// Four yes/no enums; each "yes" scores 1 point, summed 0-4, with 2 or more a positive screen.
// Clinical domain.

import { cageAid } from '../../lib/cage-aid-v738.js';

const YN = ['yes', 'no'];

export default [
  {
    id: 'cage-aid',
    summary: "CAGE-AID (CAGE Adapted to Include Drugs) (Brown & Rounds 1995): 4-item yes/no screen for alcohol and other drug problems. The four CAGE items (Cut down, Annoyed, Guilty, Eye-opener) broadened to cover drug use, each scoring 1 point on a 'yes', summed to 0-4. A total of 2 or more is a positive screen warranting further assessment; higher = more concern.",
    compute: cageAid,
    fields: [
      { dom: 'cage-aid-q1', arg: 'q1', kind: 'enum', values: YN, required: true, label: 'Cut down: felt you ought to cut down on drinking or drug use?' },
      { dom: 'cage-aid-q2', arg: 'q2', kind: 'enum', values: YN, required: true, label: 'Annoyed: people criticized your drinking or drug use?' },
      { dom: 'cage-aid-q3', arg: 'q3', kind: 'enum', values: YN, required: true, label: 'Guilty: felt bad or guilty about your drinking or drug use?' },
      { dom: 'cage-aid-q4', arg: 'q4', kind: 'enum', values: YN, required: true, label: 'Eye-opener: used alcohol or drugs first thing in the morning?' },
    ],
  },
];
