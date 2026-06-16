# v12 audit - glasgow-imrie

- Auditor: CG
- Date: 2026-06-16
- Citation re-verified against: Blamey SL, Imrie CW, O'Neill J, et al. Prognostic factors in acute pancreatitis. Gut. 1984;25(12):1340-1346.

`lib/hepgi-v93.js glasgowImrie()` totals the eight PANCREAS items (one point each at 48 hours) and flags severe at >= 3, reporting how many of the eight items were assessed.

## Boundary worked examples added
- PaO2 55, age 60, urea 20, glucose 12 (4 of 8 met) -> 4, severe.
- 2 = not severe, 3 = severe (threshold).
- A two-item panel reports "2 of 8 items assessed (partial 48-hour panel)".
- All eight items met -> 8.

## Cross-implementation differential
- Reference: Blamey/Imrie 1984 eight-item point table and the >= 3 severe threshold. Match. PASS.

## Edge-input handling notes
- A blank item is "not assessed", not scored as zero; no items entered returns a surfaced guard. Fuzz harness covers the module, zero non-finite leaks.

## A11y / keyboard notes
- Eight labeled numeric inputs; output aria-live="polite" with a per-item met/not-met list. 320px sweep passes with no horizontal scroll.

## Defects opened
- none

## Status
- PASS
