# v11 audit - Osmolal Gap (`osmolal-gap`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: Standard clinical-chemistry reference. Calculated osmolality formula (US units): 2 × Na + glucose/18 + BUN/2.8 (+ EtOH/4.6). Gap = measured osm − calculated osm; gap > 10 mOsm/kg raises suspicion of an unmeasured osmotically active solute (toxic alcohol screen). Primary references: Glasser L et al. Am J Clin Pathol. 1973;60(5):695-699 (osm gap concept); Hoffman RS et al. Ann Emerg Med. 1993;22(11):1689-1693 (modern interpretive bands).

`lib/clinical-v4.js osmolalGap()` implements the formula verbatim with optional ethanol contribution defaulting to 0.

## Boundary examples added
- low (normal gap): measured 290, Na 140, glucose 90, BUN 14, EtOH 0 -> calculated = 280 + 5 + 5 + 0 = 290; gap = 0. Normal.
- mid (META example): measured 300, Na 140, glucose 90, BUN 14, EtOH 0 -> calculated 290; gap 10. At the upper limit of normal; "within normal range" per Hoffman 1993.
- high (toxic alcohol concern): measured 350, Na 140, glucose 90, BUN 14, EtOH 0 -> calculated 290; gap 60. Markedly elevated; standard differential includes methanol, ethylene glycol, isopropanol, propylene glycol, diethylene glycol, mannitol, ethanol (if missed in history).

Ethanol-included edge: measured 350, Na 140, glucose 90, BUN 14, EtOH 200 -> calculated 290 + 43.5 = 333.5; gap 16.5. Demonstrates that accounting for measured EtOH brings the apparent gap down — if a residual gap > 10 remains after EtOH correction, the differential still includes toxic alcohols.

## Cross-implementation differential
- Reference implementation: Glasser 1973 + Hoffman 1993 formula.
- Test case: META example.
- Sophie result: calculated 290, gap 10.
- Reference result: 2 × 140 + 90/18 + 14/2.8 = 280 + 5 + 5 = 290; gap 10.
- Delta: 0%. PASS.

## Edge-input handling notes
- The formula uses US units (mg/dL for glucose, BUN, EtOH); SI labs need to convert (1 mmol/L glucose = 18 mg/dL ÷ 18; same for BUN ÷ 2.8 with mg/dL). Helper text in the tile notes the US-unit assumption.
- Ethanol is optional and defaults to 0. If EtOH is unknown but suspected, leaving the field blank yields a *maximum* possible gap; entering measured EtOH yields the *residual* gap.
- The interpretation framing ("gap > 10 raises suspicion of toxic alcohols") is hedged — the gap can be normal even with significant toxic-alcohol ingestion if the lab cannot measure freezing-point depression accurately, and a wide gap is non-specific (e.g., severe lactic acidosis can elevate it). The renderer surfaces both bounds.

## A11y / keyboard notes
- Five labeled number inputs, Tab-reachable in source order. Output region `aria-live="polite"`. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
