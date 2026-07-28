// spec-v554 MCP wave: adapter for the Global Acne Grading System in lib/gags-v554.js. The dom keys mirror
// the browser renderer (views/group-v554.js) and META['gags'].example: gags-<regionKey> map to the lib args
// of the same name.
//
// **EACH REGION IS GRADED BY ITS SINGLE MOST SEVERE LESION, NEVER BY SUMMING LESION TYPES.** The grade key
// reads like an additive checklist - 1 comedone, 2 papule, 3 pustule, 4 nodule - and an agent handed "the
// forehead has comedones, papules and a nodule" will be tempted to return 7. It is 4. Summing lesion types
// would roughly triple the score of anyone with mixed disease, which is most patients with acne.
//
// **CHEST AND UPPER BACK ARE ONE COMBINED REGION WITH A SINGLE FACTOR OF 3, NOT TWO SITES.** There are six
// regions, not seven. Scoring chest and back separately would take the maximum from 44 to 47 and
// over-weight truncal disease against the face, which inverts the intent of factors derived from surface
// area and pilosebaceous unit density.
//
// **THE PUBLISHED TABLE LEAVES 39 UNASSIGNED, AND THE TOOL REPORTS THAT RATHER THAN PATCHING IT.** Severe
// is printed as 31 to 38 and very severe as ABOVE 39, so a score of exactly 39 falls in no band - and 39 is
// reachable. Two independent reproductions print it identically, so it is the source's text, not a
// publisher's typo. Many tertiary sources silently rewrite the top band as "39 or above" and erase the
// defect. The tool returns `bandAssigned: false` with `band: null` at 39 and states what the primary table
// prints, because quietly choosing a reading would hide a real ambiguity sitting exactly on the boundary
// between the two most severe categories.

import * as G from '../../lib/gags-v554.js';

export default [
  {
    id: 'gags',
    summary: `The Global Acne Grading System (GAGS; Doshi and colleagues 1997). It multiplies a fixed FACTOR for each of SIX regions by a lesion GRADE from 0 to 4 and sums the six products. Factors: forehead 2, right cheek 2, left cheek 2, nose 1, chin 1, and chest and upper back 3. The factors sum to 11, so the global score runs 0 to ${G.GAGS_MAX}. EACH REGION IS GRADED BY ITS SINGLE MOST SEVERE LESION, NEVER BY COUNTING LESIONS AND NEVER BY ADDING LESION TYPES TOGETHER: grade 0 no lesions, 1 at least one comedone, 2 at least one papule, 3 at least one pustule, 4 at least one nodule, and the grade is the HIGHEST of those present. The key reads like an additive checklist, so a region described as having comedones, papules and one nodule invites a score of 7 - it is 4. Summing lesion types would roughly triple the score of anyone with mixed disease, which is most patients with acne. CHEST AND UPPER BACK ARE ONE COMBINED REGION WITH A SINGLE FACTOR OF 3, NOT TWO SITES: there are six regions, not seven, and a patient with truncal acne cannot score chest and back separately. Splitting them would take the maximum from 44 to 47 and over-weight the trunk against the face, inverting the intent of factors derived from surface area and pilosebaceous unit density. BANDS: 0 none, 1 to 18 mild, 19 to 30 moderate, 31 to 38 severe, and above 39 very severe. THE PUBLISHED TABLE LEAVES A SCORE OF EXACTLY ${G.UNASSIGNED_SCORE} UNASSIGNED - severe stops at 38 and very severe begins above 39 - and 39 is reachable. Two independent reproductions of the table print it identically, so this is the source own gap rather than one publisher typo, and many tertiary sources silently rewrite the top band as 39 or above and erase it. This tool returns bandAssigned false with band null at 39 and states what the primary table prints, because quietly choosing a reading would hide a real ambiguity sitting exactly on the boundary between the two most severe categories. This GRADES SEVERITY. It does NOT diagnose acne or distinguish it from rosacea, folliculitis, perioral dermatitis or an acneiform drug eruption, several of which are managed quite differently. It does not capture the features that change management independently of severity, including scarring, post-inflammatory pigmentation, psychological burden and signs of hyperandrogenism, so a low score in a patient who is scarring or severely distressed is not a reason to withhold treatment. It does not select therapy and is not an indication for isotretinoin or for any antibiotic.`,
    compute: G.gags,
    fields: G.GAGS_REGIONS.map((region) => ({
      dom: `gags-${region.key}`, arg: region.key, kind: 'enum',
      values: G.GAGS_GRADES.map((g) => String(g.value)), required: true,
      label: `${region.text}. Regional factor ${region.factor}. Grade by the MOST SEVERE lesion present, not by summing lesion types [${G.GAGS_GRADES.map((g) => `${g.value} = ${g.text}`).join('; ')}]`,
    })),
  },
];
