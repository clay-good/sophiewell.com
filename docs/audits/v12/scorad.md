# v12 audit - scorad

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: European Task Force on Atopic Dermatitis. Severity scoring of atopic dermatitis: the SCORAD index. Dermatology. 1993;186(1):23-31 (formula, item set, and bands cross-verified against the ETFAD consensus report and DermNet/clinical-tool references; the dryness-on-uninvolved-skin rule confirmed against the original consensus; ≥ 2 independent sources, spec-v97).

`lib/derm-v151.js scorad()` consumes A (extent % 0-100), B (six 0-3 intensity
items), and C (two 0-10 VAS), and computes SCORAD = A/5 + 7B/2 + C plus the
objective oSCORAD = A/5 + 7B/2 with the published band. Class A.

## Source-governance notes
- Coefficients A/5 and 7B/2 confirmed. Range 0-103; oSCORAD range 0-83.
- B = six items (erythema, edema/papulation, oozing/crusting, excoriation,
  lichenification, dryness), each 0-3 -> 0-18. DRYNESS is graded on UNINVOLVED
  skin (the classic trap); surfaced in the input label.
- C = pruritus + sleeplessness VAS, each 0-10 -> 0-20.
- Bands mild < 25, moderate 25-50, severe > 50.

## Boundary worked examples added
- A/5 + 7B/2 + C composite -> 42 (oSCORAD 34, moderate); all-zero -> 0; the
  mild/moderate boundary at 25 and moderate/severe at 50; max all = 103 (severe);
  oSCORAD drops the subjective C items.

## Edge-input handling notes
- Extent/VAS clamped to their ranges; blank -> 0; always finite; spec-v59 fuzz
  clean.

## A11y / keyboard notes
- Extent + two VAS number inputs + six 0-3 selects; output aria-live. 320px
  sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
