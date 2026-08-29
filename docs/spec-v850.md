# spec-v850 — RoPE Score (Risk of Paradoxical Embolism)

## What this gives you

A patient has had a cryptogenic stroke and a patent foramen ovale has been found. The RoPE
score answers **whether that hole is the cause or a coincidence** — not how likely another
stroke is.

## §1 The score

| | |
|---|---|
| No history of hypertension | 1 |
| No history of diabetes | 1 |
| No history of stroke or TIA | 1 |
| Nonsmoker | 1 |
| Cortical infarct on imaging | 1 |
| Age 18-29 / 30-39 / 40-49 / 50-59 / 60-69 / 70+ | 5 / 4 / 3 / 2 / 1 / 0 |

Total 0 to 10.

## §2 A high score is not high risk. It is the opposite

This is the whole reason the tile exists.

The score estimates the **PFO-attributable fraction**: the share of strokes at that score in
which the hole is doing the work rather than sitting there incidentally. It rises from 0% at
a score of 0-3 to 88% at 9-10.

Two-year recurrence runs the **other way** — 20% at 0-3, and 2% at 9-10. A patient whose
stroke is most clearly caused by the PFO is the patient least likely to have another one,
because they have no vascular disease driving them.

Read as a risk score, every number in it points the wrong way. The tile states the direction
on every result rather than leaving it to be inferred from the bands.

| Score | PFO attributable | 2-year recurrence |
|---|---|---|
| 0-3 | 0% | 20% |
| 4 | 38% | 12% |
| 5 | 34% | 7% |
| 6 | 62% | 8% |
| 7 | 72% | 6% |
| 8 | 84% | 6% |
| 9-10 | 88% | 2% |

The attributable fraction is not monotonic — 5 sits below 4 — and the tile says so where it
lands rather than smoothing the published table.

## §3 Age is most of the score

Age alone contributes up to 5 of the 10 points, and the four history items are all "absence of
vascular disease", which is itself age-correlated. A young score is high because young patients
rarely have another cause, not because the hole is bigger. The tile names this whenever age
supplies half the total or more.

## §4 What it does not do

It does not detect a PFO, it does not grade a shunt, and it does not select closure. It applies
only to a patient in whom a cryptogenic stroke has already been diagnosed **and** a PFO already
found. Stated on every result.

## §5 Sourcing (spec-v97 gate)

- Kent DM, Ruthazer R, Weimar C, et al. An index to identify stroke-related vs incidental
  patent foramen ovale in cryptogenic stroke. *Neurology.* 2013;81(7):619-625.

Not a tracked guideline issuer, so no staleness row.

## §6 Posture

Decision support, not a verdict. It reports a published index and the published figures that
go with it.

Catalog 1641 → 1642.
