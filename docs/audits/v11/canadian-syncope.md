# v11 audit - canadian-syncope

- Auditor: CG
- Date: 2026-06-06 (spec-v57).
- Citation re-verified against: Thiruganasambandamoorthy 2016 (Canadian Syncope Risk Score, CMAJ 188:E289).

lib/scoring-v5.js canadianSyncope() sums 9 weighted items (-3..+11) into 5 risk bands.

## Boundary examples added
- heart disease +1 + troponin +2 -> 3 medium.
- vasovagal predisposition -1 + ED vasovagal dx -2 -> -3 very low.
- cardiac dx + QTc + SBP extreme + troponin -> 8 very high.

## Cross-implementation differential
- Hand-weighted sum matches the published item weights. PASS.

## Edge-input handling notes
- weights applied via booleans; band thresholds fixed, no division.

## A11y / keyboard notes
- Labeled inputs (label for=), aria-live results, select/checkbox where applicable. test:a11y clean.

## Defects opened

- none

## Status
- PASS
