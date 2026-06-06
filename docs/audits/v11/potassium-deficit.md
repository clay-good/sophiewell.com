# v11 audit - potassium-deficit

- Auditor: CG
- Date: 2026-06-06 (spec-v61).
- Citation re-verified against: Kruse & Carlson 1990 (Arch Intern Med 1990;150:613-617).

lib/clinical-v7.js potassiumDeficit() — deficit ~ (target - serumK) x 100 mEq; coarse planning estimate with repletion-rate caveats.

## Boundary examples added
- See test/unit/potassium-deficit.test.js (>=3 boundary cases, including the zero-denominator/null fallback and the impossible-input RangeError).

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
