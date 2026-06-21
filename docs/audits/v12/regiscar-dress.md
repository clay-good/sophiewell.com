# v12 audit - regiscar-dress

- Auditor: CG
- Date: 2026-06-21
- Citation re-verified against: Kardaun SH, Sekula P, Valeyrie-Allanore L, et al. Drug reaction with eosinophilia and systemic symptoms (DRESS): an original multisystem adverse drug reaction. Results from the prospective RegiSCAR study. Br J Dermatol. 2013;169(5):1071-1080.

`lib/id-v137.js regiscarDress()` returns the -4 to +9 total and the certainty band. Class A (fixed weighted items; journal+author citation - no docs/citation-staleness.md row).

## Source-governance / weighting note
- Full table cross-verified across PMC10421667, Frontiers fmed 2023, and the WAO Journal review. Items: fever >= 38.5C +1; enlarged lymph nodes (>= 2 sites) +1; eosinophilia 700-1499/uL or 10-19.9% = +1, >= 1500/uL or >= 20% = +2 (the count and percentage paths are ALTERNATIVES, max +2, not additive); atypical lymphocytes +1; skin rash > 50% BSA +1; rash suggestive of DRESS (yes +1, unknown 0, no -1); skin biopsy (compatible/unknown 0, against -1); organ involvement (1 organ +1, >= 2 organs +2); resolution > 15 days +1; evaluation of other causes (>= 3 done and all negative) +1.
- Two items go negative (rash-suggestive No = -1, biopsy against = -1) -> the total floor is -4 (NOT the min -1 a popular R package incorrectly reports). Bands: < 2 no case, 2-3 possible, 4-5 probable, > 5 definite.

## Boundary worked examples added
- probable (5) -> definite (6) flip on adding resolution > 15 days; eosinophilia alternatives max +2; negative floor at -2 (rash-against + biopsy-against); band cut-points at 1/2/3/4; organ 1 vs >= 2.

## Edge-input handling notes
- Every item must be selected (the unknown/no choices are explicit, not blank); a blank surfaces valid:false. Joined the spec-v59 fuzz harness (zero non-finite leaks; the negative-weight signed total is handled).

## A11y / keyboard notes
- Ten labeled selects (eosinophilia, rash-suggestive, biopsy, and organ are multi-option); output aria-live="polite". 320px sweep, no hscroll; renders the clinical-posture note.

## Defects opened
- none
