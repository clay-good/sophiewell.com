# v12 audit - free-thyroxine-index

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: Clark F, Horn DB. Assessment of thyroid function by the combined use of the serum protein-bound iodine and resin uptake of triiodothyronine. J Clin Endocrinol Metab. 1965;25(1):39-45 (cross-verified against the ScienceDirect FTI overview and the LOINC FTI-variants brief; >= 2 sources, spec-v97).

`lib/endo-metab-v161.js freeThyroxineIndex()` computes the FTI. Group E, Class A.

## Source-governance notes
- FTI = total T4 x (T3-resin uptake % / reference-mean T3RU%). The reference mean
  defaults to 30% (normal T3RU ~25-35%) and is an optional input.
- Corrects total T4 for thyroid-binding-globulin changes (pregnancy/estrogen
  raise TBG and total T4 but the FTI stays normal). The ratio is guarded
  (reference > 0). An index interpreted against the local reference range, not a
  hard flagged threshold.

## Boundary worked examples added
- the tile example (T4 12, T3RU 25, default ref 30 -> 10); at the reference mean
  the FTI equals total T4; a custom reference is honored; blanks -> valid:false.

## Edge-input handling notes
- The reference division is guarded; a blank T4 or T3RU surfaces a complete-the-
  fields fallback. Covered by the spec-v59 fuzz harness.

## A11y / keyboard notes
- Two labelled number inputs + an optional reference input; output aria-live.
  320px sweep, no horizontal scroll.

## Defects opened
- none

## Status
- PASS
