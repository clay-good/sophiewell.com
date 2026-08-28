# spec-v847 — Primary Mitral Regurgitation Stages A to D (ACC/AHA)

## What this gives you

Enter what the leak measures and what the ventricle measures; get the stage — read against
the ejection-fraction threshold this disease actually uses.

## §1 The stages

| | |
|---|---|
| **A** | At risk: mild prolapse with normal coaptation, mild leaflet thickening, or previous endocarditis, with no more than a trivial jet |
| **B** | Progressive: vena contracta below 0.7 cm, regurgitant volume below 60 mL, fraction below 50%, orifice below 0.40 square cm |
| **C1** | Asymptomatic severe, compensated: ejection fraction **above 60%** **and** end-systolic dimension below 40 mm |
| **C2** | Asymptomatic severe, ventricle giving way: ejection fraction **60% or less**, **or** dimension 40 mm or more |
| **D** | Severe with symptoms |

Severe is a vena contracta of 0.7 cm or more, a volume of 60 mL or more, a fraction of 50% or
more, or an orifice of 0.40 square cm or more.

## §2 An ejection fraction of 60% is already dysfunction here

This is the whole reason the tile exists.

In mitral regurgitation part of every stroke goes **backwards into a low-pressure atrium**
instead of forwards against systemic afterload. The ventricle is unloaded, so the measured
ejection fraction flatters it. A normal value in severe mitral regurgitation is **above 60%**.

Read against the 50% threshold used almost everywhere else in cardiology, an ejection fraction
of 55% looks reassuring — and it is precisely the patient the guideline wants reconsidered.
So when the tile sees a fraction in that flattering band, it says so in as many words.

## §3 The dimension reaches C2 on its own

An end-systolic dimension of 40 mm or more is C2 even with a preserved ejection fraction,
because the ventricle dilating is the earlier signal and does not wait for the fraction to
fall. The tile names that case when it is the only one that crossed.

## §4 Primary regurgitation only, and it says so every time

These criteria are for a problem of the **valve itself** — prolapse, flail, rheumatic change,
endocarditis. **Secondary** regurgitation, where the valve is normal and the ventricle or
atrium has pulled it open, is staged against its own criteria, and its management is a
different question.

Applying primary thresholds to a secondary leak is a real and common error, so the scope is
stated on **every result** rather than left to be assumed from the tile's name.

## §5 The criteria are a set, not a ladder

As in `aortic-regurgitation-stage`: each criterion is graded, the most severe grade is
reported, and a disagreement between them is stated rather than silently resolved.

## §6 Sourcing (spec-v97 gate)

- Otto CM, Nishimura RA, Bonow RO, et al. 2020 ACC/AHA Guideline for the Management of
  Patients With Valvular Heart Disease. *Circulation.* 2021;143(5):e72-e227.

ACC and AHA are tracked issuers, so `docs/citation-staleness.md` carries a row.

## §7 Posture

Decision support, not a verdict. It applies a published staging to measurements already taken.
It does not select or adjust therapy. `carpentier-mr` classifies the *mechanism* of the leak,
which is a different question.

Catalog 1638 → 1639.
