// spec-v593 MCP wave: adapter for the revised Bethesda guidelines in lib/bethesda-v593.js. The dom keys
// mirror the browser renderer (views/group-v593.js) and META['bethesda'].example.
//
// **ANY ONE CRITERION IS ENOUGH, AND THIS IS THE OPPOSITE OF ITS COMPANION.** `amsterdam-ii` in this catalog
// is an AND of six requirements that must ALL be satisfied; this is an OR of five of which ONE triggers
// testing. Applying conjunction logic here would suppress testing in nearly everyone these guidelines were
// written for.
//
// **THE TUMOR SPECTRUM IS FAR BROADER THAN AMSTERDAM II'S, AND THAT IS THE POINT.** Amsterdam II counts
// five cancers; this spectrum adds stomach, ovarian, pancreas, biliary tract, brain and sebaceous lesions. A
// FAMILY WHOSE CANCERS ARE GASTRIC AND OVARIAN FAILS AMSTERDAM II ON SPECTRUM ALONE AND STILL TRIGGERS
// BETHESDA. The two tiles WILL disagree for that family, and that is correct, not a bug.
//
// **THERE ARE THREE DIFFERENT AGE RULES IN FIVE CRITERIA AND TWO CRITERIA HAVE NONE**: under 50 (criterion
// 1), under 60 (criterion 3), one cancer under 50 (criterion 4), and REGARDLESS OF AGE (criteria 2 and 5).
// Carrying one threshold across the set is the easiest way to get this wrong.
//
// **THE 60-YEAR THRESHOLD WAS SETTLED BY A VOTE, NOT BY DATA.** The revision's own account records that
// there was no consensus on whether to include an age criterion at all and that the participants voted to
// keep "less than 60 years". Report it as a convention, not a measured cut point.
//
// **CRITERION 3 USES A PATHOLOGIST'S IMPRESSION OF MSI TO DECIDE WHETHER TO TEST FOR MSI**: "MSI-H
// histology" is a morphological judgment, not a laboratory result, so it is a screening step for the
// screening test and depends on who read the slide.
//
// **ADJACENT CRITERIA USE DIFFERENT DEGREES OF RELATIVE**: criterion 4 is FIRST-degree only, criterion 5 is
// first- OR SECOND-degree.
//
// SOURCING NOTE: two renderings disagreed on three cells and a third source resolved all three in favour of
// the verbatim 2004 text, which is what is implemented.

import * as B from '../../lib/bethesda-v593.js';

export default [
  {
    id: 'bethesda',
    summary: `The REVISED BETHESDA GUIDELINES (Umar and colleagues 2004) identify colorectal tumors that should be TESTED for MICROSATELLITE INSTABILITY. **ANY ONE of five criteria is enough** - there is no count and no threshold: ${B.CRITERIA.map((c, i) => `(${i + 1}) ${c.text}`).join('; ')}. **THIS IS THE OPPOSITE LOGIC TO ITS COMPANION**: \`amsterdam-ii\` in this catalog is an AND of six requirements that must ALL be satisfied, while this is an OR of five. Applying conjunction logic here would suppress testing in nearly everyone these guidelines were written for. **THE TUMOR SPECTRUM IS FAR BROADER THAN AMSTERDAM II'S** - here it is ${B.SPECTRUM.join(', ')}, against Amsterdam II's ${B.AMSTERDAM_II_SPECTRUM.join(', ')} - so **A FAMILY WHOSE CANCERS ARE GASTRIC AND OVARIAN FAILS AMSTERDAM II ON SPECTRUM ALONE AND STILL TRIGGERS BETHESDA**. The two tiles WILL disagree for that family, and that is correct rather than a bug. **THERE ARE THREE DIFFERENT AGE RULES IN FIVE CRITERIA AND TWO CRITERIA HAVE NONE**: under ${B.AGE_EARLY_ONSET}, under ${B.AGE_MSI_HISTOLOGY}, one cancer under ${B.AGE_EARLY_ONSET}, and REGARDLESS OF AGE for criteria 2 and 5. Carrying one threshold across the set is the easiest way to get this wrong. **THE ${B.AGE_MSI_HISTOLOGY}-YEAR THRESHOLD WAS SETTLED BY A VOTE, NOT BY DATA** - the revision's own account records that there was no consensus on whether to include an age criterion at all and that the participants voted to keep it, so report it as a convention. **CRITERION 3 USES A PATHOLOGIST'S IMPRESSION OF MSI TO DECIDE WHETHER TO TEST FOR MSI**: MSI-high histology means ${B.MSI_HISTOLOGY_FEATURES.join(', ')} - a morphological judgment, not a laboratory result, so it is a screening step for the screening test and depends on who read the slide. **ADJACENT CRITERIA USE DIFFERENT DEGREES OF RELATIVE**: criterion 4 counts FIRST-degree only, criterion 5 counts first- OR SECOND-degree. These guidelines decide **WHO GETS A TEST, NOT WHO HAS LYNCH SYNDROME**. Meeting a criterion is NOT a diagnosis and NOT a prediction. **FAILING ALL FIVE DOES NOT EXCLUDE LYNCH SYNDROME** - many centers have moved to universal tumor testing precisely because criteria-driven selection misses cases - and a normal MSI or mismatch-repair result does not exclude the syndrome either. Germline testing carries implications for RELATIVES and belongs with genetic counseling.`,
    compute: B.bethesda,
    fields: B.CRITERIA.map((c) => ({
      dom: `beth-${c.key}`, arg: c.key, kind: 'enum', values: ['no', 'yes'], required: true,
      label: `${c.text}. AGE RULE: ${c.ageRule}. Any one criterion alone indicates testing.`,
    })),
  },
];
