# v12 audit - sic-score

- Auditor: CG
- Date: 2026-06-19
- Citation re-verified against: Iba T, Levy JH, Warkentin TE, Thachil J, van der Poll T, Levi M. J Thromb Haemost. 2019;17(11):1989-1994 (ISTH criteria; re-fetched and cross-read with MDCalc, the Iba 2017 derivation paper PMC5623518, and the secondary analysis PMC9837358).

`lib/critcare-v112.js sicScore()` bands three items -- platelet count
(>= 150 = 0, 100 to < 150 = 1, < 100 = 2), PT-INR (<= 1.2 = 0, > 1.2 to
<= 1.4 = 1, > 1.4 = 2), and the total SOFA capped at 2 (>= 2 = 2) -- to a total
of 0-6. SIC is met when the total is >= 4 AND the platelet + PT-INR subscore is
>= 3, so the SOFA item alone can never diagnose SIC. Class A.

## Boundary worked examples added
- platelet 80, INR 1.6, SOFA 0 -> total 4, SIC met.
- the coag-subscore floor: platelet 1 + INR 1 + SOFA 2 = total 4 but coag
  subtotal 2 is NOT met (the load-bearing >= 3 floor).
- SOFA is capped at 2 (a SOFA of 20 scores 2).
- band edges: platelet 150 = 0, INR 1.2 = 0 (both inclusive).
- partial input -> complete-the-fields fallback.

## Cross-implementation differential
- Reference: the platelet and PT-INR bands matched MDCalc and the derivation
  paper exactly. SOURCE CORRECTION: the coag-subscore floor is >= 3, not the
  >= 2 a first reading assumed -- confirmed across MDCalc and PMC9837358. The
  "total SOFA" is the ISTH four-organ sum (respiratory, cardiovascular, hepatic,
  renal), recorded in the source note. An INR-band paraphrase ("< 1.3 / 1.3-1.4")
  was rejected in favor of the published <= 1.2 / > 1.2-1.4 / > 1.4. Match. PASS.

## Edge-input handling notes
- requires platelet, PT-INR, and SOFA all present; otherwise a fallback. The
  SOFA component is clamped to its 0-2 cap before summing.

## A11y / keyboard notes
- Three labeled number inputs; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
