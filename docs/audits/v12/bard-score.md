# v12 audit - bard-score

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Harrison SA, Oliver D, Arnold HL, et al. Development and validation of a simple NAFLD clinical scoring system for identifying patients without advanced disease. Gut. 2008;57(10):1441-1447 (re-fetched; point weights and interpretation cross-read across MDCalc and the PMC12859260 / PMC10878060 validations).

`lib/hep-v124.js bardScore()` sums BMI >= 28 (+1), AST/ALT ratio >= 0.8 (+2), and
diabetes (+1) for a total 0-4. 2-4 leaves advanced fibrosis in play (odds ratio ~17);
0-1 rules it out (NPV ~96%). Class A (fixed weights; journal+author citation, no
ISSUER_PATTERN trip -- no docs/citation-staleness.md row).

## Boundary worked examples added
- all components (BMI 30, AST/ALT 1.13, diabetes) -> 4/4, not ruled out.
- low BMI, low ratio, no diabetes -> 0/4, ruled out.
- the AST/ALT ratio weight is 2 -> ratio alone reaches the 2-4 band.
- total clamps 0-4 and tolerates missing AST/ALT (ratio reported null).
- scalar fuzz arg -> valid 0/4, never NaN.

## Cross-implementation differential
- Reference: weights BMI=1, AST/ALT ratio=2, diabetes=1 and thresholds (BMI >= 28,
  ratio >= 0.8) confirmed; the 2-4 / 0-1 interpretation (OR ~17, NPV ~96%) confirmed.
  Match. PASS.

## Edge-input handling notes
- BMI/AST/ALT number inputs + a diabetes checkbox; ratio computed only when both AST
  and ALT are positive; total clamped 0-4. A scalar fuzz arg -> valid 0/4.

## A11y / keyboard notes
- Three labeled number inputs + one labeled checkbox; output aria-live="polite". 320px
  sweep, no hscroll.

## Defects opened
- none
