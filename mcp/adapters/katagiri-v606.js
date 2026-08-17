// spec-v606 MCP wave: adapter for the new Katagiri score in lib/katagiri-v606.js. The dom keys mirror the
// browser renderer (views/group-v606.js) and META['katagiri'].example.
//
// **THE PRIMARY-SITE ITEM IS DEFINED BY TREATABILITY, NOT BY ORGAN, AND THE SAME ORGAN APPEARS IN TWO
// GROUPS.** Breast and prostate are SLOW growth (0) when HORMONE-DEPENDENT and MODERATE (2) when hormone-
// INDEPENDENT. Lung is MODERATE (2) when molecularly targeted and RAPID (3) when it is not. **NAMING THE
// ORGAN DOES NOT DETERMINE THE SCORE** - an implementation that maps organ to group is wrong for the
// commonest primaries in the series.
//
// **THE LABORATORY ITEM IS TWO TIERS OF DIFFERENT ANALYTES, NOT A SEVERITY LADDER.** Abnormal (1) = CRP,
// LDH or albumin. Critical (2) = platelets, calcium or bilirubin. **THE TWO TIERS SHARE NO ANALYTE.** A
// patient with a CRP of 200 scores 1; a patient whose only abnormality is a platelet count of 99,000 scores
// 2. Reading them as mild-versus-severe of the same test is wrong.
//
// **EACH TIER IS ANY-OF AND CRITICAL OUTRANKS ABNORMAL.** One qualifying value is enough, three do not score
// more, and any critical value fixes the item at 2 - never 3.
//
// **THE 2014 SCORE ADDED THE LABORATORY ITEM TO A 2005 PREDECESSOR.** A score computed without it is the
// older instrument.
//
// **DERIVED IN A MOSTLY NON-SURGICAL COHORT**, unlike `tokuhashi-revised`, `tomita-score` and `bauer-score`
// in this catalog. The survival figures are the derivation cohort's; validation cohorts differ.

import * as K from '../../lib/katagiri-v606.js';

export default [
  {
    id: 'katagiri',
    summary: `The new Katagiri score (Katagiri and colleagues 2014) estimates survival in a patient with symptomatic skeletal metastasis, six factors totalling 0 to ${K.MAX_SCORE}. PRIMARY SITE BY GROWTH RATE: ${K.PRIMARY_SITE_GROUPS.map((g) => `${g.text} = ${g.points} (${g.examples})`).join('; ')}. VISCERAL OR CEREBRAL METASTASES: ${K.VISCERAL_GROUPS.map((g) => `${g.text} = ${g.points}`).join('; ')}. LABORATORY DATA: normal = 0; ABNORMAL = 1 (${K.ABNORMAL_LABS.map((l) => l.text).join('; ')}); CRITICAL = 2 (${K.CRITICAL_LABS.map((l) => l.text).join('; ')}). ONE-POINT ITEMS: ${K.BINARY_ITEMS.map((b) => b.text).join('; ')}. **THE PRIMARY-SITE ITEM IS DEFINED BY TREATABILITY, NOT BY ORGAN, AND THE SAME ORGAN APPEARS IN TWO GROUPS**: breast and prostate are SLOW when hormone-DEPENDENT and MODERATE when hormone-INDEPENDENT, and lung is MODERATE when molecularly targeted and RAPID when it is not. **NAMING THE ORGAN DOES NOT DETERMINE THE SCORE** - mapping organ to group is wrong for the commonest primaries in the series. **THE LABORATORY ITEM IS TWO TIERS OF DIFFERENT ANALYTES, NOT A SEVERITY LADDER**: the tiers SHARE NO ANALYTE, so a CRP of 200 scores 1 while a lone platelet count of 99,000 scores 2. **EACH TIER IS ANY-OF AND CRITICAL OUTRANKS ABNORMAL** - one qualifying value is enough, three do not score more, and any critical value fixes the item at 2, NEVER 3. BANDS, with one-year survival in the DERIVATION cohort: ${K.BANDS.map((b) => `${b.label} = ${b.risk}, ${b.oneYearSurvival} percent`).join('; ')}. **THE 2014 SCORE ADDED THE LABORATORY ITEM TO A 2005 PREDECESSOR**, so a score computed without it is the older instrument. **IT WAS DERIVED IN A MOSTLY NON-SURGICAL COHORT**, unlike \`tokuhashi-revised\`, \`tomita-score\` and \`bauer-score\` in this catalog, so applying it to a purely surgical series is outside its derivation, and validation cohorts report different rates. This is a GROUP-LEVEL SURVIVAL estimate. It does NOT decide whether to operate, does NOT choose between surgery, radiotherapy and systemic treatment, and does NOT grade the bone - mechanical stability and fracture risk are separate axes. The primary-site groupings assume the therapies available when the score was built.`,
    compute: K.katagiri,
    fields: [
      { dom: 'kat-primarySite', arg: 'primarySite', kind: 'enum', values: K.PRIMARY_SITE_GROUPS.map((g) => g.value), required: true, label: `Primary site GROWTH-RATE group, NOT the organ [${K.PRIMARY_SITE_GROUPS.map((g) => `${g.value} = ${g.points}, covering ${g.examples}`).join('; ')}]` },
      { dom: 'kat-visceralMetastases', arg: 'visceralMetastases', kind: 'enum', values: K.VISCERAL_GROUPS.map((g) => g.value), required: true, label: `Visceral or cerebral metastases [${K.VISCERAL_GROUPS.map((g) => `${g.value} = ${g.points}`).join('; ')}]` },
      ...K.ABNORMAL_LABS.map((l) => ({
        dom: `kat-${l.key}`, arg: l.key, kind: 'enum', values: ['no', 'yes'], required: true,
        label: `${l.text}. ABNORMAL tier - any one gives 1 point. This tier shares no analyte with the critical tier.`,
      })),
      ...K.CRITICAL_LABS.map((l) => ({
        dom: `kat-${l.key}`, arg: l.key, kind: 'enum', values: ['no', 'yes'], required: true,
        label: `${l.text}. CRITICAL tier - any one gives 2 points and OUTRANKS the abnormal tier. A different analyte set entirely.`,
      })),
      ...K.BINARY_ITEMS.map((b) => ({
        dom: `kat-${b.key}`, arg: b.key, kind: 'enum', values: ['no', 'yes'], required: true,
        label: `${b.text}. ${b.points} point.`,
      })),
    ],
  },
];
