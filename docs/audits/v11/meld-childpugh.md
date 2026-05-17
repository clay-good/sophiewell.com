# v11 audit - MELD-3.0 / Child-Pugh (`meld-childpugh`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: Kim WR, Mannalithara A, Heimbach JK, et al. *MELD 3.0: The Model for End-Stage Liver Disease Updated for the Modern Era.* Gastroenterology. 2021;161(6):1887-1895. Pugh RNH, Murray-Lyon IM, Dawson JL, et al. *Transection of the oesophagus for bleeding oesophageal varices.* Br J Surg. 1973;60(8):646-649 (Child-Pugh, originally Child-Turcotte-Pugh).

MELD-3.0 formula verified literal-by-literal against Kim 2021 Methods:
`MELD 3.0 = 1.33*(female) + 4.56*ln(bili) + 0.82*(137-Na) − 0.24*(137-Na)*ln(bili) + 9.09*ln(INR) + 11.14*ln(Cr) + 1.85*(3.5-alb) − 1.83*(3.5-alb)*ln(Cr) + 6`. Clamps: bilirubin floor 1, INR floor 1, creatinine 1.0-3.0 (3.0 if hemodialysis ≥ 2× in past week), sodium 125-137, albumin 1.5-3.5. All implemented identically in `lib/scoring-v4.js meld30`.

## Boundary examples added
MELD-3.0:
- low: bili=1.0, INR=1.0, Cr=1.0, Na=137, alb=3.5, sex M, no dialysis -> every term collapses to 0 except the +6 anchor -> 6.
- mid: META example (bili=2.0, INR=1.5, Cr=1.3, Na=135, alb=3.0, sex M, no dialysis) -> 17.76 -> rounds to 18. (META example text reads "~17" which is the hedged framing; the precise computed value is 17.76. Not a defect; the example narrative is approximate by design.)
- high: bili=10.0, INR=3.0, Cr=4.0 (clamped to 3.0), Na=125, alb=1.5, sex F, no dialysis -> 42.94 -> rounds to 43.

Kim 2021 published worked example (Table 4): bili=3.2, INR=1.5, Cr=1.6, Na=132, alb=2.8, female -> MELD 3.0 = 25. Hand-traced through `meld30`: 1.33 + 5.304 + 4.10 − 1.396 + 3.686 + 5.236 + 1.295 − 0.602 + 6 = 24.95 -> rounds to 25. Matches Kim 2021.

Child-Pugh (5 components, each 1-3; A 5-6, B 7-9, C 10-15):
- low (Class A): bili=1, alb=4, INR=1, ascites=none, enceph=none -> 1+1+1+1+1 = 5, Class A.
- mid (Class B): bili=2.5, alb=3.0, INR=1.8, ascites=mild, enceph=none -> 2+2+2+2+1 = 9, Class B.
- high (Class C): bili=4, alb=2.5, INR=3, ascites=severe, enceph=grade3-4 -> 3+3+3+3+3 = 15, Class C.

## Cross-implementation differential
- Reference implementation: Kim 2021 Table 4 worked example.
- Test case: bili=3.2, INR=1.5, Cr=1.6, Na=132, alb=2.8, female.
- Sophie result: 25.
- Reference result: 25 (Kim 2021).
- Delta: 0%. PASS.

## Edge-input handling notes
- Every lab input is clamped to its approved range before entering the formula; an entered Na of 100 is clamped to 125, an entered Cr of 5 is clamped to 3.0. PASS.
- The "Hemodialysis x2 in past week" checkbox forces Cr to 3.0 regardless of the entered Cr, matching the OPTN MELD-Na exception that Kim 2021 retains in MELD-3.0. PASS.
- Child-Pugh shares the MELD inputs for bilirubin, albumin, and INR; the ascites and encephalopathy selects are closed lists with the three Pugh-defined categories. PASS.
- Default field values (bili=1.0, INR=1.0, Cr=1.0, Na=137, alb=3.5) produce a deliberately benign baseline (MELD 6) so the example is in-range rather than alarming. PASS.

## A11y / keyboard notes
- Five number inputs + two selects + one checkbox for MELD, two selects for Child-Pugh; all label-bound and Tab-reachable. Output region `aria-live="polite"`. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
