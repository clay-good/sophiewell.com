# spec-v1572 — Thomazeau supraspinatus occupation ratio

Goutallier grades fatty infiltration of the supraspinatus; Thomazeau (1996) grades its atrophy as the share of the fossa the muscle fills.

## Inputs

Two required areas on the same oblique sagittal slice: the muscle and the fossa.

## What it does

Ratio = muscle / fossa. Grade I 0.60 or more (normal or mild), II 0.40 to 0.59 (moderate), III below 0.40 (severe). The grade is read on the exact ratio, so 0.595 is grade II. A muscle much larger than its fossa is refused.

## Sources

Thomazeau H et al. Acta Orthop Scand 1996;67(3):264-268. Grades as stated in Cureus 2025 (PMC12145530).

## Tests

`test/unit/thomazeau-occupation.test.js`: the worked example, the categories and their edges, and refusals.
