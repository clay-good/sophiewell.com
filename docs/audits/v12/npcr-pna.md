# v12 audit - npcr-pna

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Depner TA, Daugirdas JT. J Am Soc Nephrol. 1996;7(5):780-785 (PMID 8738814; the two-point urea-kinetic form and the 0.864 = 0.036 x 24 lumped constant cross-read against the Renal Fellow Network worked example, mdapp.co, and thecalculator.co; the Renal Fellow Network post 18 / pre 70 / 44 h -> 1.24 example is the verbatim published anchor).

`lib/renal-v128.js npcrPna()` computes nPCR (g/kg/day) = 0.22 + 0.864 x (pre-dialysis
BUN - post-dialysis BUN) / interdialytic hours, the two-point anuric urea-kinetic form.
Class A (journal+author citation, no ISSUER_PATTERN trip -- no docs/citation-staleness.md
row).

## Boundary worked examples added
- published anchor: post 18, pre 70, 44 h -> 1.24 g/kg/day (matches Renal Fellow Network).
- within target: post 24, pre 70, 44 h -> 1.12 g/kg/day.
- low: post 30, pre 50, 68 h -> below the ~0.8 floor (inadequate protein intake).
- pre must exceed post (no negative generation); zero interval -> valid:false; scalar -> valid:false.

## Source-governance / no-fabrication note
- The Kt/V-coefficient ("simplified Daugirdas") form nPCR = C0/(a + b*KtV + c/KtV) +
  0.168 was NOT shipped: only the MIDWEEK triplet (25.8 / 1.15 / 56.4) is recoverable
  from open sources; the first-of-week and last-of-week coefficient triplets sit behind
  paywalls and could not be verified. Per the project's no-fabrication norm (cf.
  gwtg-hf), guessed coefficients are not shipped; the two-point rise form is fully
  reproducible against a published worked example and is the canonical implementation.
- Band classified on the rounded nPCR so the shown value matches the in-target text.

## Edge-input handling notes
- pos() guards post-BUN, pre-BUN, and hours; a non-positive interdialytic rise (pre <=
  post) returns a surfaced complete-the-fields fallback rather than a non-physiologic
  negative generation.

## A11y / keyboard notes
- Three number inputs each labeled; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
