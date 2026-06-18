# v12 audit - framingham-cvd

- Auditor: CG
- Date: 2026-06-18
- Citation re-verified against: D'Agostino RB Sr, Vasan RS, Pencina MJ, et al. Circulation. 2008;117(6):743-753.

`lib/cvrisk-v103.js framinghamCvd()` is the Framingham general-CVD sex-specific Cox model on ln-transformed age, total and HDL cholesterol (mg/dL), and systolic BP (treated coefficient when on antihypertensives), plus smoking and diabetes. Vascular age is computed in closed form: the age at which the published normal reference profile (TC 180, HDL 45, SBP 125 untreated, non-smoker, non-diabetic) yields the same 10-year risk. Coefficients re-fetched + cross-verified (the official Framingham site + the CVrisk R package; the paper's worked example reproduces). Class A.

## Boundary worked examples added
- the paper worked example reproduces: a 61yo woman, TC 230, HDL 47, SBP 124 untreated, non-smoker, non-diabetic scores 8.4% with vascular age 67.7 (paper: 8.6% / 68).
- a 55yo man, TC 213, HDL 50, SBP 120 scores 10.2% / vascular age 55.2.
- the treated-BP coefficient yields a higher risk than untreated at the same SBP.
- fuzz: extreme inputs clamp risk to [0,100] and keep the vascular age finite.

## Cross-implementation differential
- Reference: the D'Agostino 2008 sex-specific betas / baseline survivals / centering constants and the 180/45/125 vascular-age reference profile. Match. PASS.

## Edge-input handling notes
- Every ln() of a continuous predictor guards a positive domain (a non-positive or blank input surfaces valid:false); inputs clamped to plausible ranges; the exponent clamps for overflow; the vascular-age solve guards its logs and clamps the result to [20,120]. Fuzz harness covers the module.

## A11y / keyboard notes
- Labeled inputs and selects; output aria-live="polite". 320px sweep passes with no horizontal scroll. Cross-links ascvd / prevent.

## Defects opened
- none

## Status
- PASS
