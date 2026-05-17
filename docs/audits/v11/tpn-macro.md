# v11 audit - TPN Macronutrient Calculator (`tpn-macro`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: ASPEN *Clinical Guidelines: Parenteral Nutrition* (current). Macronutrient kcal densities: dextrose 3.4 kcal/g (monohydrate, not anhydrous), amino acid 4 kcal/g, 20% lipid emulsion 2 kcal/mL.

## Boundary examples added
`tpnMacro` derives final-bag grams and kcal from percent concentration and final volume.
- low: 1000 mL bag, 10% dextrose, 3% amino acid, 5% lipid (= 50 mL of 20% lipid) -> 100 g dextrose (340 kcal), 30 g AA (120 kcal), 10 g lipid (100 kcal) = 560 kcal
- mid: 1500 mL bag, 20% dextrose, 5% amino acid, 10% lipid (= 150 mL of 20% lipid) -> 300 g dextrose (1020 kcal), 75 g AA (300 kcal), 30 g lipid (300 kcal) = 1620 kcal
- high: 2000 mL bag, 30% dextrose, 6% amino acid, 15% lipid (= 300 mL of 20% lipid) -> 600 g dextrose (2040 kcal), 120 g AA (480 kcal), 60 g lipid (600 kcal) = 3120 kcal

## Cross-implementation differential
- Reference implementation: hand calculation against ASPEN's macronutrient identity `kcal = grams × kcal_per_gram`; lipid term `kcal = mL_of_20pct_emulsion × 2 kcal/mL` matches the typical ASPEN worked example.
- Test case: 2000 mL bag, 25% dextrose, 5% amino acid, 0% lipid.
- Sophie result: 500 g dextrose × 3.4 = 1700 kcal; 100 g AA × 4 = 400 kcal; 0 kcal lipid -> 2100 kcal total.
- Reference result: 2100 kcal (ASPEN identity).
- Delta: 0%. PASS.

## Edge-input handling notes
- `lib/medication-v4.js tpnMacro` rejects non-positive volume with a typed `RangeError`. PASS.
- Defaults for missing percents are 0 (so a bag with no lipid still computes carb + protein cleanly). PASS.
- Lipid input is documented as "Lipid 20% (mL as % of final volume)" - i.e., the percentage of final volume that is *20% lipid emulsion*, not the percent strength of lipid in the bag. The label is explicit; the audit confirms there is no silent unit interpretation. PASS.
- Renderer prints kcal at 0 decimal places and grams at 1 decimal place via `toFixed`, matching how compounding pharmacies typically display the bag breakdown. PASS.

## A11y / keyboard notes
- Four number inputs, all label-bound. Output region `aria-live="polite"`. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
