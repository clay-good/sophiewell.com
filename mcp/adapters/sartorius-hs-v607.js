// spec-v607 MCP wave: adapter for the modified Sartorius score in lib/sartorius-hs-v607.js. The dom keys
// mirror the browser renderer (views/group-v607.js) and META['sartorius-hs'].example.
//
// **THE PUBLISHED UNIT IS A SINGLE ANATOMICAL REGION AND THE PATIENT'S TOTAL IS THE SUM ACROSS REGIONS.**
// This computes ONE region's score. Do NOT present a regional score as the patient's total, and do NOT
// invent an aggregation rule beyond the sum.
//
// **THERE IS NO MAXIMUM.** Lesions are counted individually and regions are summed, so the score is
// unbounded and can reach the hundreds. Never report "x of y" and never normalize it.
//
// **A DRAINING FISTULA IS WORTH SIX NODULES** (6 against 1). Lesion TYPE dominates lesion COUNT: six nodules
// and one fistula score the same. NEVER collapse the two into one "lesion" count - that is wrong by a factor
// of six on the item that matters most.
//
// **THE DISTANCE TERM TRIPLES AT EACH STEP** (1, 3, 9), so a single span greater than 10 cm is worth NINE
// nodules. It is not a linear measure of size.
//
// **THE SEPARATION ITEM IS THE HURLEY QUESTION IN DISGUISE**: "lesions NOT separated by normal skin" is the
// defining feature of Hurley stage III, and one reproduction states the item directly as 9 points for a
// Hurley stage III area. `hurley-stage` is its own tile in this catalog - the two instruments are NOT
// independent.
//
// **NO SEVERITY BAND IS RETURNED.** `band` is always null. One reproduction gives high above 60 and moderate
// 20 to 60; a comparative review states no bands are provided. A single-sourced band table is reported, not
// applied. DO NOT substitute one.

import * as S from '../../lib/sartorius-hs-v607.js';

export default [
  {
    id: 'sartorius-hs',
    summary: `The MODIFIED SARTORIUS SCORE (Sartorius and colleagues 2009) measures the EXTENT of hidradenitis suppurativa. **THE PUBLISHED UNIT IS A SINGLE ANATOMICAL REGION AND THE PATIENT'S TOTAL IS THE SUM ACROSS REGIONS** - this computes ONE region: ${S.REGION_POINTS} points for the region being involved, plus ${S.NODULE_POINTS} per nodule, plus ${S.FISTULA_POINTS} per draining fistula, plus a distance term [${S.DISTANCE_BANDS.map((d) => `${d.text} = ${d.points}`).join('; ')}], plus ${S.SEPARATION_POINTS} if the lesions are NOT separated by normal skin. Do NOT present a regional score as the patient's total. **THERE IS NO MAXIMUM** - lesions are counted individually and regions summed, so the score is unbounded and can reach the hundreds; never report "x of y" and never normalize it. **A DRAINING FISTULA IS WORTH SIX NODULES**: lesion TYPE dominates lesion COUNT, six nodules and one fistula score the same, and collapsing the two into one "lesion" count is wrong by a factor of six on the item that matters most. **THE DISTANCE TERM TRIPLES AT EACH STEP** (1, 3, 9), so a single span over 10 cm is worth NINE nodules - it is not a linear measure of size. **THE SEPARATION ITEM IS THE HURLEY QUESTION IN DISGUISE**: lesions not separated by normal skin is the defining feature of Hurley stage III, and one reproduction states the item directly as ${S.SEPARATION_POINTS} points for a Hurley stage III area, so this score embeds a Hurley judgment as a single item and \`hurley-stage\` in this catalog is NOT independent of it. **NO SEVERITY BAND IS RETURNED** - \`band\` is ALWAYS null, because one reproduction gives high above 60 and moderate 20 to 60 while a comparative review states no bands are provided; a single-sourced band table is reported, not applied, and must NOT be substituted. It was SUPERSEDED FOR BEING TIME-CONSUMING: the IHS4, also in this catalog, was produced by a Delphi process explicitly to give an easy-to-use formula, and this score uses examination findings ONLY, with no patient-reported component. This measures disease EXTENT at one point in time, mainly for trials and follow-up. It does NOT diagnose hidradenitis suppurativa, does NOT select medical or surgical treatment, and does NOT measure pain, drainage, odor or quality of life - which are what patients most often report as the burden - so **a falling score does not by itself mean the patient feels better**.`,
    compute: S.sartoriusRegion,
    fields: [
      { dom: 'sart-nodules', arg: 'nodules', kind: 'number', unit: 'nodules', required: true, label: `Nodules IN ONE REGION. ${S.NODULE_POINTS} point each. Count SEPARATELY from fistulas.` },
      { dom: 'sart-fistulas', arg: 'fistulas', kind: 'number', unit: 'fistulas', required: true, label: `Draining fistulas IN ONE REGION. ${S.FISTULA_POINTS} points each - SIX TIMES a nodule. Never merge with the nodule count.` },
      { dom: 'sart-distance', arg: 'distance', kind: 'enum', values: S.DISTANCE_BANDS.map((d) => d.value), required: true, label: `Longest distance between relevant lesions in this region [${S.DISTANCE_BANDS.map((d) => `${d.value} = ${d.points}`).join('; ')}]. TRIPLES at each step.` },
      { dom: 'sart-separated', arg: 'separatedByNormalSkin', kind: 'enum', values: ['yes', 'no'], required: true, label: `Whether the lesions are separated by normal skin. "no" adds ${S.SEPARATION_POINTS} and is the defining feature of HURLEY STAGE III.` },
    ],
  },
];
