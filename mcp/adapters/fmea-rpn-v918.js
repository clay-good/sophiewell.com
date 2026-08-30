// spec-v918 MCP adapter: the FMEA risk priority number in lib/fmea-rpn-v918.js. The dom keys
// mirror the browser renderer (views/group-v918.js) and META['fmea-rpn'].example.
//
// The result carries NO band, on purpose. Administrative domain.

import { fmeaRpn } from '../../lib/fmea-rpn-v918.js';

export default [
  {
    id: 'fmea-rpn',
    summary: 'Multiplies the three FMEA scores into a risk priority number: severity times occurrence times detection, each 1 to 10, product 1 to 1000. IT DOES NOT RANK, which is the point: a product collapses three different questions into one, so 10 x 5 x 2 and 2 x 5 x 10 both come to 100 and only one of them describes something that kills someone. SEVERITY CAN FORCE ACTION ON ITS OWN -- a severe failure mode stays severe however rare it is and however well it is caught. DETECTION IS SCORED BACKWARDS from the other two: 1 means almost certain to be caught, 10 means almost impossible, and entering it in the same direction is a common error the product hides completely. THERE IS NO STANDARD THRESHOLD -- acting above 100 is a local convention appearing in no standard -- so the result is deliberately NOT banded. The 2019 AIAG-VDA revision replaced the risk priority number with an Action Priority for these reasons.',
    compute: fmeaRpn,
    fields: [
      { dom: 'fr-severity', arg: 'severity', kind: 'number', required: true, label: 'Severity, a whole number 1 to 10' },
      { dom: 'fr-occurrence', arg: 'occurrence', kind: 'number', required: true, label: 'Occurrence, a whole number 1 to 10' },
      { dom: 'fr-detection', arg: 'detection', kind: 'number', required: true, label: 'Detection, 1 to 10, where 1 is almost certain to be caught' },
    ],
  },
];
