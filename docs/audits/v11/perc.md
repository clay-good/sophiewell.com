# v11 audit - PERC Rule (PE rule-out) (`perc`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: Kline JA, Mitchell AM, Kabrhel C, Richman PB, Courtney DM. *Clinical criteria to prevent unnecessary diagnostic testing in emergency department patients with suspected pulmonary embolism.* J Thromb Haemost. 2004;2(8):1247-1255. Validation: Kline JA, Courtney DM, Kabrhel C, et al. *Prospective multicenter evaluation of the pulmonary embolism rule-out criteria.* J Thromb Haemost. 2008;6(5):772-780.

Eight criteria per Kline 2004 Box: age >= 50, HR >= 100, SaO2 < 95% on room air, hemoptysis, exogenous estrogen, prior DVT/PE, recent surgery/trauma within 4 wk, unilateral leg swelling. **All eight must be negative AND the clinical pretest probability must be low** for PE to be safely excluded without further testing. `lib/scoring-v4.js perc()` filters truthy values from the eight booleans and reports "PERC negative" only when count = 0.

## Boundary examples added
- low (rule-out applies): no criteria positive -> 0 failures, "PERC negative: PE can be ruled out without further workup IF clinical pretest probability is low" (per Kline 2008 validation: <1% 45-day VTE in low-probability PERC-negative patients).
- mid: META example (age50 alone positive) -> 1 failure, "PERC positive: cannot rule out PE by criteria alone".
- high: all eight criteria positive -> 8 failures, "PERC positive".

## Cross-implementation differential
- Reference implementation: Kline 2004 J Thromb Haemost Box (eight criteria); Kline 2008 validation rule-out claim.
- Test case: zero criteria positive.
- Sophie result: 0, PERC negative (rule-out claim, conditional on low pretest probability).
- Reference result: All-negative PERC + low pretest probability -> <2% miss rate (Kline 2008).
- Delta: 0%. PASS.

## Edge-input handling notes
- The "IF clinical pretest probability is low" qualifier is mandatory and is rendered verbatim in the band string; Kline's rule does NOT apply to moderate- or high-probability patients regardless of PERC status. This is the most common misuse and is countered by inline phrasing rather than a separate warning.
- The SaO2 criterion specifies "< 95% on room air"; the label clarifies the room-air condition so supplemental-O2 readings are not mis-applied.
- The estrogen criterion captures exogenous estrogen (OCP, HRT) per the source; pregnancy is excluded from PERC eligibility in the source text and the tile UI carries this caveat in the helper text.

## A11y / keyboard notes
- Eight labeled checkboxes, Tab-reachable in source order. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
