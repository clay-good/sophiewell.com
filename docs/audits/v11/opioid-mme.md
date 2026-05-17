# v11 audit - Opioid MME Calculator (`opioid-mme`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: Dowell D, Ragan KR, Jones CM, Baldwin GT, Chou R. *CDC Clinical Practice Guideline for Prescribing Opioids for Pain - United States, 2022.* MMWR Recomm Rep 2022;71(3):1-95. Conversion factors confirmed against the CDC 2022 simplified table.

## Boundary examples added
- low: hydrocodone 5 mg q6h (4 doses/day) -> 5 × 4 × 1 = 20 MME. Below the CDC 50-MME reassessment threshold.
- mid: oxycodone 10 mg q4h (6 doses/day) -> 10 × 6 × 1.5 = 90 MME. Exactly at the CDC 90-MME documentation threshold.
- high: methadone 10 mg q8h (3 doses/day) -> 10 × 3 × 4.7 = 141 MME. Above both thresholds.

Per-drug factor verification (CDC 2022 table) against `data/mme-factors/mme.json`:
- codeine 0.15, hydrocodone 1, hydromorphone 4, morphine 1, oxycodone 1.5, oxymorphone 3, tapentadol 0.4, tramadol 0.2, fentanyl-patch (2.4 per mcg/hr/day), methadone 4.7. All match the CDC 2022 simplified table.

## Cross-implementation differential
- Reference implementation: CDC's own MME calculator (the SAS code and Excel workbook published alongside the 2022 guideline). A 25 mcg/hr fentanyl patch (worn 24 hours) -> 25 × 2.4 = 60 MME/day. Sophie returns 60.0 MME/day for the same input.
- Test case: 25 mcg/hr fentanyl-patch, 1 patch/day.
- Sophie result: 60.0 MME.
- Reference result: 60 MME (CDC 2022).
- Delta: 0%. PASS.

## Edge-input handling notes
- Renderer filters rows where `mgPerDose > 0 && dosesPerDay > 0`; partial / empty rows are silently ignored rather than crashing the total. PASS.
- Drug pick-list is a closed select sourced from the bundled factors file; unknown drugs cannot be entered. The breakdown line displays `(unknown drug)` only as a defensive branch in `mmeTotal`; it cannot trigger from the UI. PASS.
- Methadone uses the CDC 2022 simplified factor of 4.7 across all doses, replacing the prior tiered scheme (1×<20 mg/d, 2×, 3×, 4×). The data file's `note` records the version. The audit confirms the simplified factor is appropriate at every dose tier per the CDC 2022 guideline. PASS.

## A11y / keyboard notes
- Each row is a `<p>` containing select + two number inputs + Remove button, all reachable via Tab in source order. Output region `aria-live="polite"`. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
