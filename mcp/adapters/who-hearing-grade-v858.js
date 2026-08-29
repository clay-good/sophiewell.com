// spec-v858 MCP adapter: the WHO grades of hearing loss in lib/who-hearing-grade-v858.js. The
// dom keys mirror the browser renderer (views/group-v858.js) and
// META['who-hearing-grade'].example.
//
// Pass BOTH ears. The grade comes from the better one, and the separate one-ear category cannot
// be recognised from a single side. Clinical domain.

import { whoHearingGrade } from '../../lib/who-hearing-grade-v858.js';

export default [
  {
    id: 'who-hearing-grade',
    summary: 'Applies the WHO grades of hearing loss to measured thresholds. Each ear averages 0.5, 1, 2 and 4 kHz, and THE GRADE IS READ FROM THE BETTER EAR: under 20 dB is grade 0, then even 15 dB steps through mild, moderate, moderately severe, severe and profound to grade 6 at 95 dB or more. A BETTER EAR UNDER 20 dB WITH A WORSE EAR AT 35 dB OR MORE IS LOSS IN ONE EAR, a separate category added in 2021 rather than a grade, because a deaf ear beside a normal one belongs on neither end of the bilateral scale. Mild starts at 20 dB, not the 26 of the older grading, and the average must include 4 kHz. It does not interpret an audiogram or select a device.',
    compute: whoHearingGrade,
    fields: [
      { dom: 'wh-r500', arg: 'right500', kind: 'number', required: false, label: 'Right ear threshold at 0.5 kHz', unit: 'dB' },
      { dom: 'wh-r1000', arg: 'right1000', kind: 'number', required: false, label: 'Right ear threshold at 1 kHz', unit: 'dB' },
      { dom: 'wh-r2000', arg: 'right2000', kind: 'number', required: false, label: 'Right ear threshold at 2 kHz', unit: 'dB' },
      { dom: 'wh-r4000', arg: 'right4000', kind: 'number', required: false, label: 'Right ear threshold at 4 kHz', unit: 'dB' },
      { dom: 'wh-l500', arg: 'left500', kind: 'number', required: false, label: 'Left ear threshold at 0.5 kHz', unit: 'dB' },
      { dom: 'wh-l1000', arg: 'left1000', kind: 'number', required: false, label: 'Left ear threshold at 1 kHz', unit: 'dB' },
      { dom: 'wh-l2000', arg: 'left2000', kind: 'number', required: false, label: 'Left ear threshold at 2 kHz', unit: 'dB' },
      { dom: 'wh-l4000', arg: 'left4000', kind: 'number', required: false, label: 'Left ear threshold at 4 kHz', unit: 'dB' },
      { dom: 'wh-rpta', arg: 'rightPta', kind: 'number', required: false, label: 'Right ear average over the four frequencies, if already worked out', unit: 'dB' },
      { dom: 'wh-lpta', arg: 'leftPta', kind: 'number', required: false, label: 'Left ear average over the four frequencies, if already worked out', unit: 'dB' },
    ],
  },
];
