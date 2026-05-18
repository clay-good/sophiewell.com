# v11 audit - ROI Request Generator (`roi`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Patient-authorized release of information. The ROI letter is functionally a HIPAA-compliant authorization under 45 CFR 164.508 (which is audited under [[hipaa-auth]]). Many providers require their own ROI form; the Sophie template can be attached to or used as the basis for the provider-specific form. The required-element coverage check is pinned by `test/unit/*.test.js` "ROI request includes patient, records, delivery, signature".

## Boundary examples added
- META example: patient Jane Doe, DOB 1985-03-12, from "Acme Internal Medicine", to "New Provider Internal Medicine", date range 2024-01-01 to 2025-01-01, records "office notes, labs, imaging", delivery "secure email" -> renderer composes a printable ROI letter including the four required elements (patient, records, delivery, signature) per the existing pinned test.

## Cross-implementation differential
- N/A (template). The differential is "does the template include patient + records + delivery + signature elements?" — covered by the existing pinned unit test.

## Edge-input handling notes
- The tile is not a substitute for the destination provider's ROI form; many practices require their own. The Sophie template documents the same core elements and can be attached.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Multiple labelled inputs; printable output uses semantic letter layout. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
