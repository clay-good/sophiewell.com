# v11 audit - Trauma Triage Decision Tool (CDC) (`field-triage`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: National Guideline for the Field Triage of Injured Patients (CDC, current edition; previously MMWR Recomm Rep 2012;61(RR-1):1-21 and the ACS-COT 2021 update). Four-step structure: (1) vitals/consciousness; (2) anatomy of injury; (3) high-risk mechanism; (4) special considerations.

## Boundary examples added
`fieldTriage(answers)` in [lib/field.js:91](../../../lib/field.js#L91) iterates the steps in order; the first triggered step returns the destination.
- low (no criteria met): "Closest appropriate facility" (step 0). PASS.
- step 1 (META example: GCS <=13 alone): "Highest-level trauma center" with reason "Step 1: vitals or consciousness criterion met." PASS (matches META expected).
- step 2 (penetrating chest only, normal vitals): "Highest-level trauma center", step 2. PASS.
- step 3 (high-risk MVC only): "Trauma center (consider)", step 3. PASS.
- step 4 (older adult only): "Use clinical judgment; consult medical control", step 4. PASS.
- coverage: criteria lists in `step1`/`step2`/`step3`/`step4` arrays match the bundled `data/field-triage/guidelines.json` shard.

## Cross-implementation differential
- Reference implementation: CDC field-triage flowchart (current edition).
- Test case: GCS<=13 alone.
- Sophie result: Highest-level trauma center, Step 1.
- Reference result: highest-level trauma center per Step 1.
- Delta: 0/0. PASS.

## Edge-input handling notes
- The four steps are short-circuited in order so a step-1 trigger always takes precedence over a later-step trigger (matches CDC algorithm intent).
- Bundled shard hash gated by `scripts/verify-integrity.mjs`.
- Free-form answers cannot be entered; the renderer materialises checkboxes from the shard.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Each step rendered as a `<section>` with a heading; checkboxes are labelled; the summary line is class="notice" and lives below the steps. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
