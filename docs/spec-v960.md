# spec-v960 — The mTICI grade, and the one angiogram two scales call a success and a failure

## Why this tile

Sweeping ~140 widely-used instruments against the corpus and confirming each miss by regex found
`tici` absent while the stroke family around it is built (`nihss`, `aspects`, `mrs`, the
thrombectomy-era prognosis scores). The consensus statement that defines it is open access:

> Zaidat OO, Yoo AJ, Khatri P, et al. Recommendations on angiographic revascularization grading
> standards for acute ischemic stroke: a consensus statement. *Stroke.* 2013;44(9):2650-2663.
> (PMID 23920012, **PMC4160883**)

Its Table 2 is the whole grading, verbatim.

## The misread it is built around

The panel wrote it plainly:

> "TICI 2b has been dichotomized into 2 main variations: (1) more than **half** (mTICI) and
> (2) more than **two thirds** (original TICI) reperfusion."

So an angiogram with, say, 60% of the territory reperfused is:

| Scale | Grade | Verdict |
| --- | --- | --- |
| **mTICI** (modified) | 2b | a procedural **success** |
| **TICI** (original) | 2a | **not** one |

Same picture, opposite conclusion, and the difference is only which paper the reader has in
mind. The tile grades on **both** and says, on every result, whether they agreed — a reader
needs to know the scales concurred here as much as they need to know when they did not.

## Two more things it carries, both sourced

**Success is mTICI 2b–3, and that is not the old threshold.** The consensus reports 2b–3 as
"the optimal threshold for predicting good outcome … (sensitivity 78%, specificity 65%) versus
mTICI 2a-3", against a literature where "the most frequent definition of IAT angiographic
success has been TIMI 2 to 3 or TICI 2a-3". A success rate quoted from an older trial is often
counting 2a — so a failing grade says so.

**Grade 3 means complete, not near complete.** The panel chose that wording deliberately,
"partly to make 2b and 3 easier to tell apart between readers".

And what the grades bought, from IMS III core-laboratory adjudication: mTICI 3 and 2b were
associated with **80%** and **46.3%** good outcome at 90 days (mRS ≤ 2), against **19.4%** for
2a. Those figures travel with the grade they belong to, and grades 0 and 1 carry none, because
the paper reports none.

## One test that had to change, and why it is not a relaxation

`mcp-not-exposed.test.js` pinned the exact ORDER of `restraint-timer`'s derived related-tools
list. That list is ranked by similarity over the search corpus, and the ranking weights token
rarity across the whole catalog — so adding any tile anywhere can reorder it. Two new tiles
swapped its first two entries. The four ids are unchanged; the assertion now compares the set,
with a comment saying why the order is not the thing being tested.

## Proof

| Check | Result |
| --- | --- |
| Table 2, grade by grade | 6 inputs → 0, 1, 2a, 2b, 2b, 3 |
| the scales part on exactly one option | `half-to-two-thirds`, and only that one |
| that option | mTICI 2b, original TICI 2a, flagged as a disagreement |
| success set | exactly 2b and 3 |
| IMS III figures | attached to 2a/2b/3; **empty** for 0 and 1, which the paper does not report |
| an unrecognised extent | asks for the fraction rather than guessing |
| `/#tici` in the live app | all three cases correct; source resolves to PMID 23920012 |
| `tici.test.js` | 8 pass |
| `npm run lint` | clean — catalog 1,707 → **1,708**, source-link count auto-checked at 1,603 |
| `npm run test:unit` / `test:mcp` | 12,973 / 421 |
