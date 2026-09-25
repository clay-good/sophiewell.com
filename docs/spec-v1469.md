# spec-v1469 — Blackburne-Peel index (patellar height)

A third patellar-height ratio beside `insall-salvati-ratio` and `caton-deschamps`. It measures to
the tibial plateau rather than the tibial tubercle, so it still works when the tubercle is abnormal
(Osgood-Schlatter disease, after a tubercle osteotomy).

## Measurement

On a lateral knee radiograph at about 30 degrees of flexion, index = A / B (both mm):
A is the perpendicular from the inferior margin of the patellar articular surface to a line along
the tibial plateau; B is the length of the patellar articular surface (definition as stated in
Cureus 2023, PMC10171240).

## Two cutoff sets, both reported

The published cutoffs disagree, so the tile reads the ratio against both and says which way each
falls instead of picking one.

| Convention | Low | Normal | High | Source |
|---|---|---|---|---|
| Original normal knees | < 0.54 | 0.54 to 1.06 (inclusive; mean 0.80, SD 0.14) | > 1.06 | Blackburne and Peel, J Bone Joint Surg Br 1977;59(2):241-242, range as restated in Ann Med Surg 2022 (PMC9577418), mean per Cureus 2023 Table 3 |
| Commonly used categories | < 0.80 | 0.80 to 1.00 (inclusive) | > 1.00 | Rev Bras Ortop 2012 (PMC4799376), Table 1 |

A ratio from 0.54 up to 0.80, or above 1.00 up to 1.06, is normal by the first and low or high by
the second; the band says both. The result is flagged when either reading is outside normal.

## Behavior

A (0 to 80 mm) and B (10 to 80 mm), both required; a blank asks, an impossible value is refused.
The ratio is rounded to 2 decimals for display and classified on the unrounded value; a value that
would round onto a cutoff it misses (0.799) is shown to 3 decimals. Notes: the two cutoff sets are
a matter of convention; the index is affected by tibial slope (Arthrosc Sports Med Rehabil 2021,
PMC8129056); it does not depend on the tubercle; it supports rather than replaces the clinical
assessment of patellar instability.

Worked example: A 24 mm, B 30 mm gives 0.80, normal by both.

## Tests

`test/unit/blackburne-peel.test.js`: the ratio, every boundary of both sets, the agree and disagree
wording, and refusals.
