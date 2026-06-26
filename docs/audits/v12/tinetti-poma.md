# v12 audit - tinetti-poma

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: Tinetti ME. Performance-oriented assessment of mobility problems in elderly patients. J Am Geriatr Soc. 1986;34(2):119-126 (28-point version; cross-verified against MDCalc and StatPearls; ≥ 2 sources, spec-v97).

`lib/function-v154.js tinettiPoma()` sums the balance (0–16) and gait (0–12)
subscale totals into the 0–28 score with the fall-risk bands. Group G, Class A.

## Source-governance notes
- 28-point version: balance subscale 0–16 plus gait subscale 0–12, total 0–28.
- Bands ≤ 18 high, 19–23 moderate, ≥ 24 low (MDCalc / StatPearls). The printed POMA
  form classifies a score of 24 as moderate; this tile follows the MDCalc/StatPearls
  24 = low convention (the only point that differs). A 30-point balance variant
  exists; this is the 28-point total — do not mix.

## Boundary worked examples added
- balance 12 + gait 8 = 20 (moderate); 18/19 boundary; 23/24 boundary (24 classed
  low); max 28 low; gait clamps at 12; blank subscore → valid:false.

## Edge-input handling notes
- Each subscore finite-checked and clamped to its range; a blank subscore surfaces a
  complete-the-fields fallback; covered by the spec-v59 fuzz harness, zero non-finite
  leaks.

## A11y / keyboard notes
- Two labelled number inputs; output aria-live. 320px sweep, no horizontal scroll.

## Defects opened
- none

## Status
- PASS
