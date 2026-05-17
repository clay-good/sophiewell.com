# v11 audit - qSOFA / SOFA (`qsofa-sofa`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: Singer M, Deutschman CS, Seymour CW, et al. *The Third International Consensus Definitions for Sepsis and Septic Shock (Sepsis-3).* JAMA. 2016;315(8):801-810 (qSOFA). Vincent JL, Moreno R, Takala J, et al. *The SOFA (Sepsis-related Organ Failure Assessment) score to describe organ dysfunction/failure.* Intensive Care Med. 1996;22(7):707-710 (SOFA). Mortality bands cross-checked against Ferreira FL et al. *Serial Evaluation of the SOFA Score to Predict Outcome.* JAMA. 2001;286(14):1754-1758.

## Boundary examples added
qSOFA (each criterion 1 pt; threshold >= 2 = high mortality risk):
- low: no criteria positive -> 0, "Low mortality risk by qSOFA"
- mid: RR >= 22 + altered mental status -> 2, "High mortality risk (sepsis screen positive)" (META example value)
- high: RR >= 22 + altered mental + SBP <= 100 -> 3, "High mortality risk (sepsis screen positive)"

SOFA (six organ systems, each 0-4, total 0-24; bands 0-6, 7-9, 10-12, 13-24):
- low: respiration=1, cardiovascular=1, cns=1 (others 0) -> 3, "Low (~10% mortality)"
- mid: respiration=3, cardiovascular=3, cns=2, renal=2 -> 10, "High (~40-50%)"
- high: every system 3 (no system at 4) -> 18, "Very high (>50%)"

## Cross-implementation differential
- Reference implementation: Singer et al. 2016 (qSOFA) and Ferreira et al. 2001 (SOFA mortality bands).
- Test case (qSOFA): two criteria positive.
- Sophie result: score 2, "High mortality risk (sepsis screen positive)".
- Reference result: Sepsis-3 framing - qSOFA >= 2 identifies patients at higher risk of death or prolonged ICU stay.
- Delta: 0%. PASS.
- Test case (SOFA): aggregate 10.
- Sophie band: "High (~40-50%)" (10-12 band).
- Reference (Ferreira 2001 Table 3): mortality rises stepwise with aggregate SOFA; the 10-12 range corresponds to ~40-50% ICU mortality.
- Delta: 0%. PASS.

## Edge-input handling notes
- `lib/scoring-v4.js sofa` clamps every organ-system input to [0, 4] via `Math.max(0, Math.min(4, n))`, so out-of-range entries cannot inflate the aggregate. PASS.
- qSOFA inputs are boolean checkboxes; nothing to validate beyond present/absent. PASS.
- The renderer renders qSOFA above SOFA, and both share an `aria-live="polite"` output region so re-tabbing updates both scores together. PASS.

## A11y / keyboard notes
- Three checkboxes (qSOFA) + six labeled selects (SOFA), all label-bound and Tab-reachable in source order. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
