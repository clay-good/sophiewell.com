# v12 audit - recist

- Auditor: CG
- Date: 2026-06-30
- Citation re-verified against: Eisenhauer EA, et al. Eur J Cancer 2009;45(2):228-247 (RECIST 1.1 -30% / +20% + 5 mm / new-lesion thresholds cross-verified against the published guideline; >= 2 sources, spec-v97).

`lib/onc-staging-v187.js recist()` is a deterministic, finite-guarded compute per the spec-v100 §2
doctrine; the renderer states it is decision support and defers the decision to
the clinician (spec-v11 §5.3).

## Source-governance notes
- % change from baseline and nadir; CR sum 0; PR >= 30% decrease; PD >= 20% from nadir and >= 5 mm, or new lesion; SD otherwise.

## Boundary worked examples added
- PR (-35% from baseline); PD from nadir (+30%, +18 mm) below baseline; new lesion forces PD; CR (sum 0); SD; baseline/nadir 0 -> valid:false.

## Edge-input handling notes
- the baseline and nadir divisors are guarded > 0; the rule that fired is named; blank/non-finite surface a fallback. Covered by the spec-v59 fuzz harness, zero non-finite leaks.

## A11y / keyboard notes
- Labelled inputs (`<label for>`), output aria-live. 320px sweep, no horizontal
  scroll; touch targets meet the minimum.

## Defects opened
- none

## Status
- PASS
