# v12 audit - kawasaki-criteria

- Auditor: CG
- Date: 2026-06-17
- Citation re-verified against: McCrindle BW, Rowley AH, Newburger JW, et al. Diagnosis, Treatment, and Long-Term Management of Kawasaki Disease: A Scientific Statement From the American Heart Association. Circulation. 2017;135(17):e927-e999.

`lib/peds-v98.js kawasakiCriteria()` evaluates classic Kawasaki disease (fever >= 5 days plus >= 4 of 5 principal features) and the AHA incomplete-Kawasaki algorithm (prolonged fever + 2-3 features, then the CRP/ESR inflammatory gate, then >= 3 of 6 supplementary lab criteria or a positive echo). Class B: the AHA statement is revisable, so a docs/citation-staleness.md row names the 2017 edition.

## Boundary worked examples added
- fever 6 days + 4 principal features -> classic Kawasaki.
- fever 7 days + 2 features, CRP 5 / ESR 50, 3 supplementary criteria -> supports incomplete Kawasaki.
- fever 6 days + 2 features, CRP 1 / ESR 20 -> below the inflammatory gate, serial evaluation.

## Cross-implementation differential
- Reference: the AHA 2017 algorithm branches. Match. PASS.

## Edge-input handling notes
- Blank fever duration surfaces valid:false; the incomplete pathway withholds a verdict until CRP and ESR are entered; no NaN reaches the DOM. Fuzz harness covers the module.

## A11y / keyboard notes
- Labeled inputs; output aria-live="polite". 320px sweep passes with no horizontal scroll. Decision support, not a verdict.

## Defects opened
- none

## Status
- PASS
