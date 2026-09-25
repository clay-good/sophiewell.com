# spec-v1492 — Bolton tooth-size ratios

The Angle classification had no tooth-size companion. Bolton's ratios compare the mandibular and maxillary sums of mesiodistal widths.

## Inputs

Four optional sums in mm: maxillary and mandibular, canine to canine and first molar to first molar.

## What it does

Each ratio is mandibular over maxillary times 100, read against Bolton's 77.2% (SD 1.65) and 91.3% (SD 1.91): within or outside 1 SD, with the mandibular or maxillary excess in mm that brings the ratio to the mean. A pair not entered is disclosed; half a pair is asked for; an anterior sum as large as its overall sum is refused.

## Sources

Bolton WA. Angle Orthod 1958;28(3):113-130. Means and SDs as stated in J Clin Med 2026 (PMC13565780) and Cureus 2026 (PMC13242905).

## Tests

`test/unit/bolton-ratio.test.js`: the worked example, every category, blanks and bounds.
