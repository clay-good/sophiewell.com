# v11 audit - electrolyte-replacement

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Hammond DA, Stojakovic J, Kathe N, et al. *Effectiveness and safety of potassium replacement in critically ill patients: a meta-analysis.* JAMA Netw Open. 2019;2(8):e198587 (potassium ladder; ASHP-aligned). Hebert PC, Macdonald A, Goldfarb AH. *Acute hypomagnesaemia.* In: *Acute Care Internal Medicine*, Lippincott 2008. Brown KA, Dickerson RN, Morgan LM, Alexander KH, Minard G, Brown RO. *A new graduated dosing regimen for phosphorus replacement in patients receiving nutrition support.* JPEN J Parenter Enteral Nutr. 2006;30(3):209-214. Bands: K 3.0-3.4 -> 40 mEq; 2.5-2.9 -> 60 mEq; <2.5 -> 80 mEq. Mg 1.0-1.7 -> 2 g; <1.0 -> 4 g. Phos 1.6-2.2 -> 0.16 mmol/kg; 1.0-1.5 -> 0.32 mmol/kg; <1.0 -> 0.64 mmol/kg.

`lib/scoring-v4.js electrolyteReplacement()` accepts `{electrolyte, level, route, renalImpaired}` and returns `{electrolyte, level, route, dose, rate, banners}`.

## Boundary examples added
- K 3.8 -> 0 mEq (within range).
- K 3.2 -> 40 mEq.
- K 2.8 -> 60 mEq.
- K 2.2 -> 80 mEq.
- Mg 0.9 -> 4 g MgSO4.
- Mg 1.4 -> 2 g MgSO4.
- Phos 1.8 -> 0.16 mmol/kg.
- Phos 0.8 -> 0.64 mmol/kg.
- Renal-impairment flag adds dose-halving banner.

## Cross-implementation differential
- Reference: ASHP / Hammond 2019 K ladder; Hebert 2008 Mg ladder; Brown 2006 phosphate ladder.
- Sophie result: matches each ladder boundary. PASS.

## Edge-input handling notes
- Unknown electrolyte throws.
- Route other than iv / po throws.

## A11y / keyboard notes
- Electrolyte select, level input, route select, renal-impairment checkbox; all labeled and Tab-reachable; aria-live result region. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
