# v11 audit - Adult Cardiac Arrest Drug Reference (`adult-arrest-ref`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: AHA ECC 2020 guidelines (Panchal AR et al. Circulation. 2020;142(suppl 2):S366-S468), numeric drug-dose facts only. Bundled shard `data/aha-reference/aha-reference.json` carries the doses/intervals; flowcharts not reproduced (AHA copyrights the algorithm diagrams; spec-v11 carries numeric facts only).

## Boundary examples added (coverage rows per spec-v11 §3.3 step 10)
The renderer iterates `data.adultArrest`; every row in the bundled shard is rendered.
- Epinephrine: 1 mg IV/IO every 3-5 min, any-rhythm arrest. PASS (matches AHA ECC 2020).
- Amiodarone: 300 mg IV/IO bolus, then 150 mg after second shock for VF/pVT. PASS.
- Lidocaine: 1-1.5 mg/kg then 0.5-0.75 mg/kg q5-10min (max 3 mg/kg) - alternative for refractory VF/pVT. PASS.
- Magnesium sulfate: 1-2 g IV/IO over 15 min for torsades. PASS.
- Sodium bicarbonate: 1 mEq/kg for TCA toxicity, hyperkalemia, prolonged arrest. PASS.

## Cross-implementation differential
- Reference implementation: AHA ECC 2020 published doses (cross-checked against ACLS Provider Manual).
- Test case: epinephrine row.
- Sophie result: 1 mg IV/IO every 3-5 minutes (any rhythm).
- Reference result: 1 mg IV/IO every 3-5 minutes.
- Delta: 0%. PASS.

## Edge-input handling notes
- Pure data-render tile (no user numeric inputs); no edge math to handle.
- Shard hash gated by `scripts/verify-integrity.mjs` per `docs/operations.md`.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Single table with `<th scope="col">` headers; attribution and edition rendered as muted paragraphs above and below. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
