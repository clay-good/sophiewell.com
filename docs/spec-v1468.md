# spec-v1468 — MSU classification of lumbar disc herniation

The Michigan State University (MSU) classification describes a lumbar disc herniation on MRI by how
far it reaches toward the facet joints (size 1, 2 or 3) and where it intrudes furthest (zone A, AB,
B or C), written as a type such as 2-B.

## Source, read 2026-09-25

Mysliwiec LW, Cholewicki J, Winkelpleck MD, Eis GP. MSU classification for herniated lumbar discs on
MRI: toward developing objective criteria for surgical selection. *Eur Spine J* 2010;19(7):1087-1093
(doi:10.1007/s00586-009-1274-4, PMC2900017). One T2 axial cut at the level of maximal herniation,
measured against the intra-facet line. Size 1 reaches up to 50% of the distance from the posterior
disc to that line, size 2 more than 50%, size 3 beyond the line. Zones: A central quadrants, B
lateral quadrants, C the foramen beyond the facet's medial margin, AB on the A/B line.
Inter-examiner reliability 98%. Reliability in residents: *Acta Ortop Bras* 2018 (PMC6362681),
Fleiss kappa 0.42 between observers, 0.75 to 0.86 within an observer.

## Inputs

| Input | Rule |
| --- | --- |
| Size | select 1, 2 or 3, or leave it and measure |
| Distance to the intra-facet line | mm, above 0 and at most 60 |
| Extent of the herniation | mm, 0 to 60, from the same point |
| Location zone | A, AB, B or C; required |

Both measurements decide the size (up to 50% is 1; above 50% up to 100% is 2; above 100% is 3). A
chosen size that disagrees is named and not used. One measurement alone asks for the other. A blank
size or zone asks; neither is ever defaulted.

## Output

The type and a plain sentence, the paper's figure note for 2-B, 3-A, 2-C or 2-AB, the derivation's
exclusion of size-1 lesions from surgery, the reliability figures, and that the decision to operate
rests on the clinical findings.

## What it does not do

It does not read the image, recommend surgery, or score symptoms.

## Tests

`test/unit/msu-disc-herniation.test.js`: every size by select, the 50% and 100% boundaries, a
measurement overriding a select, AB, blanks and a lone measurement asking, and out-of-range refusals.
