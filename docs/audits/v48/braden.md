# v48 derivation provenance — Braden Scale (`braden`)

- Auditor: CG
- Date: 2026-05-25
- Wave: 48-3a
- Citation re-verified against: Bergstrom N, Braden BJ, Laguzza A, Holman V. *The Braden Scale for predicting pressure sore risk.* Nurs Res. 1987;36(4):205-210.

## Components — verbatim source mapping

Six ordinal items per Bergstrom 1987 (Braden Scale form). Five items scored 1-4; one item (friction and shear) scored 1-3. Total range 6-23.

| Item | Source levels |
|---|---|
| Sensory perception | 1 completely limited / 2 very limited / 3 slightly limited / 4 no impairment |
| Moisture | 1 constantly moist / 2 often moist / 3 occasionally moist / 4 rarely moist |
| Activity | 1 bedfast / 2 chairfast / 3 walks occasionally / 4 walks frequently |
| Mobility | 1 completely immobile / 2 very limited / 3 slightly limited / 4 no limitation |
| Nutrition | 1 very poor / 2 probably inadequate / 3 adequate / 4 excellent |
| Friction and shear | 1 problem / 2 potential problem / 3 no apparent problem |

The friction component's 1-3 range (not 1-4) is unique. The Sophie tile's `points` callback for friction is `Math.max(1, Math.min(3, Number(v) || 1))` — if the user enters 4 accidentally, it clamps to 3, matching the source-defined range.

## Bands — source mapping

| Score | Source label | Sophie label |
|---|---|---|
| ≥ 19 | not at risk | not at risk |
| 15-18 | mild risk | mild risk |
| 13-14 | moderate risk | moderate risk |
| 10-12 | high risk | high risk |
| ≤ 9 | very high risk | very high risk |

## Population

Bergstrom 1987: validation in 100 adult patients across medical-surgical and ICU settings. Subsequently validated in long-term care, home health, and pediatric populations (the pediatric Braden Q is a separate scale).

## Validity

Adult inpatients at risk for pressure injury. Score guides preventive interventions; specific institutional protocols govern frequency of repositioning, support-surface choice, and skin-assessment intervals. NOT validated for active treatment of existing pressure injuries (different staging tools — NPIAP staging is the reference). The pediatric Braden Q (Curley 2003) is a related but distinct instrument; this tile is adult-only.

## Source quote

"The Braden Scale ... consists of six subscales which reflect sensory perception, skin moisture, activity, mobility, friction and shear, and nutritional status. ... The Braden Scale is a reliable and valid measure of pressure ulcer risk." — Bergstrom 1987 §Abstract.

## Renderer assertions

Verified locally:
- `META.braden.derivation` has every required field per `lib/derivation.js validate()` and exactly 6 components.
- Components sum equals `braden().score` at two boundary points (max 23, high-risk 10).
- The friction component correctly clamps at 3 (not 4) — verified by a dedicated test asserting that input friction=4 still sums to 23, not 24.

## Defects opened
None.
