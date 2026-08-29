# spec-v891 — Peak flow action-plan zones

## What this gives you

The zone a peak flow reading falls in, plus that patient's own zone boundaries in L/min.

## §1 Three zones, as a fraction of personal best

| | |
|---|---|
| **Green** | 80% or more of personal best |
| **Yellow** | 50% to below 80% |
| **Red** | Below 50% |

Every result also prints where those boundaries sit in L/min for the personal best entered, so
the number can be used without recomputing it.

## §2 The reference is the patient's personal best, not a predicted value

This is why the tile exists. A predicted peak flow comes from a population equation and can be
far from what a given person achieves when well; substituting it shifts **every** boundary at
once and can place a patient in the wrong zone in either direction. On every result.

## §3 A personal best is established while the patient is well

On treatment, over a period of measurement, and re-established periodically. A number recorded
during an exacerbation is not one. Whether it was established that way is an **input**, and when
it is not recorded the tile says every zone moves with it.

When the current reading exceeds the recorded personal best by more than 10%, the tile says the
personal best is probably out of date rather than that the patient is unusually well.

## §4 Symptoms override the number

The zones are one input to a written plan. A meter cannot see accessory muscle use, speech in
single words, or a silent chest, and severe symptoms in the green zone are still severe symptoms.
On every result.

## §5 Peak flow is effort- and meter-dependent

Compare like with like: the same meter, the same technique, the best of three attempts. On every
result.

## §6 Sourcing (spec-v97 gate)

- National Asthma Education and Prevention Program. *Expert Panel Report 3: Guidelines for the
  Diagnosis and Management of Asthma.* NIH Publication No. 07-4051; 2007.

The NAEPP is not in the tracked-issuer pattern, so no `docs/citation-staleness.md` row is owed.

## §7 Posture

Decision support, not a verdict. It computes a percentage against a reference the patient
supplies. It does not decide treatment, and it does not replace the written plan.

Catalog 1681 → 1682.
