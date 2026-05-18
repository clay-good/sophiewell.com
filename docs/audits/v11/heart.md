# v11 audit - HEART Score (chest pain) (`heart`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: Six AJ, Backus BE, Kelder JC. *Chest pain in the emergency room: value of the HEART score.* Neth Heart J. 2008;16(6):191-196. 6-week MACE bands cross-checked against Backus BE, Six AJ, Kelder JC, et al. *A prospective validation of the HEART score for chest pain patients at the emergency department.* Int J Cardiol. 2013;168(3):2153-2158.

Five components, each 0/1/2 (History, EKG, Age, Risk factors, Troponin). Total range 0-10. Bands: 0-3 low (~1.7% MACE), 4-6 moderate (~16.6%), 7-10 high (~50.1%) per Backus 2013 Table 3. `lib/scoring-v4.js heart()` clamps each component to [0, 2] via `Math.max(0, Math.min(2, ...))` and sums them.

## Boundary examples added
- low: history=0, ekg=0, age=0, riskFactors=0, troponin=0 -> 0 (Low; 1.7% 6-week MACE per Backus 2013).
- mid: META example (history=1, ekg=0, age=1, riskFactors=1, troponin=0) -> 3 (Low band; META expected text "HEART 3 - low-risk band" matches).
- high: every component = 2 -> 10 (High; 50.1% MACE per Backus 2013).

Mid-band edge: history=2, ekg=1, age=1, riskFactors=2, troponin=0 -> 6 (top of Moderate band).

## Cross-implementation differential
- Reference implementation: Backus 2013 Int J Cardiol Table 3 (n=2440 prospective validation).
- Test case: total 3 (META example).
- Sophie result: 3, "Low (1.7% 6-week MACE)".
- Reference result: 3, low band, 1.7% MACE at 6 weeks (Backus 2013).
- Delta: 0%. PASS.

## Edge-input handling notes
- Each component is a 0/1/2 select with explicit labels for each tier (e.g., for History: "slightly suspicious" / "moderately suspicious" / "highly suspicious") per Six 2008 Box 1. This is the principal misuse risk on HEART: free-text history scoring is non-standard.
- The Troponin component anchors to "normal limit", "1-3x normal", ">3x normal" per Six 2008, deliberately not tied to a single assay so the score remains correct across local hs-cTn cutoffs.
- Defaults to a clinically benign mid-range example (total 3) so the rendered example is not alarming.

## A11y / keyboard notes
- Five labeled selects, Tab-reachable in source order. Output region `aria-live="polite"`. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
