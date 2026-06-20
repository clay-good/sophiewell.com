# v12 audit - stone-nephrolithometry

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Okhunov Z, et al. Urology. 2013;81(6):1154-1159 (PubMed 23540858; band structure from PMC4656797). Cross-read against validation studies; per-score stone-free percentages from a calculator reproduction are treated as indicative, not quoted as exact.

`lib/uro-v131.js stoneNephrolithometry()` sums the five S.T.O.N.E. components to a 5-13 PCNL complexity score. Class A (journal+author citation - no docs/citation-staleness.md row).

## Source-governance / scoring note
- This is the ORIGINAL Okhunov 2013 PCNL AREA version (total 5-13), NOT the later URS adaptation that scores size by diameter and topography by ureteral location (total 5-15). The tile computes stone area = length x width (mm^2): 0-399 = 1, 400-799 = 2, 800-1599 = 3, >=1600 = 4.
- T tract (skin-to-stone mm): <=100 = 1, >100 = 2. O obstruction: none/mild = 1, moderate/severe = 2. N involved calices: 1-2 = 1, 3 = 2, full staghorn = 3. E essence/density: <=950 HU = 1, >950 = 2.
- A HIGHER total = a LOWER PCNL stone-free likelihood / a more complex case. Tiers low 5-6 / moderate 7-8 / high >=9 (the per-score stone-free percentage curve is reported only approximately by the source, so it is framed as a range, not quoted as an exact number).

## Boundary worked examples added
- worked total: a 20x20 mm stone -> area 400 (size 2), total 6, low complexity.
- minimum 5; size-area band steps at 400 / 800 / 1600 mm^2; a staghorn case reaching the maximum 13 (high).
- blank measurement (no HU), zero dimension, or out-of-range obstruction (3) -> valid:false; scalar -> valid:false.

## Edge-input handling notes
- length/width/tract/HU validated positive; obstruction in [1,2], calices in [1,3]. abnormal = total >= 9.

## A11y / keyboard notes
- Four number inputs + two labeled selects; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
