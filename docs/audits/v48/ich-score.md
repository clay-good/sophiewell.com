# v48 derivation provenance — ICH Score (`ich-score`)

- Auditor: CG
- Date: 2026-05-26
- Wave: 48-4e
- Citation re-verified against: Hemphill JC 3rd, Bonovich DC, Besmertis L, Manley GT, Johnston SC. *The ICH score: a simple, reliable grading scale for intracerebral hemorrhage.* Stroke. 2001;32(4):891-897.

## Components — verbatim source mapping

Five features summed; integer points assigned per Hemphill 2001 Table 2 to mirror the multivariable logistic-regression coefficients.

| Feature | Levels | Points |
|---|---|---|
| GCS at presentation | 3-4 | +2 |
| | 5-12 | +1 |
| | 13-15 | 0 |
| Age | >= 80 years | +1 |
| | < 80 years | 0 |
| ICH volume (initial CT, ABC/2) | >= 30 mL | +1 |
| | < 30 mL | 0 |
| Infratentorial origin (brainstem or cerebellum) | yes | +1 |
| Intraventricular hemorrhage | yes | +1 |

## Bands — source mapping (Hemphill 2001 Table 4)

| Score | 30-day mortality |
|---|---|
| 0 | 0% |
| 1 | 13% |
| 2 | 26% |
| 3 | 72% |
| 4 | 97% |
| 5 | 100% |
| 6 | 100% |

## Population

Hemphill 2001: retrospective derivation in 152 consecutive patients with spontaneous (non-traumatic) ICH presenting to a single academic medical center; 30-day mortality assessed.

## Validity

Adult patients with spontaneous ICH; prognostic at presentation. AHA/ASA caution against using the score alone to drive early withdrawal-of-care decisions (self-fulfilling-prophecy concern). Not validated for SAH, IVH without parenchymal involvement, traumatic ICH, or pediatric stroke.

## Source quote

"The ICH Score was the sum of points associated with each component: GCS score, age, ICH volume, presence of IVH, and infratentorial origin of ICH." — Hemphill 2001 §Methods.

## Renderer assertions

Verified locally:
- `META['ich-score'].derivation` has every required field per `lib/derivation.js validate()` and exactly 5 components.
- Components sum equals `ichScore().score` at three boundary points (GCS 15 / no factors -> 0; GCS 10 + age 85 -> 2; all factors at worst -> 6).

## Defects opened
None.
