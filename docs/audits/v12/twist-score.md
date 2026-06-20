# v12 audit - twist-score

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Barbosa JA, et al. J Urol. 2013;189(5):1859-1864. Cross-read against MDCalc TWIST, the 2022 AAFP point-of-care guide, and an AUA systematic review; all agree on component points and the cutoffs at 2 and 5.

`lib/uro-v131.js twistScore()` sums the five TWIST findings to a 0-7 point-of-care torsion-triage score. Class A (journal+author citation - no docs/citation-staleness.md row).

## Source-governance / scoring note
- testicular swelling = 2, hard testis = 2, absent cremasteric reflex = 1, nausea/vomiting = 1, high-riding testis = 1. Total 0-7.
- Barbosa set two cutoffs - low <=2, high >=5 - giving three bands: 0-2 low (about 2% torsion in the derivation cohort, ultrasound usually unnecessary), 3-4 intermediate (obtain scrotal ultrasound), 5-7 high (about 87% torsion, consider direct surgical exploration). Reported both as "two cutoffs" and "three risk groups" in the literature; the tile uses the three-band reading.
- Findings are presence/absence: absence is a true 0, not "not assessed", so no blank state is needed.

## Boundary worked examples added
- 4 -> 5 intermediate/high flip; 0 (low) with no findings; 7 (high) with all findings; the two 2-point findings alone -> 4 (intermediate).
- string / numeric / boolean truthy encodings all count; explicit no/false/0 do not.

## Edge-input handling notes
- present() accepts true, 1, '1', 'yes'; everything else is absent. Always valid (the score is defined for any subset, including none). abnormal = total >= 3.

## A11y / keyboard notes
- Five labeled No/Yes selects; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
