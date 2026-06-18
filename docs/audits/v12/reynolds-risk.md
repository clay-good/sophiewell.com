# v12 audit - reynolds-risk

- Auditor: CG
- Date: 2026-06-18
- Citation re-verified against: Ridker PM, Buring JE, Rifai N, Cook NR. JAMA. 2007;297(6):611-619 (women); Ridker PM, et al. Circulation. 2008;118(22):2243-2251 (men).

`lib/cvrisk-v103.js reynoldsRisk()` is the Reynolds Risk Score, adding high-sensitivity CRP (mg/L) and parental history of premature MI to the traditional factors (mg/dL cholesterol). The women's model uses linear age plus an HbA1c term for diabetics; the men's model uses ln(age) and was derived in non-diabetics (no HbA1c term -- a diabetic man is flagged as outside the derivation population). Coefficients re-fetched + cross-verified against the primary papers (the men's baseline survival 0.8990 / centering 33.097 confirmed from the Circulation 2008 Appendix C; a previously-circulated 0.9402 baseline was rejected as a transcription error). Class A.

## Boundary worked examples added
- women: a 52yo, SBP 125, TC 212, HDL 52, hsCRP 3.0 scores 1.3%; a 60yo smoker with family history, SBP 140, TC 260, HDL 45, hsCRP 4.5 scores 18.9%.
- men: a 50yo, SBP 125, TC 200, HDL 45, hsCRP 1.0 scores 3.2%; a 65yo smoker with family history, SBP 145, TC 240, HDL 38, hsCRP 5.0 scores 46.2%.
- hsCRP drives the risk upward at a fixed profile.
- a diabetic man is flagged; fuzz: extreme inputs clamp risk to [0,100].

## Cross-implementation differential
- Reference: the Ridker 2007 women's and 2008 men's published coefficients, baseline survivals, and centering constants. All four fixtures reproduce. PASS.

## Edge-input handling notes
- Every ln() term guards a positive domain (a non-positive hsCRP / SBP / cholesterol or blank input surfaces valid:false); inputs clamped; the exponent clamps for overflow. Fuzz harness covers the module.

## A11y / keyboard notes
- Labeled inputs and selects; output aria-live="polite". 320px sweep passes with no horizontal scroll. Cross-links ascvd / prevent.

## Defects opened
- none

## Status
- PASS
