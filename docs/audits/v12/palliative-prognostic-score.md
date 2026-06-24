# v12 audit - palliative-prognostic-score

- Auditor: CG
- Date: 2026-06-23
- Citation re-verified against: Pirovano M, Maltoni M, Nanni O, et al. A new palliative prognostic score. J Pain Symptom Manage. 1999;17(4):231-239 (cross-verified against the ScienceDirect primary full-text, MDApp, and the Palliative Care Network of Wisconsin Fast Fact).

`lib/rheum-v148.js palliativePrognosticScore()` sums dyspnea, anorexia, Karnofsky
status, the clinical prediction of survival, total WBC, and lymphocyte % 0-17.5
and reports the 30-day-survival risk group A/B/C. Class A.

## Source-governance notes
- dyspnea 1; anorexia 1.5; KPS >= 30 -> 0, 10-20 -> 2.5; CPS (weeks) > 12 -> 0,
  11-12 -> 2, 7-10 -> 2.5, 5-6 -> 4.5, 3-4 -> 6, 1-2 -> 8.5; WBC normal <= 8500 ->
  0, high 8501-11000 -> 0.5, very high > 11000 -> 1.5; lymphocytes 20-40% -> 0,
  12-19.9% -> 1, 0-11.9% -> 2.5. Total 0-17.5.
- The original paper splits the 7-10-week band into 9-10 and 7-8, both worth 2.5;
  they are merged here (identical weight) and documented as such.
- Risk groups: A 0-5.5 (> 70%), B 5.6-11.0 (30-70%), C 11.1-17.5 (< 30%).

## Boundary worked examples added
- group C 15/17.5; group A all-zero; the A/B 5.5/5.6 boundary; the B/C 11.0/11.1
  boundary; blank-select fallback.

## Edge-input handling notes
- Four required selects + two checkboxes; a blank select surfaces a
  complete-the-fields fallback. r1()/num() bound the 0-17.5 total. Covered by the
  spec-v59 fuzz harness, zero leaks.

## A11y / keyboard notes
- Four labeled selects + two checkboxes; output aria-live. 320px sweep, no
  hscroll.

## Defects opened
- none

## Status
- PASS
