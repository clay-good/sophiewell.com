# v11 audit - HIPAA Authorization Form Generator (`hipaa-auth`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: HIPAA Privacy Rule 45 CFR 164.508 (Authorization for disclosures of PHI). Required core elements per 164.508(c): description of information to be used / disclosed; person or class of persons authorized to make the disclosure; person or class of persons to whom the disclosure may be made; description of each purpose; expiration date or event; signature of individual (or personal representative); statement of right to revoke; statement that disclosed information may be redisclosed; statement that signing the authorization is voluntary. All 9 required elements remain current per 45 CFR 164.508 as of 2026.

## Boundary examples added
- META example: patient Jane Doe, plan Acme Health Plan, info "medical records 2024-2025", recipient "New Provider Internal Medicine", purpose "continuity of care", expiration 2027-05-15 -> renderer composes a printable authorization that includes all 9 required elements of 164.508(c).

## Test-suite check
- `test/unit/*.test.js` "HIPAA Authorization includes the 45 CFR 164.508 core elements" already pins the required-element coverage check for this tile (verified PASS in npm test).

## Cross-implementation differential
- N/A (template). The differential is "does the template include all 9 required elements of 164.508(c)?" — covered by the existing unit test plus this audit's hand-review.

## Edge-input handling notes
- Covered entities may add their own elements (e.g., institution-specific identifiers); the tile generates the federal-minimum template that satisfies 164.508(c).
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Multiple labelled inputs; printable output uses semantic letter layout. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
