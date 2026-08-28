# spec-v839 — Atrial Fibrillation Stages (2023 guideline)

## What this gives you

Enter the risk factors, the documented pattern and the rhythm-control decision; get the stage.

## §1 The stages

| | |
|---|---|
| **1** | At risk — modifiable and non-modifiable risk factors, **no arrhythmia** |
| **2** | Pre-AF — structural or electrical findings that predispose, **still no arrhythmia** |
| **3A** | Paroxysmal — intermittent, terminating within 7 days |
| **3B** | Persistent — continuous beyond 7 days, requiring intervention to terminate |
| **3C** | Long-standing persistent — continuous beyond 12 months |
| **3D** | Successful ablation — free from AF after ablation or surgery |
| **4** | Permanent — no further attempts at rhythm control |

The 2023 guideline replaced a classification built on **duration** with one built on **stages
along a continuum**.

## §2 Permanent AF is a decision, not a duration

This is the error the staging exists to prevent, and the one most often committed anyway.

Stage 4 is defined by a **joint decision to stop pursuing rhythm control**. AF that has been
continuous for years remains **3C** while rhythm control is still being pursued, and becomes
permanent the moment that pursuit is abandoned — **at any duration**, paroxysmal included.

So "rhythm control abandoned" is its own input, kept separate from the pattern select. Folding
it into the duration options would *be* the error. When a case is 3C, the tile says explicitly
that this is **not** permanent and that staging on elapsed time would close off options the
guideline leaves open. Tested in both directions, including paroxysmal AF reaching stage 4.

## §3 The framework starts before the arrhythmia

Stages 1 and 2 describe patients with **no atrial fibrillation at all**. That is the point of
restaging the disease as a continuum: it makes prevention part of the classification rather
than something outside it. A tool that only classified documented AF has no way to express
half the framework.

## §4 Two smaller things

**3D is its own stage.** A patient free from AF after successful ablation is not unstaged and
has not returned to stage 2.

**The stages are a continuum, not a one-way ladder.** Patients move between them in both
directions, including *out* of stage 4 if rhythm control is taken up again — carried on every
staged result.

## §5 Sourcing (spec-v97 gate)

- Joglar JA, Chung MK, Armbruster AL, et al. 2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis
  and Management of Patients With Atrial Fibrillation. *Circulation.* 2024;149(1):e1-e156.
- All seven stages and both duration boundaries were corroborated across two independent
  sources before encoding.

ACC and AHA are tracked issuers, so `docs/citation-staleness.md` carries a row.

## §6 Posture

Decision support, not a verdict. It applies a published classification to a history already
taken. It does not choose anticoagulation or a rhythm-control strategy.

Catalog 1630 → 1631.
