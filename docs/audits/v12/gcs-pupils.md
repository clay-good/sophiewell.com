# v12 audit - gcs-pupils

- Auditor: CG
- Date: 2026-06-18
- Citation re-verified against: Brennan PM, Murray GD, Teasdale GM. J Neurosurg. 2018;128(6):1612-1620.

`lib/trauma-v108.js gcsPupils()` computes GCS-P = GCS total - pupil reactivity
penalty (number of pupils unreactive: 0/1/2), bounding the index to 1-15 and
rejecting a GCS outside 3-15. Class A.

## Boundary worked examples added
- out-of-range / missing GCS -> fallback.
- both pupils reactive: GCS-P equals GCS.
- band flip: one unreactive pupil drops the index by 1.
- index bounded to 1: GCS 3 with both pupils unreactive -> 1.
- severe range flag at <= 8.
- pupils default to 0 when not given.

## Cross-implementation differential
- Reference: the GCS-P = GCS - PRS formula, the 0/1/2 pupil penalty, and the 1-15
  range cross-verified against glasgowcomascale.org and the J Neurosurg full text.
  The penalty cannot drive the index below 1 (GCS 3, PRS 2 -> 1). Match. PASS.

## Edge-input handling notes
- a prognostic index, not a treatment decision; the note frames a lower GCS-P as
  worse 6-month outcome in the IMPACT/CRASH data.

## A11y / keyboard notes
- Labeled number input/select; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
