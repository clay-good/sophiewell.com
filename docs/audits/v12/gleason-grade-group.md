# v12 audit - gleason-grade-group

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Epstein JI, et al. Am J Surg Pathol. 2016;40(2):244-252 (PMID 26492179, Table 4). Cross-read against PMC5085914 (ISUP 2014) and Pathology Outlines / ACS grade-group references.

`lib/uro-v130.js gleasonGradeGroup()` maps the primary + secondary Gleason patterns to a prognostic Grade Group 1-5. Class A (journal+author citation — no docs/citation-staleness.md row).

## Source-governance / mapping note
- GG1 = sum ≤ 6; GG2 = 3+4 = 7; GG3 = 4+3 = 7; GG4 = sum 8 (4+4, 3+5, 5+3); GG5 = sum
  9-10 (4+5, 5+4, 5+5). The primary pattern governs the 3+4 (GG2) vs 4+3 (GG3) split — this
  is the central feature of the grade-group system and is implemented as
  `sum === 7 ? (primary === 3 ? 2 : 3)`.
- Epstein's table defines GG4/GG5 by score (8; 9-10); the explicit pattern enumerations are
  confirmed by ISUP/Pathology Outlines and follow directly from the score.

## Boundary worked examples added
- 3+4 → sum 7, GG2 (favorable intermediate); 4+3 → sum 7, GG3 (unfavorable intermediate).
- 3+3 → GG1; 4+4 → GG4; 3+5 → GG4; 4+5 → GG5; 5+5 → GG5.
- GG4/GG5 flagged abnormal (high grade); GG1 not flagged.
- patterns must be integers 1-5 (6 or 3.5 → valid:false); missing pattern → valid:false;
  scalar → valid:false.

## Edge-input handling notes
- Both patterns validated as integers in [1, 5] (intIn); the renderer offers patterns 3-5
  (the modern reportable patterns) via selects. abnormal = group ≥ 4.

## A11y / keyboard notes
- Two labeled selects; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
