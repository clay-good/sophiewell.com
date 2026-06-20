# v12 audit - psa-doubling-time

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Pound CR, et al. JAMA. 1999;281(17):1591-1597. Cross-read against the MSKCC PSADT nomogram and StatPearls NBK557495 (log-linear two-point form).

`lib/uro-v130.js psaDoublingTime()` computes PSADT = ln(2) × T / (ln(later PSA) − ln(earlier PSA)), T in months — the two-point reduction of the log-linear regression. Class A (journal+author citation — no docs/citation-staleness.md row).

## Source-governance / rising-PSA guard
- The doubling time is undefined for a stable or falling PSA (the denominator is zero or
  negative). The function detects later ≤ earlier and returns rising:false with a plain
  "PSA is not rising" band and dt:null, rather than a NaN/Infinity or a negative time.
- Aggressive-disease thresholds (< 12 months more aggressive, < 3 months very aggressive)
  are reported as the source's framing, not management.

## Boundary worked examples added
- 4 → 8 over 6 months → 6.0 months (a true doubling; ln2 cancels — flagged aggressive).
- 4 → 5 over 24 months → 74.6 months (not flagged).
- 5 → 5 (and 5 → 4) → rising:false, dt:null, not flagged.
- blank field → valid:false; scalar → valid:false.

## Edge-input handling notes
- Both PSA values and the interval must be positive; dt rounded to one decimal; band
  classified on the rounded dt. Uses Math.LN2 and Math.log for the closed-form solution.

## A11y / keyboard notes
- Three number inputs each labeled; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
