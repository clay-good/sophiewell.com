# spec-v1724 — Two answers decided by a field nobody filled in

> Status: **SHIPPED (2026-11-15)**: fixes to `ghent-marfan` and `amsler-krumeich`. The catalog stays 2,387.

Found by a sweep that follows spec-v1723: for each optional number field, does the worked example's value
with its sign flipped answer exactly as the blank field does? 35 rows; most are negative pressures, weights
and counts, which the page's range warning already flags. Two were not.

| Tool | What happened | Now |
|---|---|---|
| `amsler-krumeich` | Myopia is written negative. A refraction of -9 D was dropped as "not entered", so mean K 50 and 450 microns read **stage 2, moderate**, and the answer said the refraction was not entered. 9 D makes it stage 3, severe. | A negative refraction is refused with how to enter it ("without the minus sign: for -9 D, enter 9"). The scale grades the amount, and cylinder sign conventions differ, so the tool asks rather than guesses. |
| `ghent-marfan` | With the aortic root Z score blank, ectopia lentis was diagnosed as **ectopia lentis syndrome**, a diagnosis that needs a non-dilated aorta. The same patient with a Z of 2 is Marfan syndrome by rule 1. | It asks for the Z score and says what it decides. Rule 4 (ectopia lentis with an FBN1 mutation known to be associated with aortic disease) still diagnoses without it. |
| `ghent-marfan` | With the Z score blank, a systemic score of 9 read "No diagnosis under the revised Ghent nosology on these entries." Rules 1 to 3 and 7 all need the Z score. | The answer adds that the Z score was not entered and that this cannot rule Marfan syndrome out. |

Tests: `test/unit/amsler-krumeich.test.js`, `test/unit/ghent-marfan.test.js` (one existing assertion pinned
the ectopia lentis diagnosis with no Z score and now supplies a measured Z of 1). Both checked on the page.
