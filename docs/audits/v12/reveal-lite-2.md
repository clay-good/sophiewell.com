# v12 audit - reveal-lite-2

- Auditor: CG
- Date: 2026-06-19
- Citation re-verified against: Benza RL, Kanwar MK, Raina A, et al. Development and validation of an abridged version of the REVEAL 2.0 risk score calculator, REVEAL Lite 2. Chest. 2021;159(1):337-346 (re-fetched; cross-read with the PMC full text Table 1, PMID 32882243, and MDCalc).

`lib/pulmnod-v115.js revealLite2()` computes the abridged all-noninvasive PAH
risk score: base 6, then renal insufficiency (eGFR < 60 = +1), WHO/NYHA FC
(I = -1, II = 0, III = +1, IV = +2), systolic BP (< 110 = +1), heart rate
(> 96 = +1), 6MWD (>= 440 = -2, 320 to < 440 = -1, 165 to < 320 = 0, < 165 = +1),
and a BNP/NT-proBNP band (-2 / 0 / +1 / +2); total 1-14. Bands low 1-5 (2.9%
1-year mortality), intermediate 6-7 (7.1%), high >= 8 (25.1%). Class A.

## Boundary worked examples added
- eGFR 72, FC III, SBP 104, HR 88, 6MWD 300, NT-proBNP high -> 10 (high, 25.1%).
- low anchor: eGFR 60, FC II, SBP 110, HR 96, 6MWD 350, BNP mid -> 5 (low).
- band boundary: 5 low, 6 intermediate, 8 high.
- 6MWD bands: >= 440 -2, 320-440 -1, 165-320 0, < 165 +1.
- partial inputs render a complete-the-fields fallback.

## Cross-implementation differential
- Reference: the base of 6, the per-variable point weights, the 1-14 total
  range, and the 1-5 / 6-7 / >= 8 band cutoffs with 2.9 / 7.1 / 25.1% 1-year
  mortality were confirmed identical across the PMC primary full text and the
  CHEST abstract. The BNP +1 band exists only for BNP (200 to < 800), not
  NT-proBNP -- preserved in the band select. Match. PASS.

## Edge-input handling notes
- eGFR, SBP, HR, and 6MWD are required non-negative numbers; WHO class and the
  BNP band are selects. A blank required number yields a valid:false fallback.
  A scalar fuzz arg yields a fallback.

## A11y / keyboard notes
- Four labeled number inputs + two labeled selects; output aria-live="polite".
  320px sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
