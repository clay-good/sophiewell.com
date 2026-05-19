# v11 audit - ats-idsa-cap

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Metlay JP, Waterer GW, Long AC, et al. *Diagnosis and Treatment of Adults with Community-acquired Pneumonia. An Official Clinical Practice Guideline of the American Thoracic Society and Infectious Diseases Society of America.* Am J Respir Crit Care Med. 2019;200(7):e45-e67. Table 1: two major criteria + nine minor; severe if >=1 major OR >=3 minor.

`lib/scoring-v4.js atsIdsaCap()` counts the major and minor criteria and returns `severe = majorCount >= 1 || minorCount >= 3` per Metlay 2019 Table 1.

## Boundary examples added
- low (tile example): nothing checked -> not severe.
- major path: mechanical ventilation alone -> severe (>=1 major).
- minor threshold: RR + P/F + multilobar (3 minor) -> severe.
- borderline: 2 minor only -> not severe.
- all checked: 2 major + 9 minor -> severe (Metlay 2019 maximum).

## Cross-implementation differential
- Reference: Metlay JP, et al. Am J Respir Crit Care Med. 2019;200(7):e45-e67 Table 1.
- Test case: RR + uremia + thrombocytopenia (3 minor).
- Sophie result: severe (3 minor).
- Reference: same. PASS.

## Edge-input handling notes
- 11 boolean inputs only.

## A11y / keyboard notes
- 11 labeled checkboxes grouped under two `<h3>` headers. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
