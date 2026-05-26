# v48 derivation provenance — PRAM (`pram-asthma`)

- Auditor: CG
- Date: 2026-05-26
- Wave: 48-4i
- Citation re-verified against: Chalut DS, Ducharme FM, Davis GM. *The Preschool Respiratory Assessment Measure (PRAM): a responsive index of acute asthma severity.* J Pediatr. 2000;137(6):762-768.

## Components — verbatim source mapping

Five items with item-specific allowed values; range 0-12.

| # | Item | Allowed values |
|---|---|---|
| 1 | Suprasternal retractions | 0 (absent) / 2 (present) |
| 2 | Scalene muscle contraction | 0 (absent) / 2 (present) |
| 3 | Air entry | 0 (normal) / 1 (decreased at bases) / 2 (widespread decrease) / 3 (absent / minimal) |
| 4 | Wheezing | 0 (none) / 1 (expiratory only) / 2 (inspiratory + expiratory) / 3 (audible without stethoscope or silent chest) |
| 5 | Oxygen saturation | 0 (>=95%) / 1 (92-94%) / 2 (<92%) |

## Bands — source mapping (Chalut 2000)

| Range | Severity |
|---|---|
| 0-3 | Mild |
| 4-7 | Moderate |
| 8-12 | Severe |

## Population

Chalut 2000: prospective derivation and validation in 258 children aged 6 weeks to 17 years presenting to a pediatric ED with acute asthma exacerbation at a single Montreal center. Designed for inter-rater reliability; subsequent multi-site validations (Ducharme 2008) established the >= 4 / >= 8 cutoffs in current pediatric asthma guidelines.

## Validity

Children with acute asthma exacerbation. PRAM and PASS (Gorelick 2004, separate Sophie tile) are both widely-used pediatric ED asthma severity scores. Not validated for adults (use FEV1 or peak flow), infants under ~6 weeks (insufficient cooperation for SpO2), or non-asthma pediatric wheeze (use bronchiolitis-specific scores).

## Source quote

"The PRAM is a 5-item asthma severity score that ... showed a high level of inter-rater agreement." — Chalut 2000 §Discussion.

## Renderer assertions

Verified locally:
- `META['pram-asthma'].derivation` has every required field per `lib/derivation.js validate()` and exactly 5 components.
- Components sum equals `pramAsthma().score` at multiple boundary points including the binary-style items (suprasternal absent: 0 / present: 2) and the 4-level items (air entry, wheezing).

## Defects opened
None.
