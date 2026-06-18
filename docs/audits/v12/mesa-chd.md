# v12 audit - mesa-chd

- Auditor: CG
- Date: 2026-06-18
- Citation re-verified against: McClelland RL, Jorgensen NW, Budoff M, et al. J Am Coll Cardiol. 2015;66(15):1643-1653.

`lib/cvrisk-v103.js mesaChd()` is the MESA 10-year CHD risk model with and without coronary-artery calcium. It is a penalized Cox on raw (uncentered) traditional factors in mg/dL; the with-CAC model adds 0.2743 x ln(Agatston + 1). White is the reference race. Risk = 1 - S0^exp(sum beta*x) with S0 = 0.99963 (no CAC) or 0.99833 (with CAC). Coefficients re-fetched + cross-verified (the CVrisk R package score_coef.R, verbatim-abstracted from the paper's Table 2; baseline survivals + CAC coefficient corroborated by independent calculators). Class A.

## Boundary worked examples added
- a 60yo White man, TC 200, HDL 50 mg/dL, SBP 125, no other factors scores 4.86% without CAC.
- an Agatston of 100 raises the with-CAC estimate to 7.34% (the calcium refinement is visible); a CAC of 0 lowers it below the no-CAC figure.
- an unknown race falls back to White (reference).
- fuzz: an extreme CAC stays finite and in [0,100].

## Cross-implementation differential
- Reference: the McClelland 2015 with/without-CAC beta sets and baseline survivals (CVrisk reproduction). Match. PASS.

## Edge-input handling notes
- Inputs clamped to plausible domains; ln(CAC+1) is domain-guarded (CAC >= 0); the exponent clamps for overflow; a blank required input surfaces valid:false. The CVrisk [1,30]% display clamp is a package convention and is NOT applied -- the raw published probability is reported, clamped only to [0,100]. Fuzz harness covers the module.

## A11y / keyboard notes
- Labeled inputs and selects; output aria-live="polite". 320px sweep passes with no horizontal scroll. Cross-links ascvd / prevent.

## Defects opened
- none

## Status
- PASS
