# v12 audit - go-far

- Auditor: CG
- Date: 2026-06-18
- Citation re-verified against: Ebell MH, Jang W, Shen Y, Geocadin RG. JAMA Intern Med. 2013;173(20):1872-1878 (and the Table erratum, PMID 26146925).

`lib/eddecision-v107.js goFar()` sums the pre-arrest variables (neurologically intact
-15, the only negative term; comorbidity and admission items +1..+10; age bands
0..+11) to a total clamped -15..+76 and maps it to the four published probability-of-
good-neurologic-outcome categories. Class A.

## Boundary worked examples added
- neurologically intact alone (age < 70) -> -15, above average.
- no variables, age < 70 -> 0, average.
- band flip: total 13 (average) -> 14 (low) at the cut-point.
- tile example: age 82 + septicemia + respiratory -> 17, low.
- band flip into very low at 24 (age >= 85 + cancer + medical noncardiac -> 25).
- age banding exact at 69/70/75/80/85.
- missing age -> complete-the-fields fallback.

## Cross-implementation differential
- Reference: point values + the four category boundaries cross-verified against the
  MDCalc GO-FAR calculator and the Ebell 2013 Tables 3-4. RESOLVED a source
  ambiguity: the "-15 to 11" figure quoted by some secondary sources is the spread
  of the per-variable point values, NOT the total-score range; the operative total
  range is -15 to +76, and the >= 24 "very low" band is reachable because MDCalc
  treats the admission/comorbidity items as INDEPENDENT additive rows (no
  mutual-exclusivity enforcement). Categories: <= -6 above average (> 15%), -5..13
  average (3-15%), 14..23 low (1-3%), >= 24 very low (< 1%). Match. PASS.

## Edge-input handling notes
- the note carries the explicit posture that the score informs, never decides, a
  goals-of-care discussion; it estimates a probability, not an individual outcome.

## A11y / keyboard notes
- Labeled number field + checkboxes; output aria-live="polite". 320px sweep passes
  with no horizontal scroll.

## Defects opened
- none

## Status
- PASS
