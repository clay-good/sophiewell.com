# v11 audit - Discharge Instructions Template (`discharge-instr`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Reference template only — institutional discharge protocols and condition-specific guidelines (e.g., CMS Conditions of Participation 42 CFR 482.43 for hospital discharge planning) govern required content. Sophie's template captures the four discharge-instruction elements common across institutions: diagnosis, follow-up, return precautions, medications.

## Boundary examples added
- META example: dx "Community-acquired pneumonia", follow-up "2026-05-22 with PCP", return precautions list (fever >102 F, worsening SOB, chest pain), meds "Amoxicillin 500 mg PO TID x 7 days" -> renderer composes a printable instruction sheet via `buildDischargeInstructions` containing all four sections plus an "Other notes" section.
- Empty inputs path: renderer still produces the printable scaffold; empty sections are rendered as headings with no list items (verified by hand-reading `lib/workflow-v4.js buildDischargeInstructions`).
- Multi-line lists: textarea inputs are split on newline, trimmed, and filtered for empties before being passed to the builder; trailing blank lines do not produce empty `<li>` rows.

## Cross-implementation differential
- N/A (template). The differential is "does the rendered sheet include the four required sections from user input?" — covered by `test/unit/workflow-v4.test.js` template-coverage assertions.

## Edge-input handling notes
- The tile is explicitly a reference template; the bundled citation reminds the user that institutional protocols supersede.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Five labelled inputs / textareas; printable output uses the shared `renderPrintable` semantics. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
