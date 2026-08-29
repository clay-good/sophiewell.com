# spec-v873 — CDC two-tier Lyme serology algorithm

## What this gives you

What a pair of Lyme serology results actually means under the CDC algorithm, and the four things
about that algorithm that a bare "positive" or "negative" hides.

## §1 The algorithm

| Step | |
|---|---|
| **First tier** | An enzyme immunoassay or immunofluorescence assay. **Negative ends the testing.** Positive or equivocal calls for a second tier |
| **Second tier** | An IgM **and** IgG immunoblot — or, under the 2019 modified algorithm, a second, different enzyme immunoassay. An equal alternative, not a lesser test |
| **Positive** | A reactive first tier with a reactive IgG second tier, or with an IgM-only second tier **inside 30 days** of symptom onset |

## §2 Erythema migrans is a clinical diagnosis and should not be serology-tested

This is why the tile exists. Antibodies take weeks to appear, so a test drawn at the rash is
frequently negative in a patient who plainly has Lyme disease — and the negative then gets used
as an exclusion. The sentence prints on every result, and gets sharper when the rash is recorded.

## §3 The second tier is only interpretable after a reactive first tier

A standalone immunoblot means nothing. Printed whenever the first tier is negative or missing.

## §4 An IgM result counts only within 30 days of symptom onset

Beyond that, IgM reactivity without IgG is a false positive. The tile computes which side of the
window the entered day falls on, and says so — including the case where the days are not entered
at all, which makes an IgM-only result unreadable rather than positive.

## §5 Serology does not measure treatment response

Antibodies persist for years after successful treatment, so a repeat titer answers nothing about
cure. On every result.

One more read-back: a negative result inside the first two weeks of symptoms is *early*, not
exclusionary, and convalescent testing two to three weeks later is what settles it.

## §6 Sourcing (spec-v97 gate)

- CDC. *Recommendations for Test Performance and Interpretation from the Second National
  Conference on Serologic Diagnosis of Lyme Disease.* MMWR. 1995;44(31):590-591.
- Mead P, Petersen J, Hinckley A. *Updated CDC Recommendation for Serologic Diagnosis of Lyme
  Disease.* MMWR. 2019;68(32):703.

CDC is a tracked issuer, so a `docs/citation-staleness.md` row is owed and added.

## §7 Posture

Decision support, not a verdict. It applies a published testing algorithm to results already
obtained. It does not diagnose Lyme disease, and it does not decide whether to treat.

Catalog 1663 → 1664.
