# v11 audit - DOT ERG Hazmat Lookup (`dot-erg`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: US DOT PHMSA Emergency Response Guidebook (current edition). UN/NA-number lookups, ERG guide number, initial isolation distance, protective-action distance, and immediate actions per ERG green/orange pages. Bundled shard `data/dot-erg/erg.json`.

## Boundary examples added (coverage rows per spec-v11 §3.3 step 10)
- UN 1017 (Chlorine): Guide 124; isolation 200 ft; protective action 1.5 mi; "Evacuate downwind. PPE: SCBA + chemical-protective clothing. No water on spill." PASS.
- UN 1075 (LPG): Guide 115; isolation 330 ft; protective 0.5 mi; "Eliminate ignition sources. SCBA. Evacuate 1 mi if tank engulfed in fire." PASS.
- UN 1170 (Ethanol): Guide 127; isolation 165 ft; "Use alcohol-resistant foam. SCBA + structural firefighter PPE." PASS.
- UN 1203 (Gasoline): Guide 128. PASS.
- UN 1830 (Sulfuric acid): Guide 137; "No water directly on spill." PASS.
- Coverage rows hit different ERG guide numbers (124 / 115 / 127 / 128 / 137) spanning gas/liquid/corrosive shards.

## Cross-implementation differential
- Reference implementation: ERG 2024 paper book (PHMSA).
- Test case: UN 1017 (chlorine).
- Sophie result: Guide 124, 200 ft initial isolation, 1.5 mi protective action.
- Reference result: ERG Guide 124 (Gases — Toxic and/or Corrosive — Oxidizing); small-spill protective-action distance 1.5 mi downwind matches the green-page small-spill day column for chlorine.
- Delta: matches. PASS.

## Edge-input handling notes
- Pure data-table lookup; `renderTable` provides a search/filter UI per [lib/table.js](../../../lib/table.js).
- Bundled shard hash gated by `scripts/verify-integrity.mjs` per docs/operations.md.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- `renderTable` emits an accessible `<table>` with `<th>` headers and a labelled filter input; output region role="region" with `aria-live="polite"`. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
