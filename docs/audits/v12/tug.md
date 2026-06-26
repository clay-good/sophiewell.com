# v12 audit - tug

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: Podsiadlo D, Richardson S. The Timed "Up & Go": a test of basic functional mobility for frail elderly persons. J Am Geriatr Soc. 1991;39(2):142-148 (cross-verified against the CDC STEADI materials and the Shirley Ryan AbilityLab database; ≥ 2 sources, spec-v97).

`lib/function-v154.js tug()` consumes a single measured time in seconds and
surfaces the published fall-risk thresholds. Group E, Class A.

## Source-governance notes
- CDC STEADI flags increased fall risk at ≥ 12 s (inclusive); the community-dwelling
  research cut-off is ≥ 13.5 s (Shumway-Cook 2000); the original functional band
  rates ≥ 30 s as dependent in transfers/ADLs.
- Higher time = higher risk. One secondary source (StrokEngine) inverted the
  direction ("≤ 13.5 s"); that is an error and was not followed.

## Boundary worked examples added
- 12.5 s (STEADI flagged, community not yet); exactly 12 s inclusive threshold vs
  11.9 s; 13.5 s community cut-off and 30 s dependent band; blank / NaN / out-of-
  range → valid:false.

## Edge-input handling notes
- The numeric input is finite-checked and range-bounded (0–600 s); a blank or non-
  finite time renders a complete-the-fields fallback rather than a spurious flag;
  covered by the spec-v59 fuzz harness, zero non-finite leaks.

## A11y / keyboard notes
- One labelled number input; output aria-live. 320px sweep, no horizontal scroll.

## Defects opened
- none

## Status
- PASS
