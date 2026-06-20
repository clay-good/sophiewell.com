# v12 audit - resp-alkalosis-compensation

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Gennari FJ, Goldstein MB, Schwartz WB. J Clin Invest. 1972;51(7):1722-1730. Coefficients cross-read against the Boston rules (LITFL; Medscape 301680).

`lib/acidbase-v129.js respAlkalosisCompensation()` computes expected HCO3 = 24 − k×(40 − PaCO2)/10, k = 2 acute, 4 chronic, clamped to a physiologic floor (18 acute, 12 chronic), then compares the measured HCO3 (±2 mEq/L band). Class A (journal+author citation — no docs/citation-staleness.md row).

## Source-governance note
- Acute coefficient −2 per 10 mmHg; chronic −4 per 10 mmHg (the 4-5 range). HCO3 does not
  fall below a physiologic floor — about 18 acute, about 12 chronic — so the expected
  value is clamped there. The acute-versus-chronic selector is explicit, not inferred.

## Boundary worked examples added
- acute, PaCO2 25 → expected HCO3 21; measured 21 matches (appropriate compensation).
- chronic, PaCO2 25 → expected HCO3 18 (acute-vs-chronic boundary).
- chronic floor: PaCO2 10 → expected HCO3 clamped at 12.
- measured below expected band → added metabolic acidosis flag.
- any blank field → valid:false.

## Edge-input handling notes
- PaCO2 and HCO3 require positive values; chronic is an explicit boolean. abnormal=true
  only when measured leaves the ±2 band.

## A11y / keyboard notes
- Two number inputs and one select, each labeled; output aria-live="polite". 320px sweep,
  no hscroll.

## Defects opened
- none
