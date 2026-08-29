# spec-v851 — Rassi Score (death in chronic Chagas heart disease)

## What this gives you

Six findings, six numbers, one ten-year mortality band — for a disease whose prognosis at any
given functional class is worse than the cardiomyopathies most scores were built on.

## §1 The score

| | |
|---|---|
| NYHA class III or IV | 5 |
| Cardiomegaly on chest radiograph | 5 |
| Segmental or global wall-motion abnormality on echocardiography | 3 |
| Nonsustained ventricular tachycardia on 24-hour Holter | 3 |
| Low QRS voltage on the ECG | 2 |
| Male sex | 2 |

Total 0 to 20.

| Score | Risk | 10-year mortality |
|---|---|---|
| 0-6 | Low | 10% |
| 7-11 | Intermediate | 44% |
| 12-20 | High | 84% |

## §2 There is no ejection fraction in it

A reader arriving from any other cardiomyopathy score will look for one and not find it.

The model carries ventricular function as two coarse terms instead — cardiomegaly on a **chest
radiograph** and a binary **wall-motion abnormality** on echo. It was derived where those were
the tests actually available, and it was validated as it stands. Substituting an ejection
fraction for either term is not this score.

The tile says so on every result, because the absence looks like an omission and is not one.

## §3 "Low risk" here is a 10% chance of being dead in ten years

In a cohort whose mean age was 47. The band names are relative to this disease, not to a
general population, so the tile prints the figure next to the word every time rather than
letting "low" carry the meaning alone.

## §4 Male sex is a term in the model

Two points. It is unusual and it is deliberate, so the tile records it as a scored finding
rather than as a demographic field it happens to collect.

## §5 What it predicts, and what it does not

All-cause death. Not sudden death specifically, and not the need for a defibrillator, a
pacemaker or transplantation. Stated on every result.

## §6 Sourcing (spec-v97 gate)

- Rassi A Jr, Rassi A, Little WC, et al. Development and validation of a risk score for
  predicting death in Chagas' heart disease. *N Engl J Med.* 2006;355(8):799-808.

Not a tracked guideline issuer, so no staleness row.

## §7 Posture

Decision support, not a verdict. It reports a published score and the published mortality
figures that go with it.

Catalog 1642 → 1643.
