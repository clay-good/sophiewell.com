# v12 audit - rapid-pleural

- Auditor: CG
- Date: 2026-06-19
- Citation re-verified against: Rahman NM, Kahan BC, Miller RF, Gleeson FV, Nunn AJ, Maskell NA. A clinical score (RAPID) to identify those at risk for poor outcome at presentation in patients with pleural infection. Chest. 2014;145(4):848-855 (re-fetched; cross-read with the PMC Table 3 reproduction, PMID 24264558, and the PILOT validation in ERJ 2020).

`lib/pulmnod-v115.js rapidPleural()` sums five items to 0-7: Renal (urea band
< 5 / 5-8 / > 8 mmol/L = 0/1/2), Age (< 50 / 50-70 / > 70 = 0/1/2), Purulence
(non-purulent = +1), Infection source (hospital-acquired = +1), and Dietary
albumin (< 27 g/L = +1). Bands low 0-2, medium 3-4, high 5-7, with
derivation-cohort 3-month mortality ~1.5 / 17 / 47%. Class A.

## Boundary worked examples added
- urea > 8, age 74, non-purulent, hospital-acquired, albumin 24 -> 7 (high, ~47%).
- low anchor: urea < 5, age 45, purulent, community, albumin 30 -> 0 (low).
- age bands: < 50 = 0, 50-70 = 1, > 70 = 2.
- band boundary: 2 low, 3 medium, 5 high.
- partial inputs render a complete-the-fields fallback.

## Cross-implementation differential
- Reference: the 0/1/2 urea and age weights and the 0/1 purulence, source, and
  albumin weights were confirmed identical across two reproductions of the
  original table. The only cross-source divergence is the absolute 3-month
  mortality per band (Rahman 2014 derivation ~1.5/17/47% vs the PILOT validation
  3/9/31%); the point structure is identical. The tile reports the derivation
  cohort (the cited paper) and labels it as such. Match. PASS.
- Unit note: the paper reports serum *urea* in mmol/L (UK convention), banded by
  the urea select; BUN-reporting labs must convert before banding.

## Edge-input handling notes
- age and albumin are required non-negative numbers; urea is a select; purulence
  and source are booleans. A blank required number yields a valid:false fallback.

## A11y / keyboard notes
- One labeled select + two labeled number inputs + two labeled checkboxes;
  output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
