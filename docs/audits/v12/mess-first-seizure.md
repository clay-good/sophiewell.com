# v12 audit - mess-first-seizure

- Auditor: CG
- Date: 2026-06-19
- Citation re-verified against: Kim LG, Johnson TL, Marson AG, Chadwick DW; MRC MESS Study Group. Prediction of risk of seizure recurrence after a single seizure and early epilepsy. Lancet Neurol. 2006;5(4):317-322 (re-fetched; the PubMed abstract plus the PMC1783498 commentary cross-read on the index and the risk-group ranges).

`lib/neuro-v120.js messFirstSeizure()` builds the prognostic index from number of
seizures at presentation (1 = 0, 2-3 = +1, >= 4 = +2), a neurological disorder
(+1), and an abnormal EEG (+1), for a total of 0-4 mapped to LOW (0), MEDIUM (1),
or HIGH (>= 2). Class A (fixed grouping rule). Id distinct from the v109
`mangled-extremity` MESS (collision audit per spec-v100 section 4).

## NO-FABRICATION note
- The full 1-/3-/5-year x treated/deferred recurrence grid lives ONLY in the
  paywalled Lancet Neurol Table 4 and is NOT reproducible from two independent open
  sources. Per the v97 re-fetch discipline and the project no-fabrication
  governance, the tile reports the confirmable risk-group RANGES over a 3-5 year
  window (low ~30-39% both arms; medium ~35-39% immediate vs ~50-56% deferred; high
  > 50% immediate, ~65% at 5 yr deferred) and invents no discrete annual cell.

## Boundary worked examples added
- single seizure, no factors -> 0/4, Low.
- one risk factor -> 1/4, Medium.
- 4 or more seizures -> 2/4, High (the +2 item alone flips).
- two single-point factors -> 2/4, High.
- every factor -> 4/4, High.
- scalar fuzz arg -> valid 0/4 Low, never NaN.

## Cross-implementation differential
- Reference: low=0, medium=1, high=>=2 verbatim from PMC1783498. Match. PASS.

## Edge-input handling notes
- One select (0-2) and two booleans; total clamped 0-4. A scalar fuzz arg yields a
  valid 0/4 Low, never NaN.

## A11y / keyboard notes
- One labeled select, two labeled checkboxes; output aria-live="polite". 320px
  sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
