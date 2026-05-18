# v11 audit - Patient Wallet Card (`wallet-card`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Patient-maintained medication / health summary template; not a substitute for a pharmacist-reviewed list. The wallet card surfaces the AHRQ-recommended carry-along elements (name, emergency contact, primary provider, pharmacy, allergies, conditions, medications).

## Boundary examples added
- META example: name "Jane Doe", emergency contact, primary provider, pharmacy, allergies "Penicillin", conditions "Hypertension Type 2 ..." -> renderer composes a printable wallet card via `buildWalletCard` containing all seven sections.
- Allergies blank path: per the label, blank allergies are treated as NKDA. The builder renders the literal "NKDA" string when the allergies array is empty (verified in `lib/workflow-v4.js buildWalletCard`).
- Multi-line lists: textarea inputs are split on newline, trimmed, and filtered for empties before being passed to the builder.

## Cross-implementation differential
- N/A (template). The differential is "does the printable card include the seven elements?" — covered by `test/unit/workflow-v4.test.js`.

## Edge-input handling notes
- The tile is reference-only; users are advised to have a pharmacist review the medications list.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Seven labelled inputs / textareas; printable output uses shared `renderPrintable` semantics. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
