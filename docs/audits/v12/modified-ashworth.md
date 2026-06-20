# v12 audit - modified-ashworth

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Bohannon RW, Smith MB. Interrater reliability of a modified Ashworth scale of muscle spasticity. Phys Ther. 1987;67(2):206-207 (re-fetched; the verbatim grade wording cross-read across SRALAB/RehabMeasures, StatPearls/NCBI NBK554572, and Physiopedia, with SRALAB matching the original Bohannon & Smith table).

`lib/neuro-v122.js modifiedAshworth()` maps a single ordinal selection to its
published grade description: 0 (no increase in muscle tone), 1 (slight increase --
catch and release, or minimal resistance at end of range), 1+ (slight increase --
catch then minimal resistance through less than half the range), 2 (more marked
increase through most of the range, part easily moved), 3 (considerable increase,
passive movement difficult), and 4 (rigid in flexion or extension). Class A (fixed
ordinal scale; journal+author citation, no ISSUER_PATTERN trip -- no
docs/citation-staleness.md row).

## Boundary worked examples added
- grade 0 -> no increase, not flagged.
- "1+" renders as a distinct ordinal step (the 1987 modification), not 1.5 or summed.
- "1+" vs "2" are distinct adjacent steps with different descriptions.
- grades 3 and 4 are flagged (severe); grade 2 is not.
- unknown / scalar fuzz arg falls back to grade 0, never throws.

## Cross-implementation differential
- Reference: the SRALAB reproduction matches the original Bohannon & Smith table
  verbatim (including "manifested by" and the "(less than half)" parenthetical).
  The "1+" level is the 1987 addition to the 1964 five-point Ashworth scale and is a
  DISTINCT ordinal step -- the compute uses string keys ('0','1','1plus','2','3','4')
  so there is no arithmetic that could average or overflow into a fractional grade.
  Match. PASS.

## Edge-input handling notes
- A single select keyed by string; an unknown or scalar input falls back to grade 0
  (a valid grade), never throws and never produces a non-finite value.

## A11y / keyboard notes
- One labeled select; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
