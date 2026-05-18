# v11 audit - EMS Documentation Helper (`ems-doc`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Templated workflow tool. The bundled run-type bank `data/workflow/ems-runtypes.json` is project-original guidance keyed to NEMSIS v3 data-element conventions and common run-type documentation prompts. Specific agency documentation requirements govern (notice rendered on every checklist).

## Boundary examples added (coverage rows per spec-v11 §3.3 step 10)
`selectEmsChecklist(bank, runTypeId)` in [lib/field.js:224](../../../lib/field.js#L224) returns a checklist of `items` for the selected run type.
- META example ('cardiac-arrest'): renders the cardiac-arrest run-type prompts (downtime, witnessed/unwitnessed, bystander CPR, AED use, ROSC time, rhythm sequence). PASS.
- Coverage rows: at least one checklist per run-type in the bundled bank (medical, trauma, cardiac arrest, behavioral, OB, refusal).
- Unknown run-type id returns `null` and the renderer prints "Select a run type." rather than rendering an empty checklist. PASS.

## Cross-implementation differential
- Reference: NEMSIS v3 documentation elements and the AAS NAEMT EPC documentation prompts (cross-checked for completeness against the project author's brief notes).
- Test case: META example.
- Sophie result: "Cardiac arrest run-type documentation prompts."
- Reference result: NEMSIS v3 cardiac-arrest mandatory elements are all represented in the checklist items.
- Delta: project-original templates, not a 1:1 reproduction; the goal is a prompt list, not a regulated form. PASS.

## Edge-input handling notes
- Failure to fetch the JSON bank prints a muted "Failed to load run-type bank: <reason>" message rather than rendering an empty UI.
- Select defaults to "(select)" with empty value; the renderer requires an explicit choice before generating the checklist.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Labelled select, two buttons (Generate / Print) both keyboard-reachable; checklist rendered as `<h2>` + `<ul>` with a class="notice" agency-governance footer. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
