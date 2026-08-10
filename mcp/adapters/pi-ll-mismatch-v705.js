// spec-v705 MCP adapter: PI-LL mismatch in lib/pi-ll-mismatch-v705.js.
// The dom keys mirror the browser renderer (views/group-v705.js) and
// META['pi-ll-mismatch'].example. Two angles in degrees; the difference maps to an
// SRS-Schwab sagittal modifier. Clinical domain.

import { piLlMismatch } from '../../lib/pi-ll-mismatch-v705.js';

export default [
  {
    id: 'pi-ll-mismatch',
    summary: 'PI-LL mismatch (SRS-Schwab; Schwab 2012): pelvic incidence minus lumbar lordosis (degrees). SRS-Schwab sagittal modifier by absolute mismatch: < 10 = 0 (well aligned), 10-20 = +, > 20 = ++. Surgical realignment target is within about +/- 10 degrees (an age-adjusted target allows more in older patients).',
    compute: piLlMismatch,
    fields: [
      { dom: 'pill-pi', arg: 'pelvicIncidence', kind: 'number', unit: 'degrees', required: true, label: 'Pelvic incidence, PI (degrees)' },
      { dom: 'pill-ll', arg: 'lumbarLordosis', kind: 'number', unit: 'degrees', required: true, label: 'Lumbar lordosis magnitude, LL (degrees)' },
    ],
  },
];
