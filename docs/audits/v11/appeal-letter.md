# v11 audit - Appeal Letter Generator (`appeal-letter`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Educational template; plan-specific appeal procedures govern. The required internal-appeal infrastructure for ACA-regulated plans is at 45 CFR 147.136 (and its ERISA cross-reference at 29 CFR 2560.503-1 for employer plans); both remain current as of 2026. The tile does not implement plan-specific deadlines (which vary by plan and state).

## Boundary examples added
- META example: appeal letter populated with patient, member id, date of service, provider, service description, ICD-10 (M54.5), plan, denial date, and denial reason -> renderer composes a printable letter quoting the denial reason back to the plan and citing 45 CFR 147.136 internal-appeal rights.

## Cross-implementation differential
- N/A (template). The differential is "do the cited internal-appeal regulations match the template's quoted text?" — confirmed against 45 CFR 147.136.

## Edge-input handling notes
- All fields required to render a printable letter; the renderer surfaces "(missing field)" in the printable copy if a field is empty, rather than silently omitting.
- Template wording is explicitly labelled "educational; plan-specific appeal procedures govern" — consistent with spec-v11 §5.3 (no Sophie-authored legal advice).
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Multiple labelled inputs; printable output uses semantic letter layout. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
