# v12 audit - resp-acidosis-compensation

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Brackett NC Jr, Cohen JJ, Schwartz WB. N Engl J Med. 1965;272:6-12 (acute); Schwartz WB chronic adaptation. Coefficients cross-read against the Boston/Schwartz-Relman rules (Deranged Physiology; StatPearls NBK482430).

`lib/acidbase-v129.js respAcidosisCompensation()` computes expected HCO3 = 24 + k×(PaCO2 − 40)/10, k = 1 acute, 4 chronic, then compares the measured HCO3 (±2 mEq/L band). Class A (journal+author citation — no docs/citation-staleness.md row).

## Source-governance note
- Acute coefficient +1 per 10 mmHg; chronic +4 per 10 mmHg (the 3.5-4 range; 4 is the
  most-cited single value). The acute-versus-chronic selector is explicit, not inferred.
- The expected HCO3 is clamped to a physiologic range [10, 45]; compensation alone rarely
  lifts HCO3 past ~45.

## Boundary worked examples added
- acute, PaCO2 60 → expected HCO3 26; measured 26 matches (appropriate compensation).
- chronic, PaCO2 60 → expected HCO3 32 (acute-vs-chronic boundary).
- measured above expected band → added metabolic alkalosis flag.
- measured below expected band → added metabolic acidosis flag.
- any blank field → valid:false.

## Edge-input handling notes
- PaCO2 and HCO3 require positive values; chronic is an explicit boolean from the
  acute/chronic selector. abnormal=true only when measured leaves the ±2 band.

## A11y / keyboard notes
- Two number inputs and one select, each labeled; output aria-live="polite". 320px sweep,
  no hscroll.

## Defects opened
- none
