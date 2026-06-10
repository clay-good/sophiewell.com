# v11 audit - Prior-Authorization Decision-Deadline Clock (`pa-turnaround`)

- Auditor: CG
- Date: 2026-06-10
- Citation re-verified against: CMS Interoperability and Prior Authorization Final Rule (CMS-0057-F, 2024): impacted payers decide standard PA within 7 calendar days, expedited within 72 hours (effective 2026). spec-v63 §3.4.

## Boundary examples added
- standard, submitted 2026-06-01 -> decision due 2026-06-08 (7 calendar days).
- expedited (72 h = 3 d) -> 2026-06-04; plan-specified 14-day window -> 2026-06-15; unknown type -> null.
- custom without a positive integer window -> TypeError; malformed date -> RangeError (caught by safe()).

## Cross-implementation differential
- Computed through lib/deadline.js. Expedited 72 h is modeled as 3 calendar days (the engine is day-granular); the window label states "72 hours" explicitly so the basis is not misread. Hand-checked. PASS.

## Edge-input handling notes
- CMS-0057-F windows apply to impacted payers (MA, Medicaid/CHIP, QHPs); commercial/ERISA windows are user-supplied. The note states the rule edition and effective year. PASS.

## A11y / keyboard notes
- Native date input + request-type <select> + numeric window field, all labeled; aria-live output, past-due flagged. test:a11y clean; 320px no-hscroll clean. PASS.

## Defects opened
- none

## Status
- PASS
