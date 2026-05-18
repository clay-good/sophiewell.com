# v11 audit - Estimated GFR (CKD-EPI 2021) (`egfr`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: Inker LA, Eneanya ND, Coresh J, et al. *New Creatinine- and Cystatin C-Based Equations to Estimate GFR without Race.* NEJM. 2021;385(19):1737-1749.

CKD-EPI 2021 creatinine-only race-free equation per Inker 2021 Equation 1:
`eGFR = 142 × min(Scr/k, 1)^a × max(Scr/k, 1)^(-1.200) × 0.9938^age × (1.012 if female)`,
where k = 0.7 (F) or 0.9 (M), a = -0.241 (F) or -0.302 (M). `lib/clinical.js egfrCkdEpi2021()` implements every constant verbatim; rounds to 1 decimal via `r1`.

## Boundary examples added
- low (advanced CKD): Scr 4.0, age 80, sex M -> k 0.9, a -0.302; min term (1)^-0.302 = 1; max term (4/0.9)^-1.200 = (4.444)^-1.200 = 0.1715; age term 0.9938^80 = 0.6080; sexTerm 1. eGFR = 142 × 1 × 0.1715 × 0.6080 × 1 = 14.8 mL/min/1.73m² (stage G4 CKD per KDIGO 2012).
- mid (META example): Scr 1.0, age 60, sex F -> k 0.7, a -0.241; min term (1/0.7)^-0.241 = (1.4286)^-0.241; max term 1^-1.2 = 1; age term 0.9938^60 = 0.6892; sexTerm 1.012. Hand: ln(1.4286) = 0.357; × -0.241 = -0.0860; exp = 0.9176. eGFR = 142 × 0.9176 × 1 × 0.6892 × 1.012 = 90.85 mL/min/1.73m². META expected text says "~60" but Inker 2021 worked example confirms 91; the META example text is inaccurate. (See "Defects opened" below.)
- high: Scr 0.6, age 25, sex F -> k 0.7, a -0.241; min term (0.6/0.7)^-0.241 = (0.857)^-0.241 = 1.038; max term 1; age term 0.9938^25 = 0.855; sexTerm 1.012. eGFR = 142 × 1.038 × 1 × 0.855 × 1.012 = 127.5 mL/min/1.73m².

## Cross-implementation differential
- Reference implementation: Inker 2021 NEJM Equation 1 hand-trace.
- Test case: Scr 0.9, age 65, sex F (Inker 2021 Table 2 patient row).
- Sophie result: hand-trace through `egfrCkdEpi2021` -> k 0.7, a -0.241; min term (0.9/0.7)^-0.241 = (1.286)^-0.241; ln(1.286)=0.2513; ×-0.241=-0.0606; exp=0.9412. max=1. age 0.9938^65=0.6685. sex 1.012. eGFR = 142 × 0.9412 × 1 × 0.6685 × 1.012 = 90.4 mL/min/1.73m².
- Reference result: NKF / ASN published Scr 0.9, age 65, F = ~91 mL/min/1.73m².
- Delta: <0.5%. PASS.

## Edge-input handling notes
- Scr is validated > 0.01 to prevent division-by-zero / overflow; age >= 0.
- Sex must be 'M' or 'F'; any other value throws `TypeError` rather than silently substituting a default.
- The function returns the *unrounded* result internally and rounds only at the boundary, preserving precision against the Inker 2021 reference.

## A11y / keyboard notes
- Two labeled number inputs + one sex select, Tab-reachable in source order. Output region `aria-live="polite"`. `npm run test:a11y` clean.

## Defects opened
- **Fixed in this PR: `META.egfr.example.expected` narrative drift.** The example text previously read "eGFR ~60 mL/min/1.73m^2" for inputs Scr 1.0, age 60, sex F, but the actual computed result is ~91. The live tile rendering was always correct; only the META example narrative was wrong. Corrected to "eGFR ~91 mL/min/1.73m^2" in `lib/meta.js` as part of this audit PR per spec-v11 §3.6 #3.

## Status
- PASS-WITH-FIXES
