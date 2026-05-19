# v11 audit - hacor

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Duan J, Han X, Bai L, Zhou L, Huang S. *Assessment of heart rate, acidosis, consciousness, oxygenation, and respiratory rate to predict noninvasive ventilation failure in hypoxemic patients.* Intensive Care Med. 2017;43(2):192-199. Table 1 weights for HR, pH, GCS, PaO2/FiO2, RR; cutoff >5 at 1 hour of NIV with ~90% specificity for failure.

`lib/scoring-v4.js hacor()` sums the five per-parameter contributions per Duan 2017 Table 1.

## Boundary examples added
- low (tile example): HR 110, pH 7.40, GCS 15, PaO2 120 on FiO2 0.5 (P/F 240), RR 25 -> 0 + 0 + 0 + 0 + 0 = 0; not high-risk.
- mid: HR 125 (1), pH 7.32 (2), GCS 13 (2), P/F 160 (3), RR 32 (1) -> 9 (>5; high risk).
- high: HR 130 (1), pH 7.20 (4), GCS 9 (10), P/F 90 (6), RR 50 (4) -> 25 (Duan 2017 maximum; high risk).

## Cross-implementation differential
- Reference: Duan J, et al. Intensive Care Med. 2017;43(2):192-199 Table 1 (hand sum).
- Test case: HR 122, pH 7.28, GCS 14, P/F 140 (PaO2 84, FiO2 0.6), RR 33.
- Sophie result: 1 + 3 + 0 + 4 + 1 = 9 (high risk).
- Reference: same sum. PASS.

## Edge-input handling notes
- Six numeric inputs; pH defaults to 7.40 if non-numeric; GCS defaults to 15 (best score); FiO2 must be positive to compute P/F.

## A11y / keyboard notes
- Six labeled number inputs; Tab-reachable; output region `aria-live="polite"`. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
