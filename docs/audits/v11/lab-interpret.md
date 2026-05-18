# v11 audit - Lab Result Interpreter (`lab-interpret`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Reference ranges per MedlinePlus, ARUP Laboratories Reference Lab Test Directory, Harrison's *Principles of Internal Medicine* (21e), ADA 2024 Standards of Medical Care in Diabetes, 2018 ACC/AHA Cholesterol Guideline, and ATA 2014 Guidelines for Hypothyroidism in Adults. Plain-English narratives by the project author.

## Boundary examples added
- META example: A1C 5.4% -> "A1C 5.4% within range (4.0-5.6%)". Confirms band ADA 2024 (A1C <5.7 = normal; 5.7-6.4 = prediabetes; >=6.5 = diabetes).
- ADA prediabetes boundary: A1C 5.7 -> prediabetes band.
- ADA diabetes boundary: A1C 6.5 -> diabetes band.
- Lipid panel boundaries (per 2018 ACC/AHA): LDL <100 optimal; 100-129 near optimal; 130-159 borderline; 160-189 high; >=190 very high.
- TSH per ATA 2014: 0.4-4.5 mIU/L typical adult reference range (lab-specific overrides supersede).

## Cross-implementation differential
- N/A for reference-range bands (the band thresholds are themselves the reference). Cross-checked against ADA Standards 2024 Section 2 (diagnosis), 2018 ACC/AHA Cholesterol Table 5, and ATA 2014 hypothyroidism guideline TSH bands.

## Edge-input handling notes
- The tile presents bands per the named guideline; the citation note "Lab-specific reference ranges supersede" is explicit because labs calibrate their own ranges based on local population and assay variant.
- Plain-English narratives are reference-style ("A1C ≥6.5% meets ADA diagnostic threshold"), not Sophie-authored treatment guidance — consistent with spec-v11 §5.3.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Multiple labelled lab-value inputs; output region announces band and source guideline. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
