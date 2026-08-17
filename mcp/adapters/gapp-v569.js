// spec-v569 MCP wave: adapter for GAPP in lib/gapp-v569.js. The dom keys mirror the browser renderer
// (views/group-v569.js) and META['gapp'].example.
//
// **THE TWO HISTOLOGICAL-PATTERN FEATURES ADD; THEY ARE NOT ALTERNATIVES.** The published table lists three
// patterns - zellballen 0, large and irregular cell nest 1, pseudorosette 1 - laid out as though one is
// chosen. But summing every other category's maximum with a SINGLE pattern point gives 9, while the same
// table states a maximum of 10. The only reading that reaches 10 is that both features can be present at
// once. An independent summary table lists the pattern maximum as 2, which settles it. Treating them as
// mutually exclusive silently caps the score at 9 and can never produce a maximum-grade tumor.
//
// **THE CATECHOLAMINE TERM IS NON-MONOTONIC AND LOOKS LIKE A BUG.** A NON-FUNCTIONING tumor scores 0 - the
// same as adrenergic, and LESS than noradrenergic at 1. A hormonally silent tumor is treated as low risk on
// this axis even though non-functioning disease is not clinically benign. This is the published ordering
// and must not be "corrected".
//
// **A BIOCHEMICAL VARIABLE SITS INSIDE A HISTOPATHOLOGY GRADE.** The catecholamine type comes from 24-hour
// urine fractionated metanephrine and normetanephrine, not from the slide, and its definition appears in a
// table footnote rather than the table body: raised metanephrine with or without raised normetanephrine is
// adrenergic; raised normetanephrine without raised metanephrine is noradrenergic. An agent given only a
// pathology report cannot supply this field.
//
// **SDHB IMMUNOHISTOCHEMISTRY IS NOT PART OF GAPP.** A modified version adds it and is a separate,
// unvalidated instrument. A score including an SDHB term is not a GAPP score.
//
// **NO GRADE EXCLUDES METASTASIS.** These tumors metastasize years to decades after resection,
// well-differentiated ones included, so a low grade is NOT a reason to stop surveillance - the decision this
// score would most damagingly be misused to settle.

import * as G from '../../lib/gapp-v569.js';

export default [
  {
    id: 'gapp',
    summary: `GAPP, the Grading system for Adrenal Pheochromocytoma and Paraganglioma (Kimura and colleagues, Endocr Relat Cancer 2014), which grades the metastatic potential of a resected specimen from 0 to ${G.GAPP_MAX}. It replaced an earlier scaled score by dropping histological features that concorded poorly between observers and adding a proliferation index and a biochemical phenotype. PARAMETERS: HISTOLOGICAL PATTERN - zellballen is the 0-point baseline, a large and irregular cell nest scores 1, and a pseudorosette even if focal scores 1. **THESE TWO FEATURES ADD; THEY ARE NOT ALTERNATIVES.** The table lists them as though one is chosen, but every other category's maximum summed with a SINGLE pattern point gives 9 while the same table states a maximum of ${G.GAPP_MAX}. The only reading that reaches ${G.GAPP_MAX} is that both can be present at once, and an independent summary table lists the pattern maximum as 2. Treating them as mutually exclusive silently caps the score at 9 and can never produce a maximum-grade tumor. COMEDO-TYPE NECROSIS: ${G.COMEDO_NECROSIS_POINTS} points if present. CELLULARITY: low, under 150 cells per unit area, 0; moderate, 150 to 250, 1; high, over 250, 2 - counted at a specified magnification and OPERATOR-DEPENDENT rather than a laboratory value. KI-67 LABELLING INDEX: under 1 percent 0; 1 to 3 percent 1; over 3 percent 2. VASCULAR OR CAPSULAR INVASION: ${G.INVASION_POINTS} point if present. CATECHOLAMINE TYPE: non-functioning 0; adrenergic 0; noradrenergic 1. **THE CATECHOLAMINE TERM IS NON-MONOTONIC AND LOOKS LIKE A BUG BUT IS NOT**: a NON-FUNCTIONING tumor scores 0, the SAME as adrenergic and LESS than noradrenergic, so a hormonally silent tumor is treated as low risk on this axis although non-functioning disease is not clinically benign. That is the published ordering and must not be corrected. **IT IS ALSO A BIOCHEMICAL VARIABLE INSIDE A HISTOPATHOLOGY GRADE**, derived from 24-hour urine fractionated metanephrine and normetanephrine rather than from the slide, with its definition in a table footnote: raised metanephrine with or without raised normetanephrine is adrenergic, and raised normetanephrine without raised metanephrine is noradrenergic. An agent given only a pathology report cannot supply this field. GRADES: well differentiated 0 to 2, moderately differentiated 3 to 6, poorly differentiated 7 to ${G.GAPP_MAX}, with reported five-year survivals of about 100, 67 and 22 percent. **SDHB IMMUNOHISTOCHEMISTRY IS NOT PART OF GAPP**: a modified version adds it and is a separate, unvalidated instrument, so a score including an SDHB term is not a GAPP score. This grades metastatic POTENTIAL from a resected specimen. It does NOT diagnose pheochromocytoma or paraganglioma and does NOT establish that a tumor has metastasized. **NO GRADE EXCLUDES METASTASIS**: these tumors can metastasize years to decades after resection, well-differentiated ones included, so a low grade is NOT a reason to stop surveillance, which is the decision this score would most damagingly be misused to settle. It says nothing about germline status, and hereditary syndromes carry their own risks and surveillance requirements this does not capture. It does not select adjuvant therapy or an imaging interval.`,
    compute: G.gapp,
    fields: [
      ...G.HISTOLOGICAL_FEATURES.map((f) => ({
        dom: `gapp-${f.key}`, arg: f.key, kind: 'enum', values: ['no', 'yes'], required: true,
        label: `Histological pattern: ${f.text}. ${f.points} point. ADDS with the other pattern feature - they are NOT alternatives, and a tumor showing both scores 2.`,
      })),
      {
        dom: 'gapp-comedo', arg: 'comedoNecrosis', kind: 'enum', values: ['no', 'yes'], required: true,
        label: `Comedo-type necrosis. ${G.COMEDO_NECROSIS_POINTS} points if present.`,
      },
      {
        dom: 'gapp-cellularity', arg: 'cellularity', kind: 'enum',
        values: G.CELLULARITY_LEVELS.map((c) => c.value), required: true,
        label: `Cellularity, counted in cells per unit area at a specified magnification and therefore operator-dependent [${G.CELLULARITY_LEVELS.map((c) => `${c.value} = ${c.text}, ${c.points} points`).join('; ')}]`,
      },
      {
        dom: 'gapp-ki67', arg: 'ki67', kind: 'enum',
        values: G.KI67_LEVELS.map((k) => k.value), required: true,
        label: `Ki-67 labelling index band [${G.KI67_LEVELS.map((k) => `${k.value} = ${k.text}, ${k.points} points`).join('; ')}]`,
      },
      {
        dom: 'gapp-invasion', arg: 'vascularOrCapsularInvasion', kind: 'enum', values: ['no', 'yes'], required: true,
        label: `Vascular or capsular invasion. ${G.INVASION_POINTS} point if present.`,
      },
      {
        dom: 'gapp-catecholamine', arg: 'catecholamineType', kind: 'enum',
        values: G.CATECHOLAMINE_TYPES.map((c) => c.value), required: true,
        label: `Catecholamine type, a BIOCHEMICAL variable from 24-hour urine fractionated metanephrine and normetanephrine, NOT from the slide. NON-MONOTONIC: non-functioning scores the same as adrenergic and LESS than noradrenergic [${G.CATECHOLAMINE_TYPES.map((c) => `${c.value} = ${c.text}, ${c.points} points`).join('; ')}]`,
      },
    ],
  },
];
