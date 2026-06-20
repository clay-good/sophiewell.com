# v12 audit - peds-weight-est

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Advanced Paediatric Life Support: The Practical Approach, 6th ed. (Advanced Life Support Group), Wiley-Blackwell 2016; age-based weight formulas cross-checked with the roughlogic.com computePediatricWeight reference port.

`lib/ems-v149.js pedsWeightEst()` estimates body weight from age via the published
APLS age-band formulas: 0-12 months (months / 2) + 4 kg; 1-5 years (2 x years) + 8 kg;
6-12 years (3 x years) + 7 kg; a years input under 1 converts to months; over 12 years
computes (3 x years) + 7 with an adult-dosing flag. Class A (APLS is not in
ISSUER_PATTERN; the 6th edition is pinned -- no docs/citation-staleness.md row).

## Boundary worked examples added
- 5 yr -> 18 kg, (2 x years) + 8, 39.7 lb.
- 6 mo -> 7 kg, (months / 2) + 4.
- 10 yr -> 37 kg, (3 x years) + 7.
- both months and years -> months path wins (infant precedence).
- 13 yr -> 46 kg with the over-12 adult-dosing flag.
- no age / years 99 -> invalid prompt, no NaN.

## Cross-implementation differential
- Reference: roughlogic computePediatricWeight uses the identical APLS bands; the
  months path takes precedence when both are entered. Match. PASS.

## Edge-input handling notes
- Months outside 0-12 falls through to the years path; years outside 0-14 returns the
  complete-the-fields prompt. A scalar / non-object fuzz arg yields an invalid result,
  never a NaN. lb conversion stays finite across the fuzz matrix.

## A11y / keyboard notes
- Two labeled number inputs; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
