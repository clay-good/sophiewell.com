# v12 audit - sort

- Auditor: CG
- Date: 2026-06-23
- Citation re-verified against: Protopapa KL, Simpson JC, Smith NCE, Moonesinghe SR. Development and validation of the Surgical Outcome Risk Tool (SORT). Br J Surg. 2014;101(13):1774-1783. All 11 coefficients were read verbatim from the primary Table 4 and cross-verified against the PMC full text.

`lib/surg-v142.js sort()` computes 30-day mortality = 1/(1+e^-logit) with
logit = -7.366 + ASA(III 1.411 / IV 2.388 / V 4.081) + urgency(expedited 1.236 /
urgent 1.657 / immediate 2.452) + 0.712 high-risk specialty + 0.381 Xmajor/complex
+ 0.667 cancer + age(65-79 0.777 / >=80 1.591). Class A (Group G).

## Source-governance notes
- ASA I AND II are the COMBINED reference -- there is NO ASA-II coefficient (the
  spec draft's "II, III, IV/V" was corrected). Only ASA III/IV/V add points.
- Age bands are MUTUALLY EXCLUSIVE: a patient >= 80 gets only 1.591, never
  0.777 + 1.591.
- High-risk specialty is a single binary (GI, thoracic, or vascular), not
  per-specialty. Severity adds points only for Xmajor/complex.

## Boundary worked examples added
- ASA III, urgent, high-risk, Xmajor, cancer, age 65-79 -> 14.67%.
- ASA I and ASA II yield the identical (very low ~0.06%) mortality -> confirms the
  shared reference.
- age >= 80 alone (ASA I, elective) -> ~0.31% -> confirms the exclusive age band.
- missing ASA / urgency / age -> valid:false.

## Edge-input handling notes
- The logit is clamped to [-40, 40]; all inputs are bounded selects/checkboxes, so
  the only non-finite path (the exponential) is covered.

## A11y / keyboard notes
- Three labeled selects + three labeled checkboxes; output aria-live="polite".
  320px sweep, no hscroll.

## Defects opened
- none
