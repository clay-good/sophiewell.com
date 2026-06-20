# v12 audit - helps2b

- Auditor: CG
- Date: 2026-06-19
- Citation re-verified against: Struck AF, Ustun B, Ruiz AR, et al. Association of an electroencephalography-based risk score with seizure probability in hospitalized patients. JAMA Neurol. 2017;74(12):1419-1424 (re-fetched; the JAMA Neurology fulltext plus the MDCalc / Medscape reproductions cross-read on the integer->risk lookup).

`lib/neuro-v120.js helps2b()` sums six cEEG-read items: B(I)RDs (+2);
LPDs/LRDA/BIPDs, sporadic epileptiform discharges, frequency > 2 Hz, plus
features, and prior seizure history (+1 each), for a total of 0-7. The total maps
through the published fixed integer->risk lookup of calibrated 72-hour seizure
probabilities {0:5, 1:12, 2:27, 3:50, 4:73, 5:88, 6:>95, 7:>95}%. Class A.

## ML-derivation note (spec-v100 section 11)
- The score was DERIVED by a machine-learning (RiskSLIM) method but ships here as
  a deterministic compiled lookup constant; NO model runs at render time. The
  total is clamped to 0-7 before the lookup.

## Boundary worked examples added
- no features -> 0/7, about 5% risk.
- B(I)RDs alone -> 2/7, about 27% risk (the +2 item).
- B(I)RDs + sporadic -> 3/7, about 50% (tile example).
- every item -> 7/7, folds into the above-95% stratum.
- full per-score lookup table reproduced (0..7).
- scalar fuzz arg -> valid 0/7, never NaN.

## Cross-implementation differential
- Reference: the JAMA paper and MDCalc agree exactly on the calibrated lookup
  percentages. The paper collapses scores 6 and 7 into a single ">95%" stratum, so
  the tile folds 7 into it rather than inventing a 7-specific figure. Match. PASS.

## Edge-input handling notes
- Six booleans; total clamped 0-7 before the array lookup. A scalar fuzz arg
  yields a valid 0/7, never NaN; the lookup index is always in range.

## A11y / keyboard notes
- Six labeled checkboxes; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
