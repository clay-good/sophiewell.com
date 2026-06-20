# v12 audit - warfarin-iwpc

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: International Warfarin Pharmacogenetics Consortium; Klein TE, et al. N Engl J Med. 2009;360(8):753-764, supplementary appendix S1e. Coefficient block extracted from the NEJM supplement text itself (the primary source), cross-read against the CPIC 2017 warfarin guideline; both agree on the pharmacogenetic equation.

`lib/warfarin-v133.js warfarinIwpc()` evaluates the published IWPC pharmacogenetic linear model, which regresses the square root of the weekly maintenance dose, then squares the root to return mg/week (and divides by 7 for mg/day). Class A (fixed 2009 coefficients; journal+author citation - no docs/citation-staleness.md row).

## Source-governance / coefficient note
- sqrt(weekly mg) = 5.6044 - 0.2614*decades + 0.0087*height(cm) + 0.0128*weight(kg) + VKORC1 + CYP2C9 + race + 1.1816*inducer - 0.5503*amiodarone; decades = floor(age/10).
- VKORC1 (-1639 G>A): G/G = 0 (reference), A/G = -0.8677, A/A = -1.6974, unknown = -0.4854.
- CYP2C9: *1/*1 = 0 (reference), *1/*2 = -0.5211, *1/*3 = -0.9357, *2/*2 = -1.0616, *2/*3 = -1.9206, *3/*3 = -2.3312, unknown = -0.2188.
- Race: White = 0 (reference), Asian = -0.1092, Black/African American = -0.2760, missing/mixed = -0.1032.
- The height coefficient is 0.0087 (the PHARMACOGENETIC model), NOT 0.0118 (the clinical model) - the classic cross-wire; the unknown-genotype imputation terms are retained, not dropped.

## Boundary worked examples added
- Reference genotype (age 65, 170 cm, 70 kg, G/G, *1/*1, White, no inducer, no amiodarone): sqrt = 6.411, dose = 41.1 mg/week (~5.9 mg/day). A sensitive genotype (A/A + *3/*3 + amiodarone) drops well below the reference; the enzyme inducer raises the dose vs the same patient without it; the unknown-genotype terms compute a finite dose.

## Edge-input handling notes
- Genotype and race are enumerated dropdown keys; a blank or unrecognized key surfaces valid:false rather than silently dropping a coefficient. A non-positive square root (possible only for extreme/fuzzed inputs) surfaces the fallback rather than squaring into a spurious dose. Joined the spec-v59 fuzz harness (zero non-finite leaks) with the sqrt-then-square step exercised.

## A11y / keyboard notes
- Three labeled number inputs + five labeled selects; output aria-live="polite". 320px sweep, no hscroll; renders the spec-v100 §2 clause-5 high-stakes second-check caveat in the output.

## Defects opened
- none
