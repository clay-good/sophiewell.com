# spec-v1490 — Hamp furcation degree

Glickman furcation classes had no measured sibling; Hamp grades the furcation by horizontal loss in mm.

## Inputs

`hf-through` (required), `hf-horizontal` (mm, 0-15).

## What it does

Degree III when the probe passes through; otherwise 0 mm is no involvement, under 3 mm degree I, over 3 mm degree II. At exactly 3 mm the sources disagree ("up to 3 mm" vs "less than 3 mm") and the answer says degree I or II rather than picking one.

## Sources

Hamp SE, Nyman S, Lindhe J. J Clin Periodontol 1975;2(3):126-135. Degrees as stated in Clin Exp Dent Res 2024 (PMC10838140) and Dentomaxillofac Radiol 2023 (PMC10461257).

## Tests

`test/unit/hamp-furcation.test.js`: the worked example, every category, blanks and bounds.
