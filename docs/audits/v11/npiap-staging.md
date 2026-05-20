# v11 audit - npiap-staging

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Edsberg LE, Black JM, Goldberg M, McNichol L, Moore L, Sieggreen M. *Revised National Pressure Ulcer Advisory Panel Pressure Injury Staging System.* J Wound Ostomy Continence Nurs. 2016;43(6):585-597. Adopted by NPIAP (formerly NPUAP) 2019. Stages: Stage 1 / 2 / 3 / 4 / Unstageable / Deep Tissue Pressure Injury / Mucosal Membrane PI.

`lib/scoring-v4.js npiapStaging()` is a decision tree over six structured pickers (mucosal location, skin intact, blanching behavior, obscured base, depth).

## Boundary examples added
- mucosal -> Mucosal Membrane PI.
- intact + blanchable (tile example) -> No pressure injury.
- intact + non-blanchable erythema -> Stage 1.
- intact + non-blanchable deep discoloration -> DTPI.
- not intact + obscured -> Unstageable.
- not intact + partial-thickness -> Stage 2.
- not intact + subq-visible -> Stage 3.
- not intact + bone-tendon-muscle visible -> Stage 4.

## Cross-implementation differential
- Reference: NPIAP 2016 staging algorithm.
- Sophie result: matches across all eight boundary cases above plus the precedence rule (mucosal trumps other inputs). PASS.

## Edge-input handling notes
- Unknown picker values default to the most-conservative branch (Stage 2 / Stage 1).

## A11y / keyboard notes
- Two checkboxes plus two labeled selects; Tab-reachable; aria-live result region.

## Defects opened
- none

## Status
- PASS
