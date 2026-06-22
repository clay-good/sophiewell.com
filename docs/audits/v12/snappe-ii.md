# v12 audit - snappe-ii

- Auditor: CG
- Date: 2026-06-22
- Citation re-verified against: Richardson DK, Corcoran JD, Escobar GJ, Lee SK. SNAP-II and SNAPPE-II: simplified newborn illness severity and mortality risk scores. J Pediatr. 2001;138(1):92-100. Point table re-fetched and cross-verified across two independent reproductions, with the Apgar and mean-BP band directions and the PaO2/FiO2 unit convention confirmed.

`lib/peds-v140.js snappeII()` sums nine banded variables to 0-162: mean BP
(>=30 -> 0, 20-29 -> 9, <20 -> 19), lowest temperature in degC (>35.6 -> 0,
35.0-35.6 -> 8, <35.0 -> 15), the PaO2(mmHg)/FiO2(%) ratio (>2.49 -> 0,
1.0-2.49 -> 5, 0.3-0.99 -> 16, <0.3 -> 28), lowest serum pH (>=7.20 -> 0,
7.10-7.19 -> 7, <7.10 -> 16), multiple seizures (19), urine output (>=1 -> 0,
0.1-0.9 -> 5, <0.1 -> 18), birth weight (>=1000 -> 0, 750-999 -> 10, <750 -> 17),
SGA (<3rd percentile, 12), and a 5-minute Apgar (>=7 -> 0, <7 -> 18). Class A.

## Source-governance notes
- The oxygenation ratio is PaO2 in mmHg divided by FiO2 as a PERCENTAGE (e.g.
  50 / 80 = 0.625), which is what makes the published 2.49 / 0.99 / 0.3 cut-points
  consistent. A zero FiO2 is guarded (oxygenation scores its 0 band).
- A low (abnormal) value scores the points throughout -- the Apgar item scores 18
  for Apgar UNDER 7 (one secondary table transposed this; the primary assigns the
  points to the abnormal value), and mean BP scores 19 for <20 (>=30 is the 0 band).
- An unmeasured physiologic item scores its normal (0-point) band, the SNAP
  convention; the tool is always valid and bounded.
- No primary score-to-mortality percentage table is asserted: the tool reports the
  point total and the source's framing that higher totals carry a higher mortality
  risk, with descriptive lower/moderate/high severity bands only.

## Boundary worked examples added
- mean BP 25, temp 34.5, PaO2 50 / FiO2 80, pH 7.05, urine 0.5, BW 800, Apgar 5 ->
  9+15+16+16+0+5+10+0+18 = 89 (high severity).
- the maximal abnormal band of each variable sums to 162.
- all-blank input -> 0 (lower severity).
- PaO2 80 / FiO2 40 = ratio 2.0 -> 5 points; 90 / 30 = 3.0 -> 0 points.
- SGA alone -> 12; multiple seizures alone -> 19.

## Edge-input handling notes
- Each variable clamps to its band; blanks score 0; FiO2 of 0 does not divide by
  zero. Fuzzed (object path n/a; scalar path) returns finite, leak-free strings.

## A11y / keyboard notes
- Eight labeled number inputs and two labeled checkboxes (seizures, SGA); output
  aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
