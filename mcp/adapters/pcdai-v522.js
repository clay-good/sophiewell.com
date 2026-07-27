// spec-v522 MCP wave: adapter for the Pediatric Crohn's Disease Activity Index in lib/pcdai-v522.js.
// The dom keys mirror the browser renderer (views/group-v522.js) and META['pcdai'].example: pcd-pain ..
// pcd-eim, pcd-hctBand, pcd-hct, pcd-esr, pcd-albumin map to the lib args of the same name.
//
// The eight clinical `fields` are GENERATED from the lib's exported PCDAI_ITEMS, so each label carries that
// item's own three option texts. Their enum values are '0','5','10' -- the POINT VALUES, not 0/1/2 -- because
// the PCDAI's weights are not uniform and an adapter that published a 0/1/2 ordinal would invite a caller to
// send a 2 meaning "severe" and have it scored as two points instead of ten.
//
// THE THREE LABS ARE NUMBERS, NOT PRE-SCORED ENUMS, and that is deliberate. The lib applies the published
// thresholds itself, which keeps the two facts a caller most often gets wrong out of the caller's hands:
//   - HEMATOCRIT has no single cut. The threshold depends on age and sex, so `pcd-hctBand` is a REQUIRED
//     enum generated from the lib's HCT_BANDS. A hematocrit of 34 is 0 points in a girl of 12 and 2.5 in a
//     boy of 12; asking for the raw value plus the band is the only way an agent gets that right.
//   - ALBUMIN scores 0/5/10 while hematocrit and ESR score 0/2.5/5. Publishing the labs as pre-scored enums
//     would hand a caller three "lab" fields that look interchangeable and are not.
// The result returns the per-lab points alongside the total so a caller can show its work.
//
// The example scores 35 (moderate to severe); that number and the activity band are carried by the result
// band, so it flows through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/pcdai-v522.js';

export default [
  {
    id: 'pcdai',
    summary: 'The Pediatric Crohn\'s Disease Activity Index (PCDAI): eleven items for a total of 0 to 100. The weights are not uniform. Eight clinical items score 0, 5, or 10; hematocrit and ESR score 0, 2.5, or 5; and albumin scores 0, 5, or 10 like the eight clinical items rather than like the other two labs, which is what makes 100 reachable. The three laboratory values are entered raw and scored here, because the hematocrit threshold depends on age and sex: 33 or above is 0 points at age 10 or younger, 35 or above for males 11 to 14, 37 or above for males 15 to 19, and 34 or above for females 11 to 19, so a hematocrit of 34 is 0 points in a girl of 12 and 2.5 points in a boy of 12. ESR below 20 scores 0, 20 to 50 scores 2.5, and above 50 scores 5. Albumin at or above 3.5 scores 0, 3.1 to 3.4 scores 5, and 3.0 or below scores 10. Below 10 is inactive disease, 10 to under 30 is mild, and 30 or above is moderate to severe, following the cut scores recommended in the 2005 prospective evaluation. This is a disease-activity index, not a diagnosis and not a treatment plan. It does not diagnose Crohn\'s disease, does not describe disease location or behavior, and does not measure mucosal healing: a child can score in the inactive range with active endoscopic inflammation, so it is not a substitute for endoscopy. It is not an indication to start, stop, escalate, or de-escalate any therapy, and the growth items need serial measurements plotted against a standard curve rather than a single visit.',
    compute: C.pcdai,
    fields: [
      ...C.PCDAI_ITEMS.map((item) => ({
        dom: `pcd-${item.key}`,
        arg: item.key,
        kind: 'enum',
        values: item.options.map((o) => o.value),
        label: `${item.text} [${item.options.map((o) => o.text).join('; ')}]`,
      })),
      {
        dom: 'pcd-hctBand',
        arg: 'hctBand',
        kind: 'enum',
        values: C.HCT_BANDS.map((b) => b.value),
        required: true,
        label: `Age and sex band for the hematocrit threshold - there is no single low-hematocrit cut [${C.HCT_BANDS.map((b) => `${b.value} = ${b.text}, 0 points at ${b.zeroAtOrAbove} or above, 2.5 points at ${b.halfAtOrAbove} or above, 5 points below that`).join('; ')}]`,
      },
      { dom: 'pcd-hct', arg: 'hct', kind: 'number', unit: 'percent', label: 'Hematocrit, scored against the age and sex band above' },
      { dom: 'pcd-esr', arg: 'esr', kind: 'number', unit: 'mm/hr', label: 'ESR - below 20 scores 0, 20 to 50 scores 2.5, above 50 scores 5' },
      { dom: 'pcd-albumin', arg: 'albumin', kind: 'number', unit: 'g/dL', label: 'Serum albumin - 3.5 or above scores 0, 3.1 to 3.4 scores 5, 3.0 or below scores 10. Note this lab is full weight, unlike hematocrit and ESR' },
    ],
  },
];
