// spec-v659 MCP adapter: ISGPS delayed gastric emptying grade in lib/isgps-dge-v659.js.
// The dom keys mirror the browser renderer (views/group-v659.js) and
// META['isgps-dge'].example. Three time criteria (NGT duration days, NGT reinsertion POD,
// unable-to-tolerate-solids POD), each optional; the grade is the most severe A/B/C
// satisfied by any criterion. Clinical domain.

import { isgpsDge } from '../../lib/isgps-dge-v659.js';

export default [
  {
    id: 'isgps-dge',
    summary: 'ISGPS grading of delayed gastric emptying (DGE) after pancreatic surgery (Wente 2007). Most severe grade wins across: NGT required 4-7/8-14/>14 days (A/B/C), or NGT reinsertion after POD 3/7/14, or unable to tolerate solids by POD 7/14/21.',
    compute: isgpsDge,
    fields: [
      { dom: 'dge-ngt', arg: 'ngtDays', kind: 'number', required: false, label: 'Nasogastric tube required (days): 4-7 = A, 8-14 = B, >14 = C' },
      { dom: 'dge-reinsert', arg: 'reinsertionPod', kind: 'number', required: false, label: 'NGT reinsertion postoperative day (0 = none): after POD 3 = A, after POD 7 = B, after POD 14 = C' },
      { dom: 'dge-solids', arg: 'unableSolidsPod', kind: 'number', required: false, label: 'Unable to tolerate solid oral intake by postoperative day (0 = tolerating): POD 7 = A, POD 14 = B, POD 21 = C' },
    ],
  },
];
