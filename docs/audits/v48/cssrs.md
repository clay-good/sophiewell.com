# v48 derivation provenance — C-SSRS Screener (`cssrs`) — formula-only

- Auditor: CG
- Date: 2026-05-26
- Wave: 48-3d
- Citation re-verified against: Posner K, Brown GK, Stanley B, et al. *The Columbia-Suicide Severity Rating Scale: initial validity and internal consistency findings from three multisite studies with adolescents and adults.* Am J Psychiatry. 2011;168(12):1266-1277. Risk bands per the Columbia Lighthouse Project ED Triage Screener.

## Why formula-only

C-SSRS Screener risk-band is determined by **logic**, not by an additive sum. The Sophie scoring function returns a band string (`'no risk reported' | 'low risk' | 'moderate risk' | 'high risk'`), not a numeric score. Surfacing this as an additive `components` array would misrepresent the underlying algorithm.

Therefore wave 48-3d ships C-SSRS as a formula-only derivation block (no `components`), following the MELD-3.0, GUSS, MEOWS, and CAM precedents.

## Formula — verbatim source mapping

From the Columbia Lighthouse Project ED Triage Screener (the form Sophie implements):

```
Q1 — Past month: wish you were dead or could go to sleep and not wake up?
Q2 — Past month: any thoughts of killing yourself?
Q3 — Past month: thoughts about HOW you might do this (methods, no plan)?
Q4 — Past month: thoughts with SOME INTENTION of acting on them?
Q5 — Past month: PLAN and INTENT to kill yourself?
Q6 — Lifetime: ever done, started, or prepared to do anything to end your life?
  Q6a — If yes to Q6: within the past 3 months?

Banding (first matching condition, top-down):
  HIGH risk      : Q4 OR Q5 OR Q6a
  MODERATE risk  : Q3 OR (Q6 AND NOT Q6a)
  LOW risk       : Q1 OR Q2
  NO RISK REPORTED: none of the above
```

## Bands — source mapping

| Band | Algorithm condition | Sophie action text |
|---|---|---|
| no risk reported | none of the above | rescreen per local protocol |
| low risk | Q1 OR Q2 | behavioral health follow-up; share 988 |
| moderate risk | Q3 OR (Q6 AND NOT Q6a) | BH evaluation; safety plan before discharge; restrict lethal means |
| high risk | Q4 OR Q5 OR Q6a | immediate BH / psychiatry; consider 1:1 observation; restrict lethal means |

## Population

Posner 2011: 124 adolescents and adults across three multisite studies (NIMH Treatment of Adolescent Suicide Attempters Study, Columbia University DBT Trial, Multisite Cross-Sectional Study). The C-SSRS family of instruments (Lifetime/Recent, Since Last Visit, Screener) is endorsed by FDA, Joint Commission, SAMHSA, and the Columbia Lighthouse Project for clinical and research use.

## Validity

Adolescents and adults across clinical settings (ED, inpatient, outpatient). The Sophie derivation block ships formula-only because the C-SSRS Screener band is determined by LOGIC, not an additive sum. The C-SSRS Screener is a TRIAGE instrument; a positive screen warrants formal suicide-risk evaluation per institutional protocol. The Sophie scoring function enforces that Q6a cannot be true if Q6 is false (the past-3-months follow-up only applies if lifetime behavior is reported).

## Source quote

"The C-SSRS demonstrated good convergent and divergent validity ... predictive validity for suicidal behavior, and sensitivity to change in research and clinical applications." — Posner 2011 §Abstract.

## Renderer assertions

Verified locally:
- `META.cssrs.derivation` has every required field per `lib/derivation.js validate()`.
- `components` is intentionally absent — the schema test asserts this is the formula-only shape.
- `bands` document each algorithm branch alongside the recommended action.

## Defects opened
None.
