# v11 audit - 4at

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: MacLullich AMJ, Shenkin SD, Goodacre S, et al. *The 4 "A"s Test for detecting delirium in acute medical patients (4AT): a diagnostic accuracy study.* Health Technol Assess. 2019;23(40):1-194. Four domains: Alertness (0 or 4), AMT4 (0/1/2), Attention months-of-year-backwards (0/1/2), Acute change or fluctuating course (0 or 4). Range 0-12; cutoff >=4 for possible delirium; 1-3 for possible cognitive impairment without delirium; 0 makes delirium unlikely.

`lib/scoring-v4.js fourAt()` sums the four MacLullich 2019 domains and returns the score plus a three-band interpretation per spec-v11 §5.

## Boundary examples added
- low (tile example): 0 of 12 -> delirium unlikely.
- mid: alertness abnormal alone (4 of 12) -> possible delirium per MacLullich 2019.
- intermediate: AMT4 1 + attention 1 + acute change false + alertness normal (2 of 12) -> possible cognitive impairment without delirium.
- high: alertness abnormal (4) + AMT4 2 + attention 2 + acute change (4) = 12 of 12 -> possible delirium (MacLullich 2019 maximum).

## Cross-implementation differential
- Reference implementation: MacLullich AMJ, et al. Health Technol Assess. 2019;23(40):1-194 (4AT scoring table).
- Test case: alertness abnormal, AMT4 1 error, attention reaches 7, acute change false.
- Sophie result: score 5 (4+1+0+0), possible-delirium band.
- Reference result: same sum 5; >=4 cutoff met. PASS within one ordinal category.

## Edge-input handling notes
- Alertness and acute change are boolean (0 or 4); AMT4 and attention are 0/1/2.
- Out-of-range inputs to the numeric components are clamped to 0..2 via `Math.max(0, Math.min(2, ...))`.

## A11y / keyboard notes
- Two labeled `<select>` plus two checkboxes; Tab-reachable in source order; output region `aria-live="polite"`. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
