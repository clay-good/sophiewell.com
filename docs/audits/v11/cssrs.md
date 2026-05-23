# v11 audit - cssrs

- Auditor: CG
- Date: 2026-05-22
- Citation re-verified against: Posner K, Brown GK, Stanley B, Brent DA, Yershova KV, Oquendo MA, Currier GW, Melvin GA, Greenhill L, Shen S, Mann JJ. *The Columbia-Suicide Severity Rating Scale: initial validity and internal consistency findings from three multisite studies with adolescents and adults.* Am J Psychiatry. 2011;168(12):1266-1277. Risk-band cross-checked against the Columbia Lighthouse Project ED Triage Screener (current, freely distributable for clinical use): low = Q1 or Q2 only; moderate = Q3, or lifetime Q6 not in past 3 months; high = Q4 or Q5, or Q6 in past 3 months. The screener is Joint-Commission and SAMHSA recommended for inpatient and ED suicide-risk screening.

`lib/scoring-v4.js cssrs()` validates each of the seven boolean items, enforces the Q6 / Q6a consistency (cannot be in past 3 months without lifetime), and bands per the Columbia Lighthouse Project ED Triage Screener.

## Boundary examples added

- All-no (tile example) -> "no risk reported".
- Q1 alone (wish dead) -> "low risk".
- Q2 alone (thoughts killing) -> "low risk".
- Q3 (methods) -> "moderate risk" (lower boundary of moderate band).
- Q4 (some intent) -> "high risk" (lower boundary of high band).
- Q5 (plan + intent) -> "high risk".
- Q6 lifetime alone (not in past 3 months) -> "moderate risk".
- Q6 + Q6a (in past 3 months) -> "high risk".
- Escalation: Q1+Q2 yes returns "low risk"; adding Q3 escalates to "moderate"; adding Q4 escalates to "high" (highest-tier-wins logic).

## Cross-implementation differential

- Reference: the Columbia Lighthouse Project ED Triage Screener (the standard reference for ED implementations) and the SAMHSA "Treatment Improvement Protocol 50" suicide-risk recommendations.
- Sophie result: every band-boundary worked example matches the published triage logic. PASS.
- The decision-support `action` line surfaces the band-appropriate next step (988 Lifeline for low; behavioral-health eval + safety planning for moderate; psychiatry now + 1:1 + lethal-means restriction for high) per the Columbia Lighthouse poster.

## Edge-input handling notes

- Non-boolean inputs throw (numeric 0/1 and string "yes" are not accepted; strict-typing guardrail per spec-v11 §3.1 step 4).
- Q6a yes with Q6 no is logically inconsistent and throws (the screener gates Q6a on a yes to Q6).
- Missing items throw.

## A11y / keyboard notes

- Seven checkboxes with verbatim question text (Q1-Q5 are the published Posner 2011 ideation items, Q6 and Q6a are the lifetime + past-3-months behavior items), all Tab-reachable; aria-live result region surfaces the band, the decision-support action line, and the banding source. `npm run test:a11y` clean.

## Defects opened

- none

## Status

- PASS
