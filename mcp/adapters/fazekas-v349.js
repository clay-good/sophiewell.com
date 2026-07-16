// spec-v349 MCP wave: adapter for the Fazekas white matter hyperintensity scale in
// lib/fazekas-v349.js. The dom keys mirror the browser renderer (views/group-v349.js) and
// META['fazekas-wmh'].example. This is a TWO-field tile: `pvh` (periventricular) and `dwmh` (deep
// white matter), each an enum 0-3. The compute reports both grades, their descriptions, and the
// combined total. The example sets pvh=2, dwmh=2; its expected numbers (2, 2, 4 combined of 6)
// round-trip through the default makeToArgs with no custom toArgs (the result echoes them in the band
// text and the pvh/dwmh/total fields).

import * as C from '../../lib/fazekas-v349.js';

export default [
  {
    id: 'fazekas-wmh',
    summary: 'Fazekas scale (Fazekas 1987) of white matter hyperintensities on brain MRI (FLAIR preferred) — rated separately for the periventricular (PVH) and deep white matter (DWMH) regions, each 0-3. PVH: 0 absent, 1 caps or a pencil-thin lining, 2 smooth halo, 3 irregular hyperintensity extending into the deep white matter. DWMH: 0 absent, 1 punctate foci, 2 beginning confluence of foci, 3 large confluent areas. Higher grades indicate a greater white-matter-disease burden, read in the clinical context (age, vascular risk, cognition); the grade alone is not a diagnosis of small vessel disease or dementia. Reports the grades, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.fazekas,
    fields: [
      { dom: 'fz-pvh', arg: 'pvh', kind: 'enum', values: ['0', '1', '2', '3'], label: 'Periventricular (PVH) grade' },
      { dom: 'fz-dwmh', arg: 'dwmh', kind: 'enum', values: ['0', '1', '2', '3'], label: 'Deep white matter (DWMH) grade' },
    ],
  },
];
