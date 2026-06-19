# v12 audit - graeb-ivh

- Auditor: CG
- Date: 2026-06-19
- Citation re-verified against: Morgan TC, Dawson J, Spengler D, et al. The Modified Graeb Score: an enhanced tool for intraventricular hemorrhage measurement and prediction of functional outcome. Stroke. 2013;44(3):635-641 (re-fetched; the PMC6800016 open-access reproduction read directly, cross-checked with stroke-manual.com and Peripheral Brain).

`lib/neuro-v118.js graebIvh()` sums eight compartments to a max of 32. Each of
the four large compartments (right + left lateral ventricle, third, fourth)
carries a fill grade 0-4 (0 none, 1 trace, 2 < 50%, 3 > 50%, 4 filled) plus a
SEPARATE +1 if expanded by clot -> max 5 each. Each of the four horns (right +
left occipital, right + left temporal) carries a fill grade 0-2 plus the same +1
expansion bonus -> max 3 each. Total max = (4 x 5) + (4 x 3) = 32. Class A
(fixed per-compartment weights; journal+author citation, no ISSUER_PATTERN trip
-- no docs/citation-staleness.md row).

## Boundary worked examples added
- no blood -> total 0.
- all compartments filled but not expanded -> 24 (4x4 + 4x2).
- all compartments filled AND expanded -> exactly 32 (4x5 + 4x3).
- expansion adds +1 on top of the fill grade (fill 2 + expanded = 3).
- expansion with no blood (fill 0) contributes nothing.
- over-grading a fill is clamped (large to 4/5, horn to 2/3); total <= 32.

## Cross-implementation differential
- Reference: a first research pass produced a compartment table that summed to
  only 24 (the published maximum is 32). Resolved against PMC6800016, which
  states verbatim "the maximum possible score is 32, in which every compartment
  is filled with blood and expanded": the +1 expansion bonus is an INDEPENDENT
  additive modifier on EACH of the eight compartments, not the top step of the
  fill scale. Base fill 24 + eight expansion bonuses = 32. The tile models
  expansion as a separate checkbox per compartment, gated on fill > 0. Match.
  PASS.

## Edge-input handling notes
- Each fill grade is clamped (large 0-4, horn 0-2) and the total is clamped 0-32,
  so no over-grading or non-numeric fuzz arg can push the total out of range or
  leak a NaN. The expansion bonus only counts when that compartment has blood.

## A11y / keyboard notes
- Eight labeled selects + eight labeled expansion checkboxes; output
  aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
