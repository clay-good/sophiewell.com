# v12 audit - easi

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: Hanifin JM, Thurston M, Omoto M, et al. The Eczema Area and Severity Index (EASI): assessment of reliability in atopic dermatitis. Exp Dermatol. 2001;10(1):11-18 (formula and age-branched weights cross-verified against DermNet "EASI score"; the severity strata cross-verified against Leshem et al, Br J Dermatol 2015;172(5):1353 and the Hanifin 2022 EASI practical guide; ≥ 2 independent sources, spec-v97).

`lib/derm-v151.js easi()` consumes per-region erythema, edema/papulation,
excoriation, and lichenification (each 0-3) plus the % area for four regions and
an age band, maps % to the 0-6 area grade, and computes EASI = Σ (sum) × area ×
age-dependent weight with the Leshem band. Class A.

## Source-governance notes
- AGE-BRANCHED region weights are the chief correctness risk. Adult (>= 8 yr):
  head 0.1, upper 0.2, trunk 0.3, lower 0.4. Child (< 8 yr): head 0.2, upper 0.2,
  trunk 0.3, lower 0.3. Head and lower-limb weights SWAP; upper/trunk unchanged;
  both sum to 1.0. The age cutoff is < 8 (children = ages 0-7).
- SPEC-CORRECTION: the spec-v151 draft's 4-band strata (clear 0, mild 0.1-5.9,
  moderate 6-22.9, severe >= 23) could not be verified. The published SIX-band
  Leshem 2015 strata are used instead: clear 0, almost clear 0.1-1.0, mild
  1.1-7.0, moderate 7.1-21.0, severe 21.1-50.0, very severe 50.1-72.0
  (cross-verified against DermNet + the Hanifin 2022 practical guide).
- Per-sign scale is 0-3 (NOT 0-4 like PASI). Range 0-72.

## Boundary worked examples added
- adult weights -> 13.4 (moderate); the SAME intensities -> 10.8 with child
  weights (age-branch divergence pinned); default age = adult; the six-band
  strata; max all-severe full-area = 72 (very severe).

## Edge-input handling notes
- Blank severity -> 0, blank area -> 0% (grade 0); always finite; spec-v59 fuzz
  clean.

## A11y / keyboard notes
- Age select + sixteen severity selects + four % number inputs; output aria-live.
  320px sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
