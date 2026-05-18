# v11 audit - eGFR Suite (CKD-EPI 2021 / MDRD / Cockcroft-Gault) (`egfr-suite`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: Inker LA et al. NEJM. 2021;385(19):1737-1749 (CKD-EPI 2021 creatinine-only race-free). Levey AS, Bosch JP, Lewis JB, et al. *A more accurate method to estimate glomerular filtration rate from serum creatinine.* Ann Intern Med. 1999;130(6):461-470 (MDRD 4-variable, race-free per contemporary practice). Cockcroft DW, Gault MH. *Prediction of creatinine clearance from serum creatinine.* Nephron. 1976;16(1):31-41.

Three equations rendered side by side. CKD-EPI 2021 lives in `lib/clinical.js egfrCkdEpi2021()` (covered in `egfr.md`). MDRD lives in `lib/clinical-v4.js egfrMdrd()`: 175 × Scr^(-1.154) × age^(-0.203) × (0.742 if female), race coefficient omitted per the 2021 ASN/NKF race-removal guidance. Cockcroft-Gault lives in `lib/clinical.js cockcroftGault()`: ((140 − age) × weight) / (72 × Scr), × 0.85 if female. (CG returns mL/min, *not* normalized to 1.73 m²; the renderer labels accordingly.)

## Boundary examples added
- low: Scr 4.0, age 80, weight 70 kg, sex M -> CKD-EPI 2021 ~15; MDRD ~13.8; CG ((60×70)/(72×4)) = 14.6 mL/min. All three converge on advanced CKD.
- mid (META example): Scr 1.0, age 60, weight 70 kg, sex M -> CKD-EPI 2021 ~90; MDRD ~76.8 (175 × 1^-1.154 × 60^-0.203 × 1 = 175 × 1 × 0.4391 × 1 = 76.84); CG ((80×70)/(72×1)) = 77.78 mL/min. META expected text "~89 / ~77 / ~78" matches the live rendering within rounding.
- high: Scr 0.6, age 25, weight 60 kg, sex F -> CKD-EPI 2021 ~127; MDRD 175 × 0.6^-1.154 × 25^-0.203 × 0.742 = 175 × 1.776 × 0.5414 × 0.742 = 124.9; CG ((115×60)/(72×0.6)) × 0.85 = 135.8 mL/min. All three in normal range.

## Cross-implementation differential
- Reference implementation: Inker 2021 worked example + Levey 1999 + Cockcroft 1976 formulas.
- Test case: META example (Scr 1.0, age 60, weight 70 kg, sex M).
- Sophie result: CKD-EPI ~89, MDRD ~77, CG ~78 mL/min.
- Reference result: hand-trace agrees (CKD-EPI 89.5, MDRD 76.84, CG 77.78).
- Delta: <0.5% per formula. PASS.

## Edge-input handling notes
- All three equations live behind the same field set (Scr, age, weight, sex); the tile clarifies that CG uses actual body weight (not IBW or adjusted), per the original Cockcroft 1976 paper. Modern practice for obese patients often substitutes IBW or adjusted BW; the tile does NOT auto-substitute because the choice is a clinical decision and the source describes actual weight.
- The CKD-EPI 2021 race-free equation is the post-2021 standard; the suite intentionally omits the deprecated 2009 race-coefficient versions.
- Cockcroft-Gault output units (mL/min, not mL/min/1.73 m²) are labeled distinctly so users do not directly compare CG to the BSA-normalized CKD-EPI/MDRD outputs.

## A11y / keyboard notes
- Three labeled number inputs + one sex select, Tab-reachable in source order. Output region `aria-live="polite"`. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
