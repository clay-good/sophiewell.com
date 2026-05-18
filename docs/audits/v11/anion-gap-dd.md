# v11 audit - Anion Gap & Delta-Delta (`anion-gap-dd`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: Wrenn KD. *The delta (delta) gap: an approach to mixed acid-base disorders.* Ann Emerg Med. 1990;19(11):1310-1313. Anion-gap formula per Emmett M, Narins RG. *Clinical use of the anion gap.* Medicine (Baltimore). 1977;56(1):38-54.

Delta-AG = measured AG − normal AG (12 default). Delta-HCO3 = normal HCO3 (24 default) − measured HCO3. Ratio = delta-AG / delta-HCO3. Wrenn 1990 interpretation bands: < 0.4 pure non-AG metabolic acidosis, 0.4-1 mixed AG + non-AG, 1-2 pure AG metabolic acidosis, > 2 AG acidosis plus concurrent metabolic alkalosis OR chronic respiratory acidosis. `lib/clinical-v4.js deltaDelta()` implements every band.

## Boundary examples added
- low (pure non-AG): AG 14, HCO3 14 -> delta-AG 2, delta-HCO3 10, ratio 0.2 -> "Pure non-AG metabolic acidosis (low ratio)".
- mid (pure AG, META example): Na 140, Cl 100, HCO3 14, alb 4 -> AG 26, delta-AG 14, delta-HCO3 10, ratio 1.4 -> "Pure AG metabolic acidosis".
- high (AG acidosis + alkalosis): AG 30, HCO3 22 -> delta-AG 18, delta-HCO3 2, ratio 9.0 -> "AG acidosis with concurrent metabolic alkalosis or chronic respiratory acidosis".

Boundary at ratio = 1.0 (delta-AG 10, delta-HCO3 10) lands in the 1-2 band ("pure AG"). Boundary at ratio = 0.4 (delta-AG 4, delta-HCO3 10) lands in the 0.4-1 band ("mixed"); ratio < 0.4 falls to pure non-AG.

Zero-delta-HCO3 edge: AG 20, HCO3 24 -> delta-HCO3 0 -> ratio null, "No change in HCO3." (avoids division by zero per implementation).

## Cross-implementation differential
- Reference implementation: Wrenn 1990 Ann Emerg Med Table 1 bands.
- Test case: META example.
- Sophie result: AG 26, ratio 1.4, "Pure AG metabolic acidosis".
- Reference result: ratio 1.4 falls in the 1-2 band (Wrenn 1990 Table 1).
- Delta: 0 categorical-band offsets. PASS.

## Edge-input handling notes
- The "normal" anion gap (12) and normal HCO3 (24) are tunable parameters; the renderer uses standard values per Wrenn 1990 but the function exposes overrides for labs that publish a different reference range (some modern assays publish AG normal 6-12 because of lower Cl- assays).
- Zero-divisor guard returns `ratio: null` with the explanatory message rather than `Infinity` or `NaN`.

## A11y / keyboard notes
- Four labeled number inputs, Tab-reachable in source order. Output region `aria-live="polite"`. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
