# spec-v1440 — STRONGkids pediatric nutritional risk screen

The catalog screens adults for malnutrition (`nrs2002`, `must-nutrition`, `mna-sf`) and had no
screen for a hospitalized child. An earlier gap-finder hit on "stamp" was a false token match: no
pediatric screen was present.

## Sources, read 2026-09-24

- Hulst JM et al, *Clin Nutr* 2010;29:106-111 (abstract, PubMed 19682776; DOI checked on
  Crossref): four items, applied to 98% of 424 children in 44 Dutch hospitals; a high-risk score
  went with a lower weight-for-height and a longer stay. The abstract names the items, not the
  points.
- Points and bands, stated identically in three open papers (PMC13046502, PMC11929289,
  PMC12829223):

| item | points |
|---|---|
| poor nutritional status on subjective clinical assessment | 1 |
| high risk disease or expected major surgery | 2 |
| reduced intake or losses (diarrhea, vomiting, pain, prior nutrition support) | 1 |
| weight loss, or no weight gain in an infant | 1 |

Bands: 0 low, 1-3 moderate, 4-5 high. Screen within 24 hours of admission and weekly after.
PYMS, the other pediatric screen found absent, was not built: its first step needs an age-specific
BMI cut-off table this session could not source.

## Behavior

Every item must be answered; a blank is never read as "no". The answer gives the band and says it is
a screen to repeat weekly, not a malnutrition diagnosis. Placed in Pediatrics & Neonatal.

## Tests

`test/unit/strongkids.test.js`: each item's points, the band edges (3 moderate, 4 high), blanks.
