// spec-v656 MCP adapter: ISGPS 2016 POPF grade in lib/isgps-popf-v656.js. The dom keys
// mirror the browser renderer (views/group-v656.js) and META['isgps-popf'].example. A
// decision-logic classifier: the amylase gate (required bool) gates POPF; then a grade-C
// feature (reoperation/organ failure/death) -> C, else a grade-B feature (change in
// management) -> B, else biochemical leak. Clinical domain.

import { isgpsPopf } from '../../lib/isgps-popf-v656.js';

export default [
  {
    id: 'isgps-popf',
    summary: 'ISGPS 2016 grading of postoperative pancreatic fistula (POPF). Gate: drain amylase > 3x upper limit of normal serum amylase on/after POD 3. Grade C = reoperation/organ failure/death; Grade B = clinically relevant change in management; biochemical leak = gate met, no change (formerly Grade A, no longer a true fistula).',
    compute: isgpsPopf,
    fields: [
      { dom: 'popf-gate', arg: 'amylaseGate', kind: 'bool', required: true, label: 'Drain amylase > 3x upper limit of normal serum amylase, on/after POD 3 (the POPF gate)' },
      { dom: 'popf-c', arg: 'gradeCFeature', kind: 'bool', required: false, label: 'Reoperation, single/multiple organ failure, or death attributable to POPF (Grade C)' },
      { dom: 'popf-b', arg: 'gradeBFeature', kind: 'bool', required: false, label: 'Clinically relevant change in management: drains > 3 wk or repositioned, percutaneous/endoscopic drainage, octreotide/antibiotics, angio for bleeding, or infection without organ failure (Grade B)' },
    ],
  },
];
