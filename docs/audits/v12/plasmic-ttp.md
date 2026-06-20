# v12 audit - plasmic-ttp

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Bendapudi PK, et al. Lancet Haematol. 2017;4(4):e157-e164. Cross-read against MDCalc PLASMIC and the derivation/validation cohorts; all agree on the seven 1-point criteria and the 0-4 / 5 / 6-7 bands.

`lib/heme-v132.js plasmicTtp()` sums seven 1-point criteria to a 0-7 pretest probability of severe ADAMTS13 deficiency (acquired TTP). Class A (journal+author citation - no docs/citation-staleness.md row).

## Source-governance / scoring note
- 1 point each: platelet < 30 x10^9/L; a hemolysis composite (reticulocyte > 2.5% OR undetectable haptoglobin OR indirect bilirubin > 2.0 mg/dL); no active cancer in the past year; no prior solid-organ/stem-cell transplant; MCV < 90 fL; INR < 1.5; creatinine < 2.0 mg/dL.
- The cancer and transplant points score for the ABSENCE of the condition - the common coding bug; guarded by a dedicated inversion test.
- Bands: 0-4 low (~0-4%), 5 intermediate (~5-24%), 6-7 high (~62-82%) probability of severe deficiency.

## Boundary worked examples added
- 6 -> 7 high band stays high as creatinine crosses 2.0; 5 intermediate one point below; cancer/transplant inversion removes a point; all-favorable-absent -> 0 low.

## Edge-input handling notes
- Lab values compared to fixed thresholds with a finite guard; the hemolysis composite is an explicit OR of three flags answered as one yes/no. Any blank required field -> valid:false, never a partial score. abnormal = total >= 5.

## A11y / keyboard notes
- Four labeled number inputs + three No/Yes selects; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
