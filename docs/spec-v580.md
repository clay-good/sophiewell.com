# spec-v580.md — Modified EHRA symptom scale tile

> Status: **SHIPPED (2026-07-28).** Builds the `ehra-af` tile. Catalog **1429 → 1430**, group G.

## Why

A **companion gap — the missing axis**. The catalog already carries the atrial fibrillation **stroke** axis
(CHA₂DS₂-VASc), the **bleeding** axis (HAS-BLED, ATRIA, ORBIT) and the **recurrence** axis (HATCH, APPLE,
CAAP-AF, MB-LATER, CHARGE-AF). It had no **symptom** axis — the one the guideline makes a Class I
recommendation to record.

## What it does

| Class | Severity | Criterion |
| --- | --- | --- |
| 1 | None | AF causes no symptoms |
| **2a** | Mild | Daily activity **not** affected, patient **not** troubled |
| **2b** | Moderate | Daily activity **not** affected, patient **is** troubled |
| 3 | Severe | Daily activity affected |
| 4 | Disabling | Daily activity discontinued |

## The four rules a plausible implementation breaks

**1. There is no class 2.** The ladder is 1, 2a, 2b, 3, 4 — five levels with a **non-numeric label in the
middle**. The class must be a **string**. A test demonstrates the loss directly: 2a and 2b are distinct
classes, yet `parseInt` maps both to the same integer. Storing it numerically destroys the very distinction
the modification exists to draw.

**2. 2a and 2b share the same objective criterion.** Both are "daily activity not affected". They are
separated *only* by whether the patient is **troubled**. Everywhere else the discriminator is **function**;
at this one boundary it is **subjective** — deliberately, because that is the boundary the modification was
created to draw. The tile asks it separately, and only when activity is unaffected. A test asserts the
troubled answer does *not* move a class already decided by function.

**3. The six evaluated symptoms are not inputs.** Palpitations, fatigue, dizziness, dyspnea, chest pain and
anxiety are the **domains** the rater weighs; the class depends only on activity impact. A test passes
symptom flags and asserts the class is unchanged.

**4. It is physician-assessed, not patient-reported.** The guideline states it does not consider anxiety,
treatment concerns or medication adverse effects, and that physician and patient assessments **frequently
diverge**. A class is a clinician's judgment about activity, not the patient's account of how they feel.

## A naming inconsistency, carried

The 2020 guideline titles its table "EHRA symptom scale" while the recommendation in the **same document**
says "**modified** EHRA symptom scale". One instrument, two names — noted so it is not mistaken for two
(spec-v97).

## Scope (spec-v11 §5.3)

It classifies **symptom burden**. It does not diagnose atrial fibrillation, which needs an ECG recording.
**It says nothing about stroke risk** — a completely asymptomatic class 1 patient can carry a high
CHA₂DS₂-VASc score, anticoagulation is decided on that axis, and reading a low symptom class as reassurance
about stroke is the most damaging misreading available here. It does not select rate versus rhythm control,
does not indicate ablation, and does not grade arrhythmia burden in time, which is a separate measurement.

## Files

- `lib/ehra-af-v580.js` — `ehraAf()`, `EHRA_CLASSES`, `ACTIVITY_LEVELS`, `EVALUATED_SYMPTOMS`.
- `views/group-v580.js` (RV580) — the 2a/2b split asked as its own question under its own **h2**, so the
  subjective step is visible rather than buried in a five-way pick.
- `mcp/adapters/ehra-af-v580.js` — wave 405.
- `test/unit/ehra-af.test.js` — 17 tests.
- `docs/spec-v580.md` (this file).

## Sourcing (spec-v97)

Two sources agree on every class; the guideline adds only a "related to AF" qualifier.

- Wynn GJ, Todd DM, Webber M, et al. *Europace.* 2014;16(7):965-972.
- Hindricks G, Potpara T, Dagres N, et al. *Eur Heart J.* 2021;42(5):373-498, Table 6.
