# v12 audit - chess-scale

- Auditor: CG
- Date: 2026-07-01
- Citation re-verified against: Hirdes JP, Frijters DH, Teare GF. J Am Geriatr Soc. 2003;51(1):96-100.

`lib/ltcga-v180.js chessScale()` counts the present signs-and-symptoms items
(vomiting, peripheral edema, dyspnea, weight loss, dehydration/insufficient
fluid, reduced intake), caps that sub-score at 2, then adds one point each for a
decline in decision-making, a decline in ADL status, and an end-stage-disease
(≤6-month) prognosis, for a total of 0–5. Class A (public interRAI/MDS method).
A capped integer combination; the output is the 0–5 instability score itself, not
a mortality percentage.

## Boundary worked examples added
- no items -> 0, no health instability.
- signs/symptoms cap at 2 (six symptoms still score 2).
- the 2 -> 3 transition: two symptoms (2) + one other variable (end-stage) = 3,
  crossing into `abnormal` / "substantial health instability".
- each of the three other variables adds exactly one point.
- maximum 5 (symptom cap 2 + three other variables).

## Cross-implementation differential
- Reference: the item set, the signs-and-symptoms cap-at-2 rule, and the "+3 other
  variables, max 5" combination cross-verified across the interRAI official CHESS
  scale PDF, the CIHI interRAI LTCF Outcome Scales Reference Guide (with a worked
  example scoring 4/5), and the CIHI interRAI Contact Assessment job aid. The LTCF
  variant is implemented (the only one where >=2 independent authoritative sources
  publish the complete item list, thresholds, combination logic, cap, and a
  validating example). The two OR-groups (dehydration / low fluid / output>input;
  reduced food-or-fluid) are pre-combined by the renderer so each contributes at
  most once to the symptom count. Match. PASS.

## Edge-input handling notes
- all inputs are checkboxes; an unchecked item does not score; the score is an
  integer 0–5, inherently bounded (symptom cap 2 + 3), always finite.
- string '1' and boolean true both count as present.

## A11y / keyboard notes
- Labeled checkboxes; output aria-live="polite". 320px sweep passes with no
  horizontal scroll. Health-instability marker framed as care-planning decision
  support; no end-of-life order in Sophie's voice.

## Defects opened
- none

## Status
- PASS
