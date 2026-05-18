# v11 audit - Common Lab Reference Ranges (`lab-ranges`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: NIH MedlinePlus laboratory reference values and Harrison's Principles of Internal Medicine (21e) appendix of normal laboratory values. The visible caveat that lab-specific reference ranges supersede is rendered via the META citation. Bundled values are the consensus adult-population reference intervals.

## Shard integrity
- Backed by `data/clinical/*` lab-range JSON shards; `scripts/verify-integrity.mjs` covers the manifest hash on the standard verify pass.

## Boundary examples added
- Per spec-v11 §3.3 step 10, sampled rows across categories:
  - Sodium 135-145 mEq/L (matches Harrison's appendix). PASS.
  - Potassium 3.5-5.0 mEq/L. PASS.
  - BUN 7-20 mg/dL. PASS.
  - Glucose (fasting) 70-99 mg/dL. PASS.
  - Hemoglobin (F) 12.0-15.5 g/dL. PASS.

## Cross-implementation differential
- N/A for lookup tile. Cross-checked sampled rows against MedlinePlus and Harrison's; all match within the published reference interval. Disjoint from `lab-adult` (which is the dedicated bundled lab table tile); `lab-ranges` is the quick-lookup search interface over the same dataset.

## Edge-input handling notes
- Free-text search field is matched case-insensitively against analyte labels; an unmatched query returns "No matches" rather than a silent empty render.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Search input is labelled; result rows render as a `<table>` reachable in tab order. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
