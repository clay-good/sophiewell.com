# v12 audit - aspects

- Auditor: CG
- Date: 2026-06-19
- Citation re-verified against: Barber PA, Demchuk AM, Zhang J, Buchan AM. Validity and reliability of a quantitative computed tomography score in predicting outcome of hyperacute stroke before thrombolytic therapy. Lancet. 2000;355(9216):1670-1674 (re-fetched; cross-read with MDCalc calc/2090, Radiopaedia, and the original 10-region topographic description).

`lib/neuro-v117.js aspects()` computes the Alberta Stroke Program Early CT Score
as 10 minus the count of the ten affected MCA-territory regions (caudate,
lentiform nucleus, internal capsule, insular ribbon, and M1-M6), clamped to
0-10. The source dichotomizes at <= 7, where lower scores predict worse
functional outcome and a higher symptomatic-hemorrhage risk after thrombolysis.
Class B (an imaging-read convention applied through evolving reperfusion
guidelines; docs/citation-staleness.md row, documentation-only).

## Boundary worked examples added
- a normal scan (no region marked) scores 10/10, favorable range (> 7).
- caudate + lentiform + insula -> 7/10, the <= 7 worse-outcome band.
- all ten regions affected -> 0/10 (clamped at the floor).
- two regions affected -> 8/10 stays favorable (> 7).
- the affected regions are named back to the user.

## Cross-implementation differential
- Reference: the 10-region region list and the subtract-from-10 rule are
  identical across the Barber 2000 description, MDCalc, and Radiopaedia. The
  reperfusion-eligibility threshold (e.g. ASPECTS >= 6) is a guideline overlay,
  not part of the score, and is deliberately NOT hard-coded; the tile reports the
  score and the source's <= 7 dichotomy only. Match. PASS.

## Edge-input handling notes
- All ten inputs are booleans; the region count is clamped 0-10 so the displayed
  score can never go negative or exceed 10. A scalar / non-object fuzz arg yields
  a valid score of 10 (no region flagged), never a NaN.

## A11y / keyboard notes
- Ten labeled checkboxes; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
