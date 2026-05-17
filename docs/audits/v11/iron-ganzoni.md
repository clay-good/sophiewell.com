# v11 audit - Iron Deficit Calculator (Ganzoni) (`iron-ganzoni`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: Ganzoni AM. *Intravenous iron-dextran: therapeutic and experimental possibilities.* Schweiz Med Wochenschr 1970;100(7):301-303. Formula: total_iron_mg = weight_kg × (target_Hb − current_Hb) × 2.4 + iron_stores_mg.

## Boundary examples added
Adult stores default 500 mg (weight ≥ 35 kg); pediatric stores 15 × weight (weight < 35 kg).
- low (pediatric): 20 kg × (12 − 9) × 2.4 + (15 × 20) = 144 + 300 = 444 mg
- mid (adult, META example): 70 kg × (15 − 9) × 2.4 + 500 = 1008 + 500 = 1508 mg
- high (adult): 120 kg × (15 − 7) × 2.4 + 500 = 2304 + 500 = 2804 mg

## Cross-implementation differential
- Reference implementation: hand calculation against the published Ganzoni formula; also corroborated against the worked example in the EMA-published *Summary of Product Characteristics* for Ferinject (ferric carboxymaltose), which uses the same Ganzoni identity for dose calculation.
- Test case: 70 kg adult, current Hb 9, target Hb 15.
- Sophie result: 1508 mg total (1008 mg replacement + 500 mg stores).
- Reference result: 1508 mg (Ganzoni 1970; Ferinject SmPC).
- Delta: 0%. PASS.

## Edge-input handling notes
- `lib/clinical-v5.js ironDeficitGanzoni` rejects weights outside 1-400 kg and Hb outside 1-25 g/dL via the shared `num` validator. PASS.
- Throws `RangeError` when `currentHb >= targetHb` so the formula isn't applied where iron isn't deficient. PASS.
- Pediatric vs adult store default is automatic at the 35 kg cutoff per Ganzoni's pediatric annex. PASS.
- Optional `ironStoresMg` lets institutions override (e.g., for patients with documented depletion). Override is capped at 0-2000 mg. PASS.

## A11y / keyboard notes
- Weight + current/target Hb inputs, all label-bound. Output `aria-live="polite"`. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
