# v12 audit - rutgeerts

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: Rutgeerts P, Geboes K, Vantrappen G, et al. Gastroenterology. 1990;99(4):956-963 (i-grade definitions and the ≥ i2 recurrence threshold cross-verified against IBD-endoscopy references; ≥ 2 sources, spec-v97).

`lib/oneformula-v167.js rutgeerts()` computes the Rutgeerts Score. Group G, Class A.

## Source-governance notes
- i0 no lesions; i1 ≤5 aphthous lesions; i2 >5 aphthous lesions with normal mucosa between / skip areas / anastomosis-confined; i3 diffuse aphthous ileitis; i4 diffuse inflammation with large ulcers/nodules/stenosis.
- A grade ≥ i2 predicts clinical recurrence; i0–i1 is low risk.
- Deterministic input→grade mapping; every finding resolves to exactly one i-grade.

## Boundary worked examples added
- i2 predicts recurrence; i1→i2 transition (i1 low risk, i2 recurrence); every grade i0–i4 resolves; missing/invalid finding → valid:false.

## Edge-input handling notes
- single finding select required; the original i2 heterogeneity (modified i2a/i2b) noted in source-governance. Blank/non-finite inputs surface a complete-the-fields fallback; covered by the spec-v59 fuzz harness with zero non-finite leaks.

## A11y / keyboard notes
- One finding select; output aria-live. 320px sweep, no horizontal scroll.

## Defects opened
- none

## Status
- PASS
