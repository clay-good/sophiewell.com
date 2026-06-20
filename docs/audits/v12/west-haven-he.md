# v12 audit - west-haven-he

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Conn HO, Leevy CM, Vlahcevic ZR, et al. Gastroenterology. 1977;72(4 Pt 1):573-583 (re-fetched; grade descriptions cross-read across StatPearls NBK430869 and the AASLD/EASL nomenclature consensus PMC4442858).

`lib/hep-v125.js westHavenHe()` maps a single 0-4 selection to its grade description:
0 minimal, 1 trivial unawareness + impaired addition, 2 lethargy + disorientation to
time + asterixis, 3 somnolence to semi-stupor + gross disorientation, 4 coma. Grades 2
and above are overt encephalopathy. Class A (fixed 1977 definition; journal+author
citation, no ISSUER_PATTERN trip -- no docs/citation-staleness.md row).

## Boundary worked examples added
- grade 0 -> minimal, not overt.
- grade 1 -> not overt.
- grade 2 band-flip -> overt encephalopathy.
- grade 4 -> coma.
- out-of-range / scalar clamps to 0-4, never throws.

## Cross-implementation differential
- Reference: the per-grade hallmark features match StatPearls and the AASLD/EASL
  consensus (asterixis present at grades 1-2, absent by grade 4; bizarre behavior at
  grade 3). An ordinal classification, not a sum. Match. PASS.

## Edge-input handling notes
- One select clamped 0-4; an out-of-range or scalar input falls back to a valid grade,
  never throws.

## A11y / keyboard notes
- One labeled select; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
