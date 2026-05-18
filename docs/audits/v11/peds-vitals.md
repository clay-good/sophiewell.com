# v11 audit - Pediatric Vital Signs by Age (`peds-vitals`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: AHA Pediatric Advanced Life Support (PALS) Provider Manual reference vital-sign ranges by age band (heart rate, respiratory rate, systolic BP). Bundled `data/clinical/peds-vitals.json` reference table matches the PALS age-stratified normal ranges.

## Shard integrity
- Lookup tile backed by `data/clinical/peds-vitals.json`. Verified via the standard reference-data verify pass; manifest hash matches operations.md.

## Boundary examples added
- Per spec-v11 §3.3 step 10, lookup tiles are audited by (a) shard integrity and (b) one authoritative lookup per category. Sampled coverage:
  - Neonate (<1 mo): HR 100-205 awake, RR 30-60, SBP >60. Matches PALS table. PASS.
  - Infant (1 mo - 1 yr): HR 100-180 awake, RR 30-53. PASS.
  - Toddler (1-3 yr): HR 98-140, RR 22-37, SBP 86-106. PASS.
  - Adolescent (12-15 yr): HR 60-100, RR 12-20, SBP 110-131. PASS.

## Cross-implementation differential
- N/A for lookup tile (no numeric formula). Cross-checked the bundled bands against the AHA PALS 2020 reference card and the Nelson Textbook of Pediatrics vital-sign appendix; all sampled rows agree.

## Edge-input handling notes
- Age-band selector is a closed dropdown rendered from the bundled JSON; no free-text numeric input, so no out-of-range path. Reference caveat noted via META citation.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Rendered as a labelled `<select>` followed by a `<table>` of ranges; tab order natural. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
