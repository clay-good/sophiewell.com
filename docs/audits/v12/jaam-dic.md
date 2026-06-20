# v12 audit - jaam-dic

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Gando S, et al. Crit Care Med. 2006;34(3):625-631. Cross-read against secondary calculators; confirmed this is the 2006 REVISED criteria (fibrinogen removed, max 8), NOT the older max-10 fibrinogen form.

`lib/heme-v132.js jaamDic()` scores acute disseminated intravascular coagulation 0-8; DIC is diagnosed at >= 4. Class A (journal+author citation - no docs/citation-staleness.md row).

## Source-governance / scoring note
- SIRS >= 3 criteria = 1; platelet < 80 x10^9/L OR > 50% fall in 24 h = 3, else 80 to < 120 OR > 30% fall = 1; FDP >= 25 ug/mL = 3, 10 to < 25 = 1; PT ratio >= 1.2 = 1.
- The platelet limb takes the max of the absolute-count band and the 24-h relative-fall band; the fall band needs a prior count (optional input) and never penalizes a rising count.
- Secondary sources that show a fibrinogen term / max-10 are the older pre-revision criteria; the source governs (max 8).

## Boundary worked examples added
- Total crossing the >= 4 DIC threshold; absolute platelet bands (70/100/150); the 55% and 35% relative-fall lifts and a no-penalty rise; FDP bands and the max-8 case.

## Edge-input handling notes
- All required numerics finite-guarded; prior platelet optional. Any blank required field -> valid:false. abnormal = dic (total >= 4).

## A11y / keyboard notes
- One No/Yes select + four labeled number inputs (one optional); output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
