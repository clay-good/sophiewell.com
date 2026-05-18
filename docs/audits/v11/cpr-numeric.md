# v11 audit - CPR Numeric Reference (AHA) (`cpr-numeric`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: AHA ECC 2020 CPR/ECC guidelines (current edition). Numeric facts only (compression rate, depth, ratio, ventilation rate with advanced airway). Flowcharts not reproduced (AHA copyright). Bundled shard `data/cpr-aha-numeric/cpr.json`.

## Boundary examples added (coverage rows per spec-v11 §3.3 step 10)
- Adult: compression rate 100-120/min, depth >=2 in (5 cm) and <=2.4 in (6 cm), ratio 30:2 single rescuer, advanced-airway ventilation 1 breath every 6 sec (10/min). PASS.
- Pediatric: compression rate 100-120/min, depth ~1/3 AP diameter, ratio 30:2 single rescuer / 15:2 two-rescuer, advanced-airway ventilation 1 breath every 2-3 sec (20-30/min). PASS.
- Infant: compression rate 100-120/min, depth ~1.5 in (4 cm), ratio 30:2 single rescuer / 15:2 two-rescuer. PASS.
- Coverage spans the three population bands and the four numeric facts (rate, depth, ratio, ventilation) per band.

## Cross-implementation differential
- Reference implementation: AHA ECC 2020 BLS Provider Manual.
- Test case: adult compression depth.
- Sophie result: ">=2 in (5 cm), <=2.4 in (6 cm)".
- Reference result: AHA 2020 adult compression depth at least 2 in (5 cm), not exceeding 2.4 in (6 cm).
- Delta: 0%. PASS.

## Edge-input handling notes
- Pure data-render tile, no inputs.
- Bundled shard hash gated by `scripts/verify-integrity.mjs`.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- `<h2>` heading, then `<h3>` per population, then `<ul>` of key/value lines; output region role="region" with `aria-live="polite"`. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
