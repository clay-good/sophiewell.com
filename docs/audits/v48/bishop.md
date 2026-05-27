# v48 derivation provenance — Bishop Score (`bishop`)

- Auditor: CG
- Date: 2026-05-26
- Wave: 48-4j
- Citation re-verified against: Bishop EH. *Pelvic scoring for elective induction.* Obstet Gynecol. 1964;24:266-268.

## Components — verbatim source mapping

Five cervical-examination items, each scored 0-3 with item-specific cutoffs (Bishop 1964 Table 1). Range 0-13.

| # | Item | Bands |
|---|---|---|
| 1 | Dilation (cm) | 0: 0 / 1-2: +1 / 3-4: +2 / >=5: +3 |
| 2 | Effacement (%) | <30: 0 / 30-50: +1 / 51-70: +2 / >70: +3 |
| 3 | Station | <=-3: 0 / -2: +1 / -1 or 0: +2 / +1 or +2: +3 |
| 4 | Consistency | firm: 0 / medium: +1 / soft: +2 |
| 5 | Position | posterior: 0 / mid: +1 / anterior: +2 |

## Bands — source mapping (Bishop 1964)

| Range | Interpretation |
|---|---|
| 0-5 | Unfavorable (induction less likely to succeed) |
| 6-8 | Intermediate |
| 9-13 | Favorable |

## Population

Bishop 1964: prospective derivation in 500 multiparous patients at term scheduled for elective induction at Pennsylvania Hospital; outcome was time-to-delivery after induction.

## Validity

Term pregnancies at >= 37 weeks being evaluated for induction of labor. Best-studied in multiparous patients; nulliparous performance is less favorable. The Modified Bishop with parity adjustment is now more commonly used. Not validated for preterm induction or non-induction cervical assessment.

## Source quote

"Cervical scoring is the sum of points assigned to ... dilation, effacement, station, consistency, and position." — Bishop 1964 §Methods.

## Renderer assertions

Verified locally:
- `META.bishop.derivation` has every required field per `lib/derivation.js validate()` and exactly 5 components.
- Components sum equals `bishop().score` at multiple boundary points including all four banded callbacks at edge values (dilation 0/1/3/5; effacement 29/30/51/71; station -3/-2/0/1; consistency / position enums).

## Defects opened
None.
