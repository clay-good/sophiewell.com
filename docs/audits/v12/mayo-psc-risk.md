# v12 audit - mayo-psc-risk

- Auditor: CG
- Date: 2026-07-02
- Citation re-verified against: Kim WR, et al. Mayo Clin Proc. 2000;75(7):688-694.

`lib/liver-v196.js mayoPscRisk()` implements the spec-v193/198 Advanced Specialist Quantitation
instrument. Every point weight, coefficient, and band threshold was re-fetched and
cross-verified against >= 2 independent open sources at implementation (spec-v97);
the compute routes through lib/num.js and is finite-guarded. Decision support only,
never an order (spec-v11 sec 5.3).

## Boundary worked examples added
- age 55, bili 5, alb 3.0, AST 120, variceal -> R 3.82 (high).
- >= 3 worked examples in test/unit/mayo-psc-risk.test.js exercise the band crossings and guards.
- fuzz: covered by test/unit/fuzz-tools.test.js MODULES; no non-finite leak.

## Cross-implementation differential
- R = 0.03*age+0.54*ln(bili)+0.54*ln(AST)+1.24*bleed-0.84*alb verified against the primary; bilirubin/AST guarded > 0 before the logs. PASS.

## Edge-input handling notes
- Missing / non-positive / out-of-range inputs return a surfaced complete-the-fields
  fallback (valid:false); zero-denominator and log-domain edges are guarded.

## A11y / keyboard notes
- Every input carries a real <label for>; output aria-live="polite". The 320px sweep
  passes with no horizontal scroll. Risk/prognosis stratification, not an order.

## Defects opened
- none

## Status
- PASS
