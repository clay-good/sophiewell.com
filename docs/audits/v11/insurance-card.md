# v11 audit - Insurance Card Decoder (printable) (`insurance-card`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Original plain-English explanations of insurance-card fields by the project author. No external lookup performed. The fields themselves (BIN, PCN, rx group, member id, group id, plan name, plan type, customer service phone, provider phone) are universal across US health-insurance cards.

## Boundary examples added
- META example: standard PPO card with BIN 003858, PCN A4, etc. -> renderer emits a printable reference card with each field's plain-English explanation.

## Cross-implementation differential
- N/A (printable template, no formula).

## Edge-input handling notes
- All fields optional; the renderer skips empty fields rather than printing "(blank)".
- The printable layout uses a card-sized print stylesheet so the output is folder-pocket-sized.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Labelled inputs; printable output uses semantic dl/dt/dd structure. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
