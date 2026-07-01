# v12 audit - impede-vte

- Auditor: CG
- Date: 2026-07-01
- Citation re-verified against: Sanfilippo KM, et al. Am J Hematol 2019;94(11):1176-1184 (stage boundaries / weights / cut-points cross-verified against >= 2 independent sources; spec-v97).

`lib/heme-risk-v189.js impedeVte()` is a deterministic, finite-guarded compute per the spec-v100 §2
doctrine; the renderer states it is decision support and defers the decision to
the treating team (spec-v11 §5.3).

## Source-governance notes
- signed weighted sum incl. negative terms; bands <=3 / 4-7 / >=8.

## Boundary worked examples added
- covered in test/unit/heme-risk-v189.test.js: signed weighted sum incl. negative terms; bands <=3 / 4-7 / >=8.

## Edge-input handling notes
- enumerated dexamethasone/prophylaxis selects; bounded integer sum; no division. Covered by the spec-v59 fuzz harness, zero non-finite leaks.

## A11y / keyboard notes
- Labelled inputs (`<label for>`), output aria-live. 320px sweep, no horizontal
  scroll; touch targets meet the minimum.

## Defects opened
- none

## Status
- PASS
