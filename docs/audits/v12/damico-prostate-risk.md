# v12 audit - damico-prostate-risk

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: D'Amico AV, et al. JAMA. 1998;280(11):969-974 (PMID 9749478). Cross-read against PMC3328553 (verbatim critical review) and PMC11430665.

`lib/uro-v130.js damicoProstateRisk()` classifies biochemical-recurrence risk (Low / Intermediate / High) from clinical T stage, serum PSA, and Gleason score; the worst single feature governs. Class A (journal+author citation — no docs/citation-staleness.md row).

## Source-governance / boundary corrections (vs spec draft)
- The PSA boundary for intermediate is strict > 10 to ≤ 20, so a PSA of exactly 10 is LOW,
  not intermediate. Implemented as `psa > 20 ? 3 : psa > 10 ? 2 : 1`.
- The original high-risk T-stage cut is exactly T2c (T2c-T3 is a downstream generalization);
  the stage map places T2c and above in the high tier, T2b in intermediate, T2a and below in
  low.
- The worst-feature rule is confirmed: tier = max(stageTier, psaTier, gleasonTier); the band
  names which feature(s) drive the tier.

## Boundary worked examples added
- PSA 6, Gleason 6, T2a → Low.
- PSA 6, Gleason 7, T1c → Intermediate (driven by Gleason).
- PSA 10 → Low; PSA 10.1 → Intermediate (strict boundary flip).
- T2c / PSA > 20 / Gleason ≥ 8 each → High.
- blank/invalid field → valid:false; unknown stage string → valid:false; scalar → valid:false.

## Edge-input handling notes
- PSA must be positive; Gleason an integer 2-10; stage one of the known T-stage strings
  (T1/T1a/T1b/T1c/T2a/T2b/T2c/T3/T3a/T3b/T4) via a lookup table. abnormal = tier ≥ 2.

## A11y / keyboard notes
- Two number inputs + one labeled select; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
