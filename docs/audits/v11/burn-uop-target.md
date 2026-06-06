# v11 audit - burn-uop-target

- Auditor: CG
- Date: 2026-06-06 (spec-v61).
- Citation re-verified against: Pham 2008 ABA burn-shock resuscitation (J Burn Care Res 2008;29:257-266).

lib/clinical-v7.js burnUopTarget() — target UOP = weight x rate (adult 0.5, peds 1, electrical 1-1.5 mL/kg/hr).

## Boundary examples added
- See test/unit/burn-uop-target.test.js (>=3 boundary cases, including the zero-denominator/null fallback and the impossible-input RangeError).

## Cross-implementation differential
- Formula/threshold values transcribed from the cited source; spot-checked against an independent hand calculation; PASS.

## Edge-input handling notes
- Inputs validated via lib/num.js num(); out-of-range/non-finite throws TypeError/RangeError and is caught by the renderer safe() wrapper. Every division guards its denominator -> null -> fmt() fallback. No NaN/Infinity/undefined reaches the DOM (spec-v53 §3 / spec-v59 §2.6 object-aware fuzz). Physiologic inputs surface a boundsAdvisory() note when frankly implausible (spec-v59 §2.5).

## A11y / keyboard notes
- Labeled inputs (label for=), aria-live results, select/checkbox where applicable. test:a11y clean.

## Defects opened

- none

## Status
- PASS
