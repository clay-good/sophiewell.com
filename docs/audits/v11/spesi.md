# v11 audit - spesi

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Jimenez D, Aujesky D, Moores L, et al. *Simplification of the pulmonary embolism severity index for prognostication in patients with acute symptomatic pulmonary embolism.* Arch Intern Med. 2010;170(15):1383-1389. Table 3 (30-day all-cause mortality by sPESI band).

Six binary criteria; one point each per Jimenez 2010: age > 80, history of cancer, chronic cardiopulmonary disease (CHF or chronic lung disease combined), pulse >= 110, SBP < 100, SaO2 < 90%. sPESI 0 -> low-risk band; >= 1 -> not-low-risk band. `lib/scoring-v4.js spesi()` implements the count and the dichotomous band with the Jimenez 2010 Table 3 30-day all-cause mortality (1.0% low, 10.9% not-low) surfaced in the interpretation block.

## Boundary examples added
- low: no criteria -> 0 (low risk; 30-day all-cause mortality 1.0%).
- mid: age > 80 alone -> 1 (not-low risk; 30-day all-cause mortality 10.9%).
- high: every criterion positive -> 6 (not-low risk).

## Cross-implementation differential
- Reference implementation: Jimenez D, et al. Arch Intern Med. 2010;170(15):1383-1389, §Methods (sPESI criteria) + Table 3 (mortality).
- Test case: cancer + HR >= 110.
- Sophie result: 2, not-low risk.
- Reference result: 2, not-low risk per Jimenez 2010 Table 3.
- Delta: 0 / one ordinal category. PASS.

## Edge-input handling notes
- Six checkboxes; nothing to validate. The "chronic cardiopulmonary disease" criterion is intentionally the combined Jimenez 2010 condition (CHF + chronic lung disease together) rather than two separate boxes, to prevent double-counting; the inline label reflects the source phrasing.
- Age uses a binary `> 80` checkbox rather than a numeric input, matching the simplification that distinguishes sPESI from the original PESI.

## A11y / keyboard notes
- Six labeled checkboxes; Tab-reachable in source order; output region `aria-live="polite"`. `npm run test:a11y` clean after the tile was added.

## Defects opened
- none

## Status
- PASS
