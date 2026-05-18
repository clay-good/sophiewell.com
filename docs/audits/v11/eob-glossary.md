# v11 audit - EOB Jargon Glossary (`eob-glossary`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Underlying terms map to X12 835 remittance fields and the EOB content requirements that ACA-regulated plans must include per 45 CFR 147.136. Original plain-English glossary entries by the project author. The X12 835 transaction is HIPAA-mandated for electronic remittance under 45 CFR 162; the patient-facing EOB is governed by 45 CFR 147.136(b)(2)(ii).

## Boundary examples added
- Renderer renders a glossary of common EOB terms (Allowed amount, Adjustment, Plan paid, Patient responsibility, Co-insurance, Co-pay, Deductible, Out-of-pocket maximum, Network status, Claim number, Date of service, Provider, CARC, RARC) each with a plain-English explanation.

## Cross-implementation differential
- N/A (glossary). The differential is "do the term definitions map to the X12 835 / 45 CFR 147.136 reference?" — confirmed by re-reading the X12 835 implementation guide and 45 CFR 147.136.

## Edge-input handling notes
- All entries are plain-English by the project author (no X12-licensed long descriptors).
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Glossary rendered as dt/dd. Search filter labelled. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
