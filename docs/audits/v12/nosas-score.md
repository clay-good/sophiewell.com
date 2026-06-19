# v12 audit - nosas-score

- Auditor: CG
- Date: 2026-06-19
- Citation re-verified against: Marti-Soler H, Hirotsu C, Marques-Vidal P, et al. Lancet Respir Med. 2016;4(9):742-748 (re-fetched; cross-read with the PubMed abstract PMID 27321086 and the Lancet Respiratory Medicine article listing).

`lib/pulm-v114.js nosasScore()` sums five items to a total of 0-17 -- neck > 40 cm
(4), BMI 25 to < 30 (3) or >= 30 (5, a single mutually-exclusive item), snoring
(2), age > 55 (4), male sex (2) -- and flags a score >= 8 as a high probability of
sleep-disordered breathing. Class A.

## Boundary worked examples added
- neck 42 + BMI 31 + age 58 + male = 15 -> high (>= 8).
- BMI is a single mutually-exclusive item (3 or 5, never additive).
- strict inequalities: neck > 40, age > 55 (40 and 55 do not score).
- high-risk threshold boundary at 7/8.
- partial input returns a complete-the-fields fallback.

## Cross-implementation differential
- Reference: the point values (neck > 40 = 4, BMI 25-<30 = 3, BMI >= 30 = 5,
  snoring = 2, age > 55 = 4, male = 2), the 0-17 range, and the >= 8 high-risk
  threshold are confirmed identical across the PubMed abstract and the Lancet
  listing. The BMI item is single-select (max legitimate total 17), and the
  inequalities are strict as published. Match. PASS.

## Edge-input handling notes
- three required numeric fields (neck, BMI, age); a blank renders the
  complete-the-fields fallback. snoring/male are booleans. The BMI bands guard
  against double-counting. Fuzz scalar args hit the fallback safely.

## A11y / keyboard notes
- Three labeled number inputs + two labeled checkboxes; output aria-live="polite".
  320px sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
