# v12 audit - clichy

- Auditor: CG
- Date: 2026-07-01
- Citation re-verified against: Bernuau J, et al. Hepatology 1986;6(4):648-651 (coefficients / boundaries / criteria cross-verified against >= 2 independent sources; spec-v97).

`lib/hepgi-v190.js clichy()` is a deterministic, finite-guarded compute per the spec-v100 §2
doctrine; the renderer states it is decision support and defers the decision to
the treating team (spec-v11 §5.3).

## Source-governance notes
- encephalopathy AND age-branched factor V threshold (< 20% if age < 30, < 30% if age ≥ 30).

## Boundary worked examples added
- covered in test/unit/hepgi-v190.test.js: the age-branched factor-V threshold pair, met vs not met.

## Edge-input handling notes
- age and factor V guarded >= 0; both criteria required; complete-the-fields fallback. Covered by the spec-v59 fuzz harness, zero non-finite leaks.

## A11y / keyboard notes
- Labelled inputs (`<label for>`), output aria-live. 320px sweep, no horizontal
  scroll; touch targets meet the minimum.

## Defects opened
- none

## Status
- PASS
