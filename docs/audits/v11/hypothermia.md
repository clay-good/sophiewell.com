# v11 audit - Hypothermia Staging Reference (`hypothermia`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Wilderness Medical Society Practice Guidelines for the Out-of-Hospital Evaluation and Treatment of Accidental Hypothermia (current edition). Standard 3-stage clinical schema confirmed against Tintinalli's Emergency Medicine (9th ed.) hypothermia chapter and Auerbach's Wilderness Medicine (7th ed.).

## Boundary examples added (coverage rows per spec-v11 §3.3 step 10)
Pure data-render tile; bundled shard `data/environmental/environmental.json` `hypothermia` array.
- Mild (32-35 C / 90-95 F): shivering present, tachycardia, vasoconstriction, alert mental status. PASS.
- Moderate (28-32 C / 82-90 F): shivering may be lost, decreased mentation, bradycardia, atrial dysrhythmias. PASS.
- Severe (below 28 C / 82 F): coma, fixed pupils, ventricular dysrhythmias, asystole; "treat as potentially viable until rewarmed". PASS (matches WMS guidance: "no one is dead until warm and dead").

## Cross-implementation differential
- Reference implementation: WMS hypothermia practice guidelines, Auerbach Wilderness Medicine 7th ed.
- Test case: severe row.
- Sophie result: "Below 28 C (82 F): Coma, fixed pupils, ventricular dysrhythmias, asystole."
- Reference result: WMS Stage IV (severe): T <28 C, comatose, vital signs may be absent.
- Delta: text-faithful to WMS classification. PASS.

## Edge-input handling notes
- Pure reference tile; no inputs. Bundled shard hash gated by `scripts/verify-integrity.mjs`.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- `<table class="lookup-table">` with three `<th scope="col">` headers; attribution rendered as a muted paragraph above. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
