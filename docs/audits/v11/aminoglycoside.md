# v11 audit - aminoglycoside

- Auditor: CG
- Date: 2026-06-06 (spec-v56).
- Citation re-verified against: Nicolau DP, et al. Antimicrob Agents Chemother 1995;39(3):650-655 (Hartford extended-interval aminoglycoside).

lib/medication-v5.js aminoglycoside() computes the extended-interval dose (gent/tobra 7 mg/kg, amikacin 15 mg/kg) and sets the starting interval from CrCl (q24 >=60, q36 40-59, q48 20-39). The proprietary Hartford concentration-time graph is NOT reproduced (spec-v11 correctness floor, same discipline as the v55 ldl-calc substitution); the random level is referred to the institution's printed nomogram. REFUSES dialysis / CrCl <20.

## Boundary examples added
- gentamicin 70 kg CrCl 80: 490 mg q24h.
- amikacin 60 kg CrCl 90: 900 mg.
- CrCl 50 -> q36h; CrCl 30 -> q48h.
- dialysis or CrCl <20: throws (validity refusal).

## Cross-implementation differential
- Hand-calc 70x7=490. Sophie 490. PASS. Interval bands match published CrCl thresholds.

## Edge-input handling notes
- Refusal path throws RangeError surfaced by the renderer safe() wrapper as a plain message, never a fabricated zone.

## A11y / keyboard notes
- Labeled inputs (label for=), aria-live results, select/checkbox where applicable. test:a11y clean.

## Defects opened

- none

## Status
- PASS
