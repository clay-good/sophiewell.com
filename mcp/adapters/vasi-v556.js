// spec-v556 MCP wave: adapter for the Vitiligo Area Scoring Index in lib/vasi-v556.js. The dom keys mirror
// the browser renderer (views/group-v556.js) and META['vasi'].example.
//
// **DEPIGMENTATION IS A SEVEN-LEVEL ORDINAL LADDER, NOT A FREE PERCENTAGE.** Only 0, 10, 25, 50, 75, 90 and
// 100 are permitted, and the assessor snaps to the nearest by DESCRIPTION rather than by measuring. An
// agent handed "about 60 percent depigmented" must choose 50 or 75, not pass 60. The ladder is deliberately
// coarse because the underlying judgment is a visual comparison; accepting an arbitrary percentage would
// look more precise while scoring a different instrument. The enum enforces this.
//
// **THE AREA UNIT IS A HAND UNIT AND IT IS PATIENT-RELATIVE.** One unit is the PATIENT'S OWN palm including
// the fingers, defined as 1 percent of their body surface area - not a fixed number of square centimetres.
// The same patch of skin is a different number of units on a small child and a large adult, which is
// intended, because the score is a proportion of that person's body.
//
// **THE REGION SET DIVERGED AND THE TOOL NAMES THE ONE IT IMPLEMENTS.** The original description used FIVE
// regions with upper extremities INCLUDING the axillae and lower extremities INCLUDING the inguinal regions
// and buttocks, head and neck added later. Modern protocols use SIX MUTUALLY EXCLUSIVE regions where upper
// extremities EXCLUDE the hands and lower extremities EXCLUDE the feet. Under the original five a hand
// could be counted twice. This implements the six-region set and returns `regionSet`, because a VASI
// reported without its region set is not reproducible.
//
// **T-VASI AND F-VASI ARE DIFFERENT SCALES.** Total-body VASI runs 0-100; facial VASI runs 0-3, because the
// face is only about 3 percent of body surface area. A facial score of 2 is severe and a total-body score
// of 2 is trivial, so they must never be compared or share a band table. This computes the TOTAL-BODY score.

import * as V from '../../lib/vasi-v556.js';

export default [
  {
    id: 'vasi',
    summary: `The Vitiligo Area Scoring Index (VASI; Hamzavi and colleagues 2004). VASI is the SUM over body regions of (hand units of involvement) MULTIPLIED BY (residual depigmentation). DEPIGMENTATION IS A SEVEN-LEVEL ORDINAL LADDER, NOT A FREE PERCENTAGE: the only permitted values are 0, 10, 25, 50, 75, 90 and 100, and the assessor snaps to the nearest BY DESCRIPTION rather than by measuring - 100 no pigment present, 90 specks of pigment present, 75 the depigmented area exceeds the pigmented area, 50 the two are equal, 25 the pigmented area exceeds the depigmented area, 10 only specks of depigmentation. Handed "about 60 percent depigmented", choose 50 or 75; do not pass 60. The ladder is deliberately coarse because the underlying judgment is a visual comparison, and accepting an arbitrary percentage would look more precise while scoring a different instrument. THE AREA UNIT IS A HAND UNIT AND IS PATIENT-RELATIVE: one unit is the PATIENT'S OWN palm INCLUDING THE FINGERS, defined as 1 percent of their total body surface area, not a fixed number of square centimeters, so the same patch is a different number of units on a child and on a large adult. The whole body is therefore 100 hand units. THE REGION SET DIVERGED AFTER THE ORIGINAL PAPER AND THIS TOOL NAMES THE ONE IT USES: the original used FIVE regions (hands; upper extremities INCLUDING axillae; trunk; lower extremities INCLUDING inguinal regions and buttocks; feet) with head and neck added by later work, while modern protocols use SIX MUTUALLY EXCLUSIVE regions in which the upper extremities EXCLUDE the hands and the lower extremities EXCLUDE the feet. Those sets are not interchangeable - under the original five a hand could be counted both in hands and within upper extremities - so this implements the six-region mutually exclusive set and returns regionSet, because a VASI reported without its region set is not reproducible. T-VASI AND F-VASI ARE DIFFERENT SCALES AND MUST NOT SHARE A BAND TABLE: total-body VASI runs 0 to ${V.VASI_MAX}, while FACIAL VASI runs 0 to ${V.F_VASI_MAX} because the face is only about 3 percent of body surface area, so a facial score of 2 is severe while a total-body score of 2 is trivial. This computes the TOTAL-BODY score. Higher is worse, and the score FALLS as repigmentation occurs; trials use it as a percent change from baseline rather than as a threshold. This measures EXTENT AND SEVERITY. It does NOT diagnose vitiligo or distinguish it from the other causes of hypopigmentation, including pityriasis alba, tinea versicolor, post-inflammatory hypopigmentation, nevus depigmentosus and in some settings leprosy, several of which are treated entirely differently. It does NOT assess DISEASE ACTIVITY, which is a separate axis: a large stable patch and a small rapidly spreading one can score alike, and activity is usually what drives urgency. It measures neither psychological burden nor quality of life, which are frequently the reason for treatment and track poorly with area. It does not select therapy or phototherapy dosing.`,
    compute: V.vasi,
    fields: V.VASI_REGIONS.flatMap((region) => ([
      {
        dom: `vasi-${region.key}-area`, arg: `${region.key}Area`, kind: 'number', unit: 'hand units', required: false,
        label: `${region.text}: involved area in HAND UNITS, where one unit is the patient's own palm including fingers and equals 1 percent of body surface area. Leave blank or 0 if not involved.`,
      },
      {
        dom: `vasi-${region.key}-depig`, arg: `${region.key}Depigmentation`, kind: 'enum',
        values: V.DEPIGMENTATION_GRADES.map((g) => String(g.value)), required: false,
        label: `${region.text}: residual depigmentation. An ORDINAL LADDER chosen by description, not a free percentage [${V.DEPIGMENTATION_GRADES.map((g) => `${g.value} = ${g.text}`).join('; ')}]`,
      },
    ])),
  },
];
