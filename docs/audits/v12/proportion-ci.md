# v12 audit - proportion-ci

- Auditor: CG
- Date: 2026-06-30
- Citation re-verified against: Wilson EB. J Am Stat Assoc 1927;22(158):209-212 (Wilson-score interval cross-verified against standard biostatistics references and the Wald comparison; >= 2 sources, spec-v97).

`lib/specialtymath-v186.js proportionCi()` is a deterministic, finite-guarded compute per the spec-v100 §2
doctrine; the renderer states it is decision support and defers the decision to
the clinician (spec-v11 §5.3).

## Source-governance notes
- p = x/n; Wilson center/half as published; clamped to [0,1]; z 90/95/99 = 1.6449/1.9600/2.5758.

## Boundary worked examples added
- 8 of 10 95% -> 80% (49-94.3%); boundary 0/n and n/n stay within [0,100]%; higher level widens; events > n / n 0 -> valid:false.

## Edge-input handling notes
- n is guarded > 0; the interval is clamped to [0, 1]; events > n surfaces a fallback; the Wilson radicand is non-negative by construction. Covered by the spec-v59 fuzz harness, zero non-finite leaks.

## A11y / keyboard notes
- Labelled inputs (`<label for>`), output aria-live. 320px sweep, no horizontal
  scroll; touch targets meet the minimum.

## Defects opened
- none

## Status
- PASS
