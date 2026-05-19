# v11 audit - dash-vte

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Tosetto A, Iorio A, Marcucci M, et al. *Predicting disease recurrence in patients with previous unprovoked venous thromboembolism: a proposed prediction score (DASH).* J Thromb Haemost. 2012;10(6):1019-1025. Four criteria: D-dimer abnormal post-anticoagulation +2, Age <50 +1, Male sex +1, Hormone use at time of initial VTE in women -2. Sum -2 to +4. Bands per Tosetto 2012 Table 4: <=1 low (annual recurrence 3.1%), 2 intermediate (6.4%), >=3 high (12.3%).

`lib/scoring-v4.js dashVte()` sums the four weighted contributions (one weighted -2 per Tosetto 2012 for hormone use). The "hormone use" weight is only applicable to women and is intended to be applied only when the clinician has determined it is relevant; the renderer labels the checkbox accordingly.

## Boundary examples added
- 0 (tile example) -> low band 3.1%/yr.
- 1 (age <50 alone) -> low band (upper edge of <=1).
- 2 (D-dimer abnormal alone) -> intermediate band 6.4%/yr.
- 3 (D-dimer + age <50) -> high band 12.3%/yr.
- -2 (woman with hormone use only) -> low band (negative score floors in low).
- 4 (every positive factor; no hormone) -> high band.

## Cross-implementation differential
- Reference: Tosetto 2012 Table 4 worked through manually.
- Test case: D-dimer (2) + male (1) = 3 -> high band.
- Sophie result: 3, high band 12.3%.
- Reference: same. PASS.

## Edge-input handling notes
- All boolean inputs interpreted via `x ? weight : 0`. Hormone-use weighted -2 (not subtracted from a 0/x guard) so negative composite scores are admissible per Tosetto 2012.

## A11y / keyboard notes
- Four labeled checkboxes; Tab-reachable; aria-live result region. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
