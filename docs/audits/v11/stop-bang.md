# v11 audit - stop-bang

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Chung F, Yegneswaran B, Liao P, et al. *STOP questionnaire: a tool to screen patients for obstructive sleep apnea.* Anesthesiology. 2008;108(5):812-821. BANG extension: Chung F, Subramanyam R, Liao P, Sasaki E, Shapiro C, Sun Y. *High STOP-Bang score indicates a high probability of obstructive sleep apnoea.* Br J Anaesth. 2012;108(5):768-775. Eight binary criteria; sum 0-8; cutoffs 0-2 low, 3-4 intermediate, 5-8 high risk for moderate-to-severe OSA per Chung 2012 Table 3.

`lib/scoring-v4.js stopBang()` sums the eight Chung 2008/2012 criteria and returns the Chung 2012 Table 3 risk band. Each criterion is a single-bit flag; no per-item weighting.

## Boundary examples added
- low (tile example): 0 of 8 -> low risk per Chung 2012 (0-2 band).
- low (upper bound): 2 of 8 stays in low-risk band.
- intermediate (cutoff): 3 of 8 -> intermediate-risk band (3-4) per Chung 2012.
- high (cutoff): 5 of 8 -> high risk for moderate-to-severe OSA per Chung 2012 (cutoff >=5).
- high (maximum): 8 of 8 -> high-risk band.

## Cross-implementation differential
- Reference: hand-summed against Chung 2012 Table 3 cutoffs (0-2 low, 3-4 intermediate, 5-8 high).
- Test case: snore + tired + observed apnea + high BP + male.
- Sophie result: 5 of 8 (high-risk band).
- Reference: same. PASS.

## Edge-input handling notes
- Eight boolean inputs; no NaN paths. Casting `truthy ? 1 : 0` so any unexpected non-boolean still resolves cleanly.

## A11y / keyboard notes
- Eight labeled checkboxes; Tab-reachable; aria-live result region. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
