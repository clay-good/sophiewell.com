# v12 audit - mirels-score

- Auditor: CG
- Date: 2026-06-23
- Citation re-verified against: Mirels H. Metastatic disease in long bones: a proposed scoring system for diagnosing impending pathologic fractures. Clin Orthop Relat Res. 1989;(249):256-264 (cross-verified against the CORR "Classifications in Brief: Mirels' Classification" review and CancerCalc).

`lib/ortho-v145.js mirelsScore()` consumes the four factors (site, pain,
radiographic nature, size vs cortex), each 1–3, and computes the 4–12 total and
the published risk band. Class A.

## Source-governance notes
- Factor points re-fetched verbatim: site upper-limb 1 / lower-limb 2 /
  peritrochanteric 3; pain mild 1 / moderate 2 / functional 3; nature blastic 1 /
  mixed 2 / lytic 3; size <1/3 = 1 / 1/3-2/3 = 2 / >2/3 = 3.
- Bands: <=7 low (~0-4% fracture risk, irradiate/observe); 8 borderline (~15%,
  clinical judgment); >=9 high (>33%, prophylactic fixation). The >=9 cutoff is
  sensitive (~91%) but not specific (~33%) -- captured in the interpretation.
- The 8->9 flip is the management boundary (borderline -> prophylactic fixation);
  asserted in the unit tests.

## Boundary worked examples added
- minimum 4 -> low risk; total 7 -> still low risk.
- total 8 -> borderline (not abnormal).
- total 9 -> high-risk flip, abnormal, "prophylactic fixation" in band.
- maximum 12 -> high risk; factor breakdown {3,3,3,3}.
- any missing factor -> invalid.

## Edge-input handling notes
- Four required selects; the total passes through num() with a [4,12] range
  guard. Any unmapped value renders the complete-the-fields fallback. No
  non-finite path. Covered by the spec-v59 fuzz harness.

## A11y / keyboard notes
- Four labeled selects (leading blank placeholder); output aria-live="polite".
  320px sweep, no hscroll.

## Defects opened
- none
