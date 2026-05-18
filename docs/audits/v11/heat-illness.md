# v11 audit - Heat Illness Staging Reference (`heat-illness`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Wilderness Medical Society Practice Guidelines for the Prevention and Treatment of Heat-Related Illness (current edition). Cross-checked against Tintinalli's Emergency Medicine (9th ed.) heat illness chapter (heat exhaustion vs heat stroke), and ACSM/NATA position statements on exertional heat illness.

## Boundary examples added (coverage rows per spec-v11 §3.3 step 10)
Pure data-render tile; bundled shard `data/environmental/environmental.json` `heatIllness` array.
- Heat exhaustion: core temp typically <40 C; profuse sweating; mental status preserved; nausea, headache, weakness. PASS.
- Heat stroke: core temp typically >=40 C; CNS dysfunction (confusion, seizures, coma); sweating may be absent or present. PASS.
- Boundary 40 C: aligns with WMS / Tintinalli definition of classic vs exertional heat stroke. PASS.

## Cross-implementation differential
- Reference implementation: WMS heat-illness practice guidelines; ACSM exertional heat-illness statement.
- Test case: heat-stroke row.
- Sophie result: ">=40 C with CNS dysfunction; sweating may be absent or present."
- Reference result: WMS heat stroke defined by core temp >=40 C plus CNS findings; sweating not exclusionary.
- Delta: text-faithful. PASS.

## Edge-input handling notes
- Pure reference tile; no inputs. Bundled shard hash gated by `scripts/verify-integrity.mjs`.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- `<table class="lookup-table">` with two `<th scope="col">` headers; attribution rendered above. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
