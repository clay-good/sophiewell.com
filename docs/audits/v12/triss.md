# v12 audit - triss

- Auditor: CG
- Date: 2026-06-18
- Citation re-verified against: Boyd CR, Tolson MA, Copes WS. J Trauma. 1987;27(4):370-378 (TRISS method); MTOS revision coefficients (Champion HR, et al).

`lib/trauma-v108.js triss()` computes the probability of survival
Ps = 1/(1 + e^-b), b = b0 + b1*RTS + b2*ISS + b3*AgeIndex (AgeIndex 0 if age < 55,
1 if >= 55), selecting the blunt or penetrating coefficient set. The logistic
exponent is clamped to a finite range so an out-of-range input cannot leak a
probability from Infinity. Class A.

## Boundary worked examples added
- partial input (no age) -> complete-the-fields fallback.
- tile example: blunt, RTS 6, ISS 25, age 60 -> 65.8 percent.
- band flip: same inputs, penetrating set -> 45 percent (lower).
- age >= 55 applies the age penalty (AgeIndex 1).
- out-of-range RTS / ISS reject.
- overflow-safe: extreme age stays finite.

## Cross-implementation differential
- Reference: the blunt (b0 -1.2470, RTS 0.9544, ISS -0.0768, Age -1.9052) and
  penetrating (b0 -0.6029, RTS 1.1430, ISS -0.1516, Age -2.6676) coefficient sets
  re-fetched and cross-verified against multiple clinical references; these are the
  MTOS-1995 revision values MDCalc serves, not the literal 1987 paper's first set.
  The citation names both. Match. PASS.

## Edge-input handling notes
- RTS is the coded Revised Trauma Score (0 to 7.8408) produced by the live iss-rts
  tile; the tile consumes it rather than recomputing it. A population benchmark,
  not an individual prognosis -- the note says so.

## A11y / keyboard notes
- Labeled selects/number inputs; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
