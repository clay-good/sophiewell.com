# v11 audit - PSI / PORT (pneumonia severity) (`psi`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: Fine MJ, Auble TE, Yealy DM, et al. *A prediction rule to identify low-risk patients with community-acquired pneumonia.* N Engl J Med. 1997;336(4):243-250.

Two-step rule per Fine 1997 Figure 1 + Table 4. Step 1 (Class I): age <= 50, no comorbidity, no exam abnormality -> Class I (low risk). Step 2 (Classes II-V): sum points from age (age in years for men; age-10 for women), nursing-home resident +10, neoplastic disease +30, liver disease +20, CHF +10, cerebrovascular disease +10, renal disease +10, altered mental status +20, RR >= 30 +20, SBP < 90 +20, temp < 35 or >= 40 +15, HR >= 125 +10, pH < 7.35 +30, BUN >= 30 +20, Na < 130 +20, glucose >= 250 +10, Hct < 30 +10, PaO2 < 60 +10, pleural effusion +10. Class thresholds per Fine 1997 Table 4: II <= 70, III 71-90, IV 91-130, V > 130. 30-day mortality per Fine 1997 Table 5: I 0.1%, II 0.6%, III 0.9-2.8%, IV 8.2-9.3%, V 27-31.1%. `lib/scoring-v4.js psi()` implements every point assignment + the Class I short-circuit verbatim.

## Boundary examples added
- low (Class I): age 40, male, no comorbidities, no exam findings, no labs entered -> 0 points and age <= 50 -> Class I (0.1% mortality).
- mid: META example (age 70, male, RR >= 30 alone among extras) -> 70 + 20 = 90 -> Class III (short observation typically considered; 0.9-2.8% 30-day mortality).
- high (Class V): age 85, male, nursing home, neoplasm, altered mental status, RR >= 30, SBP < 90, pH 7.25, BUN 50, Na 125, pleural effusion -> 85 + 10 + 30 + 20 + 20 + 20 + 30 + 20 + 20 + 10 = 265 -> Class V (27-31.1% mortality).

Class-boundary edges:
- Age 55, female, no other findings -> 55 - 10 = 45 -> not Class I (age > 50 for women uses the age-10 transform, but the Class I criterion checks raw age <= 50 per Fine 1997). Implementation correctly applies the female -10 only at the points-sum stage. Class II (45 <= 70). PASS.
- Age 50, male, no comorbidities -> Class I.
- Age 51, male, no comorbidities -> points 51 -> Class II.

## Cross-implementation differential
- Reference implementation: Fine 1997 NEJM Table 4 (point assignments) + Table 5 (mortality bands).
- Test case: META example (age 70, M, RR 30).
- Sophie result: 90, Class III.
- Reference result: 70 (age) + 20 (RR >= 30) = 90 -> Class III per Fine 1997 Table 4 (71-90 band).
- Delta: 0%. PASS.

## Edge-input handling notes
- All non-age numeric inputs (temp, pH, BUN, Na, glucose, Hct, PaO2) accept `null` and skip their contribution if not entered, matching Fine 1997's "if available" framing for the lab subscore. The renderer makes this explicit in helper text so users know unentered labs don't penalize the patient.
- The age input is required; sex defaults to 'M'. If sex is 'F', the implementation subtracts 10 from age via `Math.max(0, age - 10)`, never going below 0 (correct: a 5-year-old female would not give a negative contribution).
- The "Reference points-only implementation; class V advisory" advisory in `META.psi.citation` flags that this is the original Fine 1997 derivation, not the post-2016 ATS/IDSA disposition rule that integrates PSI with other indices for ICU admission. The class string includes the recommended disposition (outpatient / observation / admit) per the source's recommended use.

## A11y / keyboard notes
- Two number inputs (age + sex select) + ~17 checkboxes / numeric labs, all label-bound and Tab-reachable in source order. The output region is `aria-live="polite"`. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
