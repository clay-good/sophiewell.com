# spec-v1470 — Lateral center-edge angle of Wiberg

The catalog grades hip dysplasia outcome (Severin) and arthritis (Tonnis) but had no tile for the
angle most hip-preservation decisions start from. `lcea` and `center-edge angle` matched nothing.

## Source, read 2026-09-25

Atzmon R, Safran MR, *Curr Rev Musculoskelet Med* 2022;15(4):300-310 (PMC9276885, open access),
citing Wiberg, *Acta Chir Scand* 1939;83(Suppl 58). The angle is drawn on an AP pelvic radiograph
from a vertical line through the femoral head center and a line to the lateral edge of the sourcil.
Normal 25 to 39 degrees; under 20 dysplastic; 20 to 25 borderline, "with some studies defining it
between 18 and 25 degrees". *J Hip Preserv Surg* 2024 (PMC11973426) confirms both borderline
definitions.

## Behavior

One required number, -20 to 70 degrees (a subluxed hip can read negative). Blank asks for it.

| Angle (degrees) | Reading |
|---|---|
| below 18 | Dysplasia under both definitions |
| 18 to below 20 | Dysplastic under the 20-25 definition, borderline under the 18-25 one (both stated) |
| 20 to below 25 | Borderline dysplasia |
| 25 to 39 | Normal |
| above 39 | Above the normal range the review gives |

The source's ranges share the endpoint 25; exactly 25 reads normal and says so. Under 15 degrees the
answer adds the review's note that this was among the predictors of failed arthroscopy. Every answer
notes that the LCEA alone does not choose the operation. Nothing is said about over-coverage above
39: the source ties no cutoff to it.

## Tests

`test/unit/lateral-center-edge-angle.test.js`: every boundary, the dual reading, the endpoint note,
the under-15 note, and refusals.
