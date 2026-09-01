// spec-v960 MCP adapter: the mTICI reperfusion grade in lib/tici-v960.js. The dom key mirrors
// the browser renderer (views/group-v960.js) and META['tici'].example.
//
// The single argument takes a fraction band rather than a free percentage, because the two
// scales in circulation split at different fractions and the answer needs to know which side of
// one half and two thirds the angiogram falls. Clinical domain.

import { ticiGrade } from '../../lib/tici-v960.js';

export default [
  {
    id: 'tici',
    summary: 'Grades reperfusion after stroke thrombectomy: the mTICI scale, 0 to 3, from how much of the previously occluded territory is reperfused on the final angiogram. 0 is no perfusion, 1 is flow past the occlusion with little distal filling, 2a is less than half the territory, 2b is more than half, 3 is complete with no visualized occlusion in any distal branch. THE TWO SCALES IN CIRCULATION DISAGREE ABOUT 2b: the modified scale sets it at more than HALF and the original TICI scale at more than TWO THIRDS, so an angiogram between those fractions is mTICI 2b (a procedural success) and original TICI 2a (not one). This returns both and says when they part. SUCCESS IS mTICI 2b TO 3, which the consensus reports as the optimal threshold for a good outcome; most older trials defined success as TIMI 2 to 3 or TICI 2a to 3, so an older success rate is often counting 2a. GRADE 3 MEANS COMPLETE, not near complete.',
    compute: ticiGrade,
    fields: [
      { dom: 'tici-reperf', arg: 'reperfusion', kind: 'enum', required: true, label: 'Reperfusion of the previously occluded territory', values: ['none', 'minimal', 'under-half', 'half-to-two-thirds', 'over-two-thirds', 'complete'] },
    ],
  },
];
