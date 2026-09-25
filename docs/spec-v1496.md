# spec-v1496 — Turesky modified Quigley-Hein plaque index

The sibling of the Silness-Loe plaque index most used in toothbrush and mouthrinse trials: each surface scored 0 to 5 by how far plaque extends from the gingival margin.

## Inputs

Six required counts: the number of surfaces at each score, 0 if none.

## What it does

The index is the mean score over the surfaces examined, with the number and share of surfaces scored 3 or more. Counts must be whole numbers and not all zero.

## Sources

Turesky S, Gilmore ND, Glickman I. J Periodontol 1970;41(1):41-43. Scores as stated in Int Dent J 2026 (PMC13094486).

## Tests

`test/unit/turesky-plaque.test.js`: the worked example, the categories, blanks and bounds.
