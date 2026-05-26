# v48 derivation provenance — DASH (`dash-vte`)

- Auditor: CG
- Date: 2026-05-26
- Wave: 48-4e
- Citation re-verified against: Tosetto A, Iorio A, Marcucci M, Baglin T, Cushman M, Eichinger S, Palareti G, Poli D, Tait RC, Douketis J. *Predicting disease recurrence in patients with previous unprovoked venous thromboembolism: a proposed prediction score (DASH).* J Thromb Haemost. 2012;10(6):1019-1025.

## Components — verbatim source mapping

Four weighted criteria, including a subtractive hormone-use term; range -2 to +4 per Tosetto 2012 §Methods.

| # | Criterion | Points |
|---|---|---|
| 1 | Abnormal post-anticoagulation D-dimer | +2 |
| 2 | Age < 50 years at index VTE | +1 |
| 3 | Male sex | +1 |
| 4 | Hormone use at time of initial VTE (women only) | -2 |

## Bands — source mapping (Tosetto 2012 Table 4)

| Range | Annual VTE-recurrence risk |
|---|---|
| <= 1 | 3.1%/yr (low) |
| 2 | 6.4%/yr (intermediate) |
| >= 3 | 12.3%/yr (high) |

## Population

Tosetto 2012: patient-level meta-analysis of 7 prospective cohort studies totaling 1818 adults with a first unprovoked VTE who had completed >= 3 months of anticoagulation; D-dimer measured after anticoagulation stopped. Outcome: symptomatic, objectively confirmed VTE recurrence over a median 22-month follow-up.

## Validity

Adults with a first unprovoked VTE evaluating indefinite-vs-time-limited continuation of anticoagulation. The -2 hormone modifier applies only to women whose index VTE occurred during estrogen-containing hormonal therapy (typically COCP or postmenopausal HRT). Not validated for provoked VTE, recurrent VTE, cancer-associated VTE, or pediatrics. Competing female-specific scores include HERDOO2 (Rodger 2017) and the Vienna nomogram.

## Source quote

"Patients with a low DASH prediction score (<= 1) had an annual risk of recurrence of 3.1% ... corresponding to a low enough risk to consider discontinuing anticoagulation." — Tosetto 2012 §Results.

## Renderer assertions

Verified locally:
- `META['dash-vte'].derivation` has every required field per `lib/derivation.js validate()` and exactly 4 components.
- Components sum equals `dashVte().score` at multiple boundary points including the negative-band case (hormone alone -> -2; D-dimer alone -> 2; D-dimer + age + male -> 4; D-dimer + age + hormone -> 1).
- The hormone -2 component fires correctly when the input is true.

## Defects opened
None.
