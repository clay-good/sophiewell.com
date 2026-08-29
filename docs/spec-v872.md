# spec-v872 — CDC/CSTE measles case definition

## What this gives you

The surveillance tier — suspect, probable, or confirmed — and the reminder that the tier is not
what decides the thing a suspected case actually needs.

## §1 The tiers

| | |
|---|---|
| **Suspect** | Any febrile illness accompanied by rash. That is the whole definition |
| **Probable** | The clinical criteria met, with no contributory laboratory testing and no epidemiologic link to a laboratory-confirmed case |
| **Confirmed** | An acute febrile rash illness with virus isolation, measles nucleic acid detected, a positive IgM, or IgG seroconversion; **or** a direct epidemiologic link to a laboratory-confirmed case |

**Clinical criteria**, in the absence of a more likely diagnosis: a temperature at or above
101 °F (38.3 °C); a generalized maculopapular rash lasting at least three days; and cough,
coryza, or conjunctivitis.

## §2 Suspect is any febrile rash illness

This is why the tile exists. The bar to place a patient in airborne isolation and notify public
health is far lower than the bar to classify a case, and neither waits on the other. That
sentence prints on every result, including the one that meets no tier.

## §3 The IgM has two failure modes, in opposite directions

- **A negative IgM in the first 72 hours after rash onset does not exclude measles.** It is drawn
  too early in a substantial share of real cases; nucleic acid detection from a throat or
  nasopharyngeal swab and urine is the more sensitive early test. Printed whenever no positive
  IgM is recorded.
- **A positive IgM alone is not conclusive where prevalence is low**, because its positive
  predictive value falls with incidence. Printed when a positive IgM stands without nucleic acid
  detection or an epidemiologic link.

## §4 Vaccination does not exclude measles

Only a rash **7 to 14 days after vaccination with vaccine strain identified** is a vaccine
reaction rather than a case. A vaccination history on its own is not that, and the tile says so
on every result.

## §5 Why the suspect tier has to exist

The clinical criteria ask for a rash lasting at least three days, so a patient seen on the first
day cannot yet meet them. Printed on the suspect result.

## §6 Sourcing (spec-v97 gate)

- Council of State and Territorial Epidemiologists / CDC. *Measles (Rubeola) Case Definition.*
  National Notifiable Diseases Surveillance System.

CDC is a tracked issuer, so a `docs/citation-staleness.md` row is owed and added.

## §7 Posture

Decision support, not a verdict. It applies a published surveillance definition to findings
already recorded. It does not diagnose measles, and it does not decide isolation or reporting,
both of which start on suspicion.

Catalog 1662 → 1663.
