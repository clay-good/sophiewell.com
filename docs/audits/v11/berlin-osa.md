# v11 audit - berlin-osa

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Netzer NC, Stoohs RA, Netzer CM, Clark K, Strohl KP. *Using the Berlin Questionnaire to identify patients at risk for the sleep apnea syndrome.* Ann Intern Med. 1999;131(7):485-491. Three categories with criteria-specific high-risk rules. Category 1 (snoring): positive if >=2 of five answers are met (snore present, snore louder than talking, snore >=3-4/wk, snoring has bothered others, observed apnea >=3-4/wk). Category 2 (daytime sleepiness): positive if >=2 of three answers (tired after sleep >=3-4/wk, tired during day >=3-4/wk, nodded off while driving). Category 3 (HTN/BMI): positive if hypertension OR BMI >30. Overall: high risk for OSA if >=2 categories are positive.

`lib/scoring-v4.js berlinOsa()` counts "yes" answers per category, marks each category positive against its Netzer 1999 threshold, then returns `highRisk: true` iff >=2 categories are positive. Categories are independent computations; a clinician cannot conflate counts across categories.

## Boundary examples added
- All "no" (tile example) -> 0 positive categories -> LOW risk.
- One category positive (e.g., cat 1 with 2 snoring yeses) -> LOW risk (need >=2 positive categories).
- Two categories positive (cat 1 + cat 3) -> HIGH risk.
- Cat 1 with exactly 2 yeses (boundary) -> cat 1 positive.
- Cat 1 with 1 yes -> cat 1 not positive (below threshold).
- Cat 3 positive via hypertension alone -> cat 3 positive.
- Cat 3 positive via BMI >30 alone -> cat 3 positive.
- All "yes" -> all 3 categories positive -> HIGH risk.

## Cross-implementation differential
- Reference: Netzer 1999 categorization worked through manually.
- Test case: snore + louder + frequent (cat 1 = 3 yeses -> positive), HTN (cat 3 positive) -> 2 categories positive -> HIGH.
- Sophie result: highRisk true, 2 categories positive.
- Reference: same. PASS.

## Edge-input handling notes
- Each item interpreted via `x ? 1 : 0` so undefined defaults to "no".
- Category-3 logic uses OR, so HTN+BMI both checked still counts as one positive category (per Netzer 1999).

## A11y / keyboard notes
- 10 labeled checkboxes grouped under three semantic headings; Tab-reachable; aria-live result region. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
