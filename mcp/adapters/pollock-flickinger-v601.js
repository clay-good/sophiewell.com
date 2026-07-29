// spec-v601 MCP wave: adapter for the Pollock-Flickinger radiosurgery-based AVM score in
// lib/pollock-flickinger-v601.js. The dom keys mirror the browser renderer (views/group-v601.js) and
// META['pollock-flickinger'].example.
//
// **THE MODIFICATION CHANGED NO COEFFICIENT. IT HALVED THE LOCATION VARIABLE'S RANGE.** Both versions are
// 0.1 x volume + 0.02 x age + 0.3 x location. LOCATION went from a THREE-tier variable (0, 1, 2) to a
// TWO-tier one (0, 1), so its maximum contribution fell from 0.6 to 0.3. A widely circulated rendering
// states the modified coefficient as 0.5; BOTH PRIMARY ABSTRACTS STATE 0.3, which is applied here.
//
// **THE MODIFIED SCORE IS EXACTLY 0.3 LOWER THAN THE ORIGINAL FOR EVERY LOCATION EXCEPT FRONTAL AND
// TEMPORAL.** Parietal, occipital, corpus callosum and cerebellar drop from tier 1 to tier 0; basal ganglia,
// thalamus and brainstem drop from tier 2 to tier 1. Because the outcome bands sit at 1.00, 1.50 and 2.00,
// A CONSTANT SHIFT OF 0.3 CAN MOVE A PATIENT A WHOLE BAND - `bandChanged` marks exactly those patients, and
// the difference in reported obliteration can be 46 percent against 64 percent. Report both scores.
//
// **INTRAVENTRICULAR LOCATION HAS NO HOME IN THE MODIFIED LIST.** The original names it in tier 1; the
// modified list does not mention it at all. `modifiedAvailable` is false and `modified` is null for that
// site. DO NOT assign it a tier by analogy - that is the source's hole, not a gap to fill.
//
// **THE PUBLISHED OUTCOME BANDS OVERLAP AT EXACTLY 2.00** ("1.51 to 2.00" and "2.00 or more"). The higher
// band is applied and `atOverlapBoundary` flags it.
//
// **IT IS A CONTINUOUS SCORE, NOT A GRADE.** Volume and age are unbounded, so there is NO maximum and no
// "x of y" reading - the opposite of `spetzler-ponce` beside it, which is a small ordinal grading
// MICROSURGICAL risk rather than radiosurgical outcome.

import * as P from '../../lib/pollock-flickinger-v601.js';

export default [
  {
    id: 'pollock-flickinger',
    summary: `The POLLOCK-FLICKINGER RADIOSURGERY-BASED AVM SCORE (2002, modified 2008) predicts the outcome of STEREOTACTIC RADIOSURGERY for a brain arteriovenous malformation: ${P.VOLUME_COEFFICIENT} x volume in cm^3 + ${P.AGE_COEFFICIENT} x age in years + ${P.LOCATION_COEFFICIENT} x a location tier. **THE MODIFICATION CHANGED NO COEFFICIENT - IT HALVED THE LOCATION VARIABLE'S RANGE.** The ORIGINAL location ladder is three-tier: ${P.ORIGINAL_LOCATIONS.map((l) => `${l.tier} = ${l.text}`).join('; ')}. The MODIFIED ladder is two-tier: ${P.MODIFIED_LOCATIONS.map((l) => `${l.tier} = ${l.text}`).join('; ')}. A widely circulated rendering states the modified coefficient as ${P.DIVERGENT_LOCATION_COEFFICIENT}; BOTH PRIMARY ABSTRACTS STATE ${P.LOCATION_COEFFICIENT}, which is applied here. **THE MODIFIED SCORE IS EXACTLY ${P.LOCATION_COEFFICIENT} LOWER THAN THE ORIGINAL FOR EVERY LOCATION EXCEPT FRONTAL AND TEMPORAL**, which are tier 0 in both. Because the outcome bands sit at 1.00, 1.50 and 2.00, that constant shift CAN MOVE A PATIENT A WHOLE BAND - \`bandChanged\` marks those patients and the reported obliteration can differ by 46 against 64 percent. **BOTH SCORES ARE RETURNED; report both.** **INTRAVENTRICULAR LOCATION HAS NO HOME IN THE MODIFIED LIST**: the original names it in tier 1, the modified list does not mention it, so \`modifiedAvailable\` is false and \`modified\` is null - DO NOT assign a tier by analogy. REPORTED OUTCOMES BY MODIFIED SCORE: ${P.OUTCOME_BANDS.map((b) => `${b.label} = ${b.obliterationWithoutDeficit} percent obliteration without new deficit and ${b.mrsDecline} percent decline in the modified Rankin scale`).join('; ')}. **THE PUBLISHED BANDS OVERLAP AT EXACTLY 2.00**; the higher band is applied and \`atOverlapBoundary\` flags it. **IT IS A CONTINUOUS SCORE, NOT A GRADE** - volume and age are unbounded, so there is NO maximum and no "x of y" reading, unlike \`spetzler-ponce\` in this catalog, which is a small ordinal grading MICROSURGICAL risk and answers a DIFFERENT QUESTION about the same malformation. This predicts the outcome of RADIOSURGERY at a GROUP level for a patient in whom radiosurgery is ALREADY being considered. It does NOT choose between radiosurgery, microsurgery, embolization and observation - and **observation is a real option, since the ARUBA trial found medical management superior to intervention for UNRUPTURED malformations** over its follow-up. It does NOT plan a dose or a target volume, does NOT estimate rupture risk without treatment, and a favourable score is NOT by itself an indication to treat.`,
    compute: P.pollockFlickinger,
    fields: [
      { dom: 'pf-volume', arg: 'volume', kind: 'number', unit: 'cm^3', required: true, label: `AVM volume. Multiplied by ${P.VOLUME_COEFFICIENT} in both versions.` },
      { dom: 'pf-age', arg: 'age', kind: 'number', unit: 'years', required: true, label: `Patient age. Multiplied by ${P.AGE_COEFFICIENT} in both versions.` },
      {
        dom: 'pf-site', arg: 'site', kind: 'enum', values: P.SITES.map((s) => s.value), required: true,
        label: `Anatomical site. Chosen ONCE; each version's tier is derived, because the two published ladders classify the same site differently [${P.SITES.map((s) => `${s.value} = original tier ${s.originalTier}, modified tier ${s.modifiedTier === null ? 'NOT LISTED' : s.modifiedTier}`).join('; ')}]`,
      },
    ],
  },
];
