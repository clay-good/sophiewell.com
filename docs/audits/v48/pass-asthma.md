# v48 derivation provenance — PASS (`pass-asthma`)

- Auditor: CG
- Date: 2026-05-26
- Wave: 48-4i
- Citation re-verified against: Gorelick MH, Stevens MW, Schultz TR, Scribano PV. *Performance of a novel clinical score, the pediatric asthma severity score (PASS), in the evaluation of acute asthma.* Acad Emerg Med. 2004;11(1):10-18.

## Components — verbatim source mapping

Three items each 0-2 (clamped); range 0-6.

| # | Item | Allowed values |
|---|---|---|
| 1 | Wheezing | 0 (none) / 1 (end-expiratory only) / 2 (throughout exhalation or audible without stethoscope) |
| 2 | Work of breathing | 0 (no retractions) / 1 (intercostal retractions) / 2 (suprasternal / nasal flaring / abdominal accessory use) |
| 3 | Prolonged expiration | 0 (normal) / 1 (mild prolongation) / 2 (severe with audible inspiratory wheeze) |

## Bands — source mapping (Gorelick 2004)

| Range | Severity |
|---|---|
| 0-1 | Mild |
| 2-3 | Moderate |
| 4-6 | Severe |

## Population

Gorelick 2004: prospective derivation and validation in 852 children aged 1-18 years presenting to two urban pediatric EDs with acute asthma exacerbation. Designed as a shorter alternative to PRAM (3 items vs 5) with the same level of inter-rater reliability and discrimination against post-treatment outcomes.

## Validity

Children aged 1-18 with acute asthma exacerbation. PASS and PRAM are both endorsed by current pediatric ED asthma guidelines. Not validated for adults (use FEV1 or peak flow), infants under ~12 months (use bronchiolitis severity scores), or asthma exacerbations triggered by anaphylaxis or upper-airway obstruction.

## Source quote

"The pediatric asthma severity score (PASS), consisting of three clinical findings ... was a reliable and valid measure of acute asthma severity." — Gorelick 2004 §Results.

## Renderer assertions

Verified locally:
- `META['pass-asthma'].derivation` has every required field per `lib/derivation.js validate()` and exactly 3 components.
- Components sum equals `passAsthma().score` at multiple boundary points including the 0-2 clamp on out-of-range inputs.

## Defects opened
None.
