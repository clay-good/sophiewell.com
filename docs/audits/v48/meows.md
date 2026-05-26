# v48 derivation provenance — MEOWS (`meows`) — formula-only

- Auditor: CG
- Date: 2026-05-26
- Wave: 48-3c
- Citation re-verified against: Singh A, McGlennan A, England A, Simons R. *A validation study of the CEMACH recommended modified early obstetric warning system (MEOWS).* Anaesthesia. 2012;67(1):12-18.

## Why formula-only

MEOWS is a **track-and-trigger chart**, not an aggregate-sum score. Each vital sign is classified independently as normal / yellow / red per Singh 2012 Table 1, and the trigger fires on the *boolean* condition `(≥1 red) OR (≥2 yellow)` — not on a sum. Reducing the per-parameter classifications into an additive `components` array would misrepresent the trigger logic.

Therefore wave 48-3c ships MEOWS as a formula-only derivation block (no `components`), following the MELD-3.0 and GUSS precedent. The Sophie result block separately surfaces per-parameter flags and the trigger evaluation.

## Formula — verbatim source mapping

From Singh 2012 Table 1.

```
Respiratory rate (per min):     red <10 or >30; yellow 21-30; otherwise normal
SpO2 (%, room air):             red <95; otherwise normal
Temperature (°C):               red <35 or >38; yellow 35-35.9; otherwise normal
Systolic BP (mmHg):             red <90 or >160; yellow 90-100 or 150-160; otherwise normal
Diastolic BP (mmHg):            red >100; yellow 90-100; otherwise normal
Heart rate (per min):           red <40 or >120; yellow 40-50 or 100-120; otherwise normal
Neuro response (ACVPU/AVPU):    red P or U; yellow V; otherwise normal
Pain score (0-3):               yellow >=2; otherwise normal

Trigger: (>=1 red) OR (>=2 yellow).
```

## Bands

| Trigger evaluation | Sophie label |
|---|---|
| no trigger | continue routine maternal observations per local protocol |
| trigger fired | activate the obstetric MEOWS response per Singh 2012 — escalate to the on-call obstetric / anaesthetic team and re-assess |

## Population

Singh 2012: validation in 676 obstetric admissions to a UK tertiary obstetric unit. Reference standard: morbidity per CEMACH (UK) criteria. Sensitivity 89%, specificity 79% for obstetric morbidity at the published trigger threshold.

## Validity

Pregnant or postpartum (≤6 weeks) adults. MEOWS is a track-and-trigger chart, not an aggregate-sum score — the Sophie derivation block ships formula-only because the per-parameter classifications and the OR/AND trigger logic are not faithfully representable in an additive `components` array. The Sophie tile separately surfaces the per-parameter flags and the trigger evaluation. NOT validated outside pregnancy / immediate postpartum (use NEWS2 for non-obstetric adults).

## Source quote

"The modified early obstetric warning system (MEOWS), recommended by the Centre for Maternal and Child Enquiries, was associated with a sensitivity of 89% (95% CI 81-95%) and a specificity of 79% (95% CI 76-82%) for the prediction of morbidity." — Singh 2012 §Abstract.

## Renderer assertions

Verified locally:
- `META.meows.derivation` has every required field per `lib/derivation.js validate()`.
- `components` is intentionally absent — the schema test asserts this is the formula-only shape.
- `bands` correctly use the two-tier trigger stratification.

## Defects opened
None.
