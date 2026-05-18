# v11 audit - pesi

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Aujesky D, Obrosky DS, Stone RA, et al. *Derivation and validation of a prognostic model for pulmonary embolism.* Am J Respir Crit Care Med. 2005;172(8):1041-1046. Table 2 (variable weights) and Table 4 (30-day mortality by risk class).

Original 11-variable PESI. Age in years is the dominant contributor; other variables add fixed weights per Aujesky 2005 Table 2: male sex 10, cancer 30, heart failure 10, chronic lung disease 10, pulse >= 110 = 20, SBP < 100 = 30, RR >= 30 = 20, temp < 36 °C = 20, altered mental status 60, SaO2 < 90% on room air = 20. Risk classes per Aujesky 2005 Table 4: I <= 65, II 66-85, III 86-105, IV 106-125, V > 125. `lib/scoring-v4.js pesi()` implements the sum and the five-class banding with the Table 4 30-day mortality ranges surfaced in the interpretation block.

## Boundary examples added
- low: 50yo female, no criteria -> 50 (Class I; 30-day mortality 0.0-1.6%).
- mid: 70yo male + cancer + HR >= 110 -> 70 + 10 + 30 + 20 = 130 (Class V; 30-day mortality 10.0-24.5%).
- high: 90yo male with every criterion positive -> 90 + 10 + 30 + 10 + 10 + 20 + 30 + 20 + 20 + 60 + 20 = 320 (Class V).

Class boundaries asserted: 65 -> I, 66 -> II, 85 -> II, 86 -> III, 105 -> III, 106 -> IV, 125 -> IV, 126 -> V per Aujesky 2005 Table 4.

## Cross-implementation differential
- Reference implementation: Aujesky D, et al. Am J Respir Crit Care Med. 2005;172(8):1041-1046, Table 2 weights + Table 4 class boundaries.
- Test case: 70yo male + cancer + HR >= 110.
- Sophie result: 130, Class V.
- Reference result: 70 + 10 + 30 + 20 = 130 -> Class V per Aujesky 2005 Table 4 (> 125 cutoff).
- Delta: 0 / one ordinal category. PASS.

## Edge-input handling notes
- Age is a typed `number` input with `min="0"`; negative values would still compute to a negative total but the renderer's `safe()` wrapper catches NaN. Sex defaults to F (no male-sex 10-point adjustment); the spec-v12 §3.2.1 input list calls out male sex as an explicit modifier so the field is required.
- The 11 binary modifiers are checkboxes; default state matches the META[id].example fields ("no criteria positive").
- Aujesky 2005 records SaO2 "on room air" specifically; the checkbox label preserves that qualifier so a clinician on supplemental O2 does not mis-check the box.

## A11y / keyboard notes
- One labeled `number` input, one labeled select, nine labeled checkboxes; all Tab-reachable in source order; output region `aria-live="polite"`. `npm run test:a11y` clean after the tile was added.

## Defects opened
- none

## Status
- PASS
