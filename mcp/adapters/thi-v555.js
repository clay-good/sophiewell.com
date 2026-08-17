// spec-v555 MCP wave: adapter for the Tinnitus Handicap Inventory in lib/thi-v555.js. The dom keys mirror
// the browser renderer (views/group-v555.js) and META['thi'].example: thi-q1 .. thi-q25 map to the lib args
// q1 .. q25.
//
// **EVERY TOTAL IS EVEN, WHICH IS WHY THE PUBLISHED BANDS HAVE ONE-POINT GAPS.** The grades are 0-16,
// 18-36, 38-56, 58-76 and 78-100. The values 17, 37, 57 and 77 are UNREACHABLE, because every item
// contributes 0, 2 or 4 and a sum of even numbers is even. A band table with gaps in it looks like an
// off-by-one to correct, and an agent asked "what band is 17?" should answer that 17 cannot occur rather
// than inventing a rule. The tool exposes ODD_TOTALS_UNREACHABLE so the property is checkable.
//
// **THE SUBSCALES ARE DELIBERATELY NOT COMPUTED, AND THIS IS A FINDING, NOT AN OMISSION.** The instrument
// is usually described as having functional, emotional and catastrophic subscales, so an agent will expect
// three subscores and may try to derive them. It must not. Two independent renderings of the item-to-
// subscale map DISAGREE ON FOUR ITEMS (3, 9, 14 and 18) and do not even agree on the shape of the split,
// one giving 13/7/5 against a published structure described as 11/9/5. The primary text could not be
// obtained to adjudicate. Emitting subscores would mean picking one map on no authority and presenting
// three numbers a reader would take as the instrument's own, so the tool reports `subscalesReported: false`
// and says why.
//
// THE GRADES AND THE QUESTIONNAIRE ARE DIFFERENT PUBLICATIONS. The 25 items are Newman and colleagues 1996;
// the five severity grades are a British working group published in 2001. Both are double-confirmed, but an
// agent should not attribute the grades to the instrument's own authors.

import * as T from '../../lib/thi-v555.js';

export default [
  {
    id: 'thi',
    summary: `The Tinnitus Handicap Inventory (THI; Newman and colleagues 1996), a 25-item self-report measure of how much tinnitus is affecting the respondent's life. Every item takes exactly one of three answers: YES = 4 points, SOMETIMES = 2, NO = 0. There is no other value, and 1 and 3 are not on this scale. Total 0 to ${T.THI_MAX}. GRADES (from a separate British working group published in 2001, NOT from the questionnaire's own authors): 0 to 16 slight or no handicap (grade 1), 18 to 36 mild (grade 2), 38 to 56 moderate (grade 3), 58 to 76 severe (grade 4), 78 to 100 catastrophic (grade 5). THOSE ONE-POINT GAPS ARE CORRECT AS PUBLISHED AND MUST NOT BE CLOSED: because every item contributes 0, 2 or 4, EVERY TOTAL IS EVEN, so the values 17, 37, 57 and 77 are UNREACHABLE. A band table with holes in it looks like an off-by-one to tidy up; it is not. Asked what band a score of 17 falls in, the correct answer is that 17 cannot occur. THE FUNCTIONAL, EMOTIONAL AND CATASTROPHIC SUBSCALES ARE DELIBERATELY NOT COMPUTED, AND THIS IS A FINDING RATHER THAN AN OMISSION. The instrument is usually described as having those three subscales, so it is tempting to derive them - do not. Two independent renderings of the item-to-subscale map DISAGREE ON FOUR ITEMS, numbers 3, 9, 14 and 18, and do not even agree on the shape of the split, one giving 13/7/5 against a published structure described as 11/9/5, and the primary text could not be obtained to adjudicate. Emitting subscores would mean choosing one map on no authority and presenting three numbers a reader would take as the instrument's own, so only the total and grade, both double-confirmed, are returned. This is a COMPANION to the Dizziness Handicap Inventory, not a duplicate: the two share a design but measure different symptoms, and a patient can score high on one and zero on the other. IT MEASURES SELF-REPORTED HANDICAP, NOT THE TINNITUS ITSELF. It is not a loudness match, a pitch match or a masking level, and it correlates only loosely with all of them, so a quiet tinnitus can produce a catastrophic score and a loud one a slight score. It does not diagnose the cause. It does NOT detect the findings that make tinnitus urgent rather than chronic: unilateral or pulsatile tinnitus, sudden hearing loss and associated neurological signs all need assessment REGARDLESS of the score, and a low score does not make them benign. Several items overlap heavily with depression and anxiety, which are common alongside tinnitus and are not what this instrument measures. It does not select treatment.`,
    compute: T.thi,
    fields: T.THI_ITEMS.map((item, i) => ({
      dom: `thi-${item.key}`, arg: item.key, kind: 'enum',
      values: T.THI_OPTIONS.map((o) => String(o.value)), required: true,
      label: `Item ${i + 1}. ${item.text} [${T.THI_OPTIONS.map((o) => `${o.value} = ${o.text}`).join('; ')}]`,
    })),
  },
];
