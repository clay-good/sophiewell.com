// spec-v561 MCP wave: adapter for the Shoulder Pain and Disability Index in lib/spadi-v561.js. The dom keys
// mirror the browser renderer (views/group-v561.js) and META['spadi'].example.
//
// **THE TOTAL IS THE MEAN OF THE TWO SUBSCALE PERCENTAGES, NOT THE SUM OF ALL 13 ITEMS OVER 130.** Thirteen
// items on one 0-10 scale look like a single questionnaire, so summing them and dividing by 130 is the
// obvious move - and it gives a different, wrong number. The pain subscale is its sum out of 50 as a
// percentage, the disability subscale its sum out of 80 as a percentage, and the total is the average of
// those two. The result exposes `naiveTotal`, the wrong-but-tempting computation, so an agent can see the
// two diverge rather than take the distinction on trust.
//
// **THE CONSEQUENCE IS UNEQUAL IMPLICIT ITEM WEIGHTING.** Five pain items carry HALF the total and eight
// disability items carry the other half, so one pain item is worth 1.6 times one disability item. An agent
// reasoning about which answers move the score must know this.
//
// **THE MISSING-DATA RULES DIVERGE BETWEEN SOURCES, SO ONLY COMPLETE FORMS ARE SCORED.** One rendering
// drops an omitted item from its subscale denominator (requiring at least two thirds of each subscale);
// another replaces up to two missing values with the subscale mean. Those rules are NOT equivalent and give
// different totals on the same form. Choosing one silently would report a number under an authority it does
// not have, so the tool requires all 13 items and says in the refusal that the handling of omissions is
// disputed.
//
// THE MINIMAL DETECTABLE CHANGE BELONGS TO A COMPARISON. 13 points at 90 percent confidence is the smallest
// difference between two of the SAME patient's scores unlikely to be measurement noise - it says nothing
// about whether one score is high.

import * as S from '../../lib/spadi-v561.js';

export default [
  {
    id: 'spadi',
    summary: `The Shoulder Pain and Disability Index (SPADI; Roach and colleagues 1991), a PATIENT-REPORTED measure of shoulder pain and function. THIRTEEN items in TWO subscales, each item rated 0 to 10: FIVE PAIN items (${S.PAIN_ANCHORS}) and EIGHT DISABILITY items (${S.DISABILITY_ANCHORS}). SCORING - THIS IS THE PART THAT GETS DONE WRONG: the pain subscale is its sum out of ${S.PAIN_MAX} expressed as a percentage, the disability subscale is its sum out of ${S.DISABILITY_MAX} expressed as a percentage, and THE TOTAL IS THE MEAN OF THOSE TWO PERCENTAGES. It is NOT the sum of all 13 items over 130. Thirteen items on a single 0-to-10 scale look like one questionnaire, so summing them and dividing by 130 is the obvious move, and it gives a DIFFERENT AND WRONG number. The result returns naiveTotal, that wrong-but-tempting computation, alongside the correct total so the two can be seen to diverge. THE CONSEQUENCE IS UNEQUAL IMPLICIT ITEM WEIGHTING: five pain items carry HALF the total while eight disability items carry the other half, so a single pain item is worth 1.6 times a single disability item, and a reader who assumes every item counts equally will misread which answers are moving the score. THE PUBLISHED MISSING-DATA RULES DIVERGE, SO ONLY COMPLETE FORMS ARE SCORED: one rendering drops an omitted item from its subscale denominator, requiring at least two thirds of each subscale to be answered, while another replaces up to two missing values with the subscale mean and voids the subscale beyond that. Those rules are NOT equivalent and give different totals on the same form, so all 13 items are required rather than reporting a number under an authority it does not have. Scores are on the 0 to 10 NUMERIC RATING SCALE of the current form; the 1991 original used a VISUAL ANALOGUE SCALE, and although the literature treats the two as interchangeable the instruments differ. A MINIMAL DETECTABLE CHANGE of ${S.SPADI_MDC} points at 90 percent confidence applies to the DIFFERENCE between two of the same patient's scores, not to a single score. Higher is worse. This does NOT diagnose anything and does not distinguish among the causes of shoulder pain, which are managed very differently - rotator cuff disease, adhesive capsulitis, glenohumeral or acromioclavicular arthritis, instability, and pain referred from the cervical spine all produce a high score. It does NOT detect the findings that make a shoulder urgent rather than chronic: an acute traumatic tear in a young patient, a suspected dislocation, infection, or a mass all need assessment REGARDLESS of the score. Being entirely self-reported it measures neither range of motion nor strength, and it is not an indication for imaging, injection or surgery.`,
    compute: S.spadi,
    fields: S.SPADI_ITEMS.map((item) => ({
      dom: `spadi-${item.key}`, arg: item.key, kind: 'number', unit: 'points', required: true,
      label: `${item.subscale === 'pain' ? 'PAIN' : 'DISABILITY'} subscale. ${item.text} 0 to ${S.ITEM_MAX}, where ${item.subscale === 'pain' ? S.PAIN_ANCHORS : S.DISABILITY_ANCHORS}`,
    })),
  },
];
