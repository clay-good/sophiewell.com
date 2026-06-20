# v12 audit - met-alkalosis-compensation

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Narins RG, Emmett M. Medicine (Baltimore). 1980;59(3):161-187 (PMID 6774200). Form cross-read against the standard 0.7×(HCO3−24)+40 rule (OpenAnesthesia; PMC2327641).

`lib/acidbase-v129.js metAlkalosisCompensation()` computes expected PaCO2 = 0.7×(HCO3 − 24) + 40, then compares the measured PaCO2 (±5 mmHg band). Class A (journal+author citation — no docs/citation-staleness.md row).

## Source-governance note
- Two algebraic conventions circulate: 0.7×(HCO3−24)+40 and the shorthand 0.7×HCO3+20,
  which diverge by ~3 mmHg. The implemented form is the clean per-mEq rule
  0.7×(HCO3−24)+40 (the +20 shorthand is noted in the module comment). Band tolerance ±5.
- Expected PaCO2 is clamped to [40, 60]; respiratory compensation does not drive PaCO2
  above ~60 in a pure metabolic alkalosis. This is the metabolic-alkalosis complement of
  Winter's formula (the metabolic-acidosis rule, `winters`) — cross-linked, both kept.

## Boundary worked examples added
- HCO3 40 → expected PaCO2 51.2; measured 51 matches (appropriate compensation).
- measured PaCO2 above band → added respiratory acidosis flag.
- measured PaCO2 below band → added respiratory alkalosis flag.
- normal HCO3 24 → expected PaCO2 clamped at 40 (floor).
- any blank field → valid:false.

## Edge-input handling notes
- HCO3 and PaCO2 require positive values. abnormal=true only when measured leaves the ±5
  band.

## A11y / keyboard notes
- Two number inputs each labeled; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
