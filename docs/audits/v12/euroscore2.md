# v12 audit - euroscore2

- Auditor: CG
- Date: 2026-06-18
- Citation re-verified against: Nashef SAM, Roques F, Sharples LD, et al. Eur J Cardiothorac Surg. 2012;41(4):734-744.

`lib/vascular-v105.js euroScore2()` computes predicted in-hospital cardiac-surgery
mortality via the logistic model e^y / (1 + e^y), y = -5.324537 + sum of the
Nashef 2012 Table 6 multivariate coefficients. Class A (fixed 2012 coefficients).

## Boundary worked examples added
- published worked example -> y = -2.126358, mortality 10.66% (70yo dialysis-
  dependent woman, insulin diabetes, COPD, NYHA III, CCS-4, poor LV, recent MI,
  isolated elective CABG).
- low-risk baseline 60yo male elective isolated CABG -> 0.5%.
- age term uses max(1, age-59): all ages <= 60 map to x = 1; 61 > 60.
- dialysis coefficient (0.6421508) is LOWER than CrCl <= 50 (0.8592256) -- a
  published feature of the model, reproduced verbatim, asserted by a test.
- blank age -> valid:false (no probability from NaN).
- extreme all-positive input stays bounded in [0, 100]% (exponent clamped [-40, 40]).
- fuzz: 18-field object-aware matrix, no non-finite leak.

## Cross-implementation differential
- Reference: the Nashef 2012 EJCTS Table 6 multivariate coefficients, RE-FETCHED
  (never recalled) and cross-verified across two independent sources (the official
  EJCTS PDF and the mdapp.co reproduction); 30/30 coefficients identical.
- CRITICAL CATCH: the spec-v105 §2.4 prose carried age coefficient 0.0666354, which
  is the legacy EuroSCORE *I* value. The EuroSCORE *II* multivariate age coefficient
  is 0.0285181 (Nashef 2012 Table 6). The implementation uses 0.0285181 and
  reproduces the published worked example exactly; the spec figure was a recall
  error and is documented here per the spec-v97 "source governs" rule. PASS.

## Edge-input handling notes
- pos() guards age (required); categorical selects key compiled coefficient blocks
  via hasOwnProperty, defaulting an unknown key to 0 rather than reading undefined;
  the logistic exponent is clamped before exp() so an extreme input cannot overflow.

## A11y / keyboard notes
- Labeled inputs and selects; output aria-live="polite". 320px sweep passes with no
  horizontal scroll. Preoperative mortality estimate, not an operability verdict.

## Defects opened
- none (the spec age-coefficient recall error is documented above, not a code defect).

## Status
- PASS
