# v12 audit - stratify

- Auditor: CG
- Date: 2026-06-29
- Citation re-verified against: Oliver D, Britton M, Seed P, Martin FC, Hopper AH. Development and evaluation of evidence based risk assessment tool (STRATIFY) to predict which elderly inpatients will fall. BMJ. 1997;315(7115):1049-1053. Five-factor 0-5 structure, the transfer+mobility (Barthel 0-3 each) = 3 or 4 scoring rule, and the >= 2 high-risk threshold cross-verified against validation studies (>= 2 sources, spec-v97).

`lib/ltcga-v176.js stratify()` sums the 5 factors to 0-5. Group G, Class A.

## Source-governance notes
- Five factors each score 1: recent fall; agitation; visual impairment affecting function; frequent toileting; combined transfer + mobility score of 3 or 4.
- Total 0-5; >= 2 is high fall risk. Journal issuer; does not trip ISSUER_PATTERN; no citation-staleness row.

## Boundary worked examples added
- 0/5 lower; 1->2 high-risk flip; transfer+mobility 3 or 4 scores the point (0-2 and 5-6 do not); 5/5 high; blank/out-of-range -> valid:false.

## Edge-input handling notes
- yes/no factors and transfer/mobility 0-3 validated; any blank/out-of-range -> valid:false; never NaN (spec-v59 fuzz pass).
