# v12 audit - nafld-fibrosis

- Auditor: CG
- Date: 2026-06-16
- Citation re-verified against: Angulo P, Hui JM, Marchesini G, et al. The NAFLD fibrosis score: a noninvasive system that identifies liver fibrosis in patients with NAFLD. Hepatology. 2007;45(4):846-854.

`lib/hepgi-v93.js nafldFibrosis()` computes NFS = -1.675 + 0.037*age + 0.094*BMI + 1.13*(IFG/DM) - 0.013*platelets - 0.66*albumin + 0.99*(AST/ALT) and maps it to the published bands.

## Boundary worked examples added
- age 60, BMI 30, IFG/DM, AST 60, ALT 40, platelets 200, albumin 4.0 -> NFS 0.74 -> advanced fibrosis (> 0.676).
- A low-risk profile lands below -1.455 (excludes advanced fibrosis, F0-F2).
- A between-cutoffs profile lands in the indeterminate zone.
- Zero/blank ALT -> surfaced valid:false guard (the AST/ALT term divides by ALT).

## Cross-implementation differential
- Reference: Angulo 2007 regression coefficients and the -1.455 / 0.676 cutoffs. Match. PASS.

## Edge-input handling notes
- ALT must be > 0; non-finite/zero inputs return the surfaced guard. The spec-v59 fuzz harness covers the module with zero non-finite leaks.

## A11y / keyboard notes
- Six labeled numeric inputs + one labeled yes/no <select>; output aria-live="polite". 320px sweep passes with no horizontal scroll.

## Defects opened
- none

## Status
- PASS
