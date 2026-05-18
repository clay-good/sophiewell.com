# v11 audit - HIPAA Right of Access Request Generator (`hipaa-roa`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: HIPAA Privacy Rule 45 CFR 164.524 (Right of Access). Key elements: 30-day response requirement (with one 30-day extension if written notice provided); cost-based fee cap (no per-page fees beyond reasonable cost-based labor, supplies, and postage); covered-entity duty to provide records in the form requested when readily producible. All elements of 45 CFR 164.524 are current as of 2026; the 2019 OCR FAQ on RoA fees and the 2020 *Ciox Health v. Azar* decision (which narrowed the third-party-fee provision) are absorbed into the current OCR enforcement posture.

## Boundary examples added
- META example: patient Jane Doe, DOB 1985-03-12, facility Acme Internal Medicine, range 2024-01-01 to 2025-01-01, records "office visit notes, lab results, imaging reports", format electronic PDF, delivery patient portal -> renderer composes a printable letter explicitly citing 45 CFR 164.524, the 30-day response window, and the cost-based fee cap.

## Cross-implementation differential
- N/A (template). The differential is "does the template's quoted regulatory text match 45 CFR 164.524?" — confirmed by re-reading the Privacy Rule section.

## Edge-input handling notes
- The template's "30-day with one 30-day extension" wording matches 45 CFR 164.524(b)(2). The cost-based fee cap wording reflects OCR's current enforcement guidance.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Multiple labelled inputs; printable output uses semantic letter layout. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
