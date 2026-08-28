# spec-v846 — Aortic Regurgitation Stages A to D (ACC/AHA)

## What this gives you

Enter what the leak measures and what the ventricle measures; get the stage — and, when the
ventricle is what moved, a sentence saying so.

## §1 The stages

| | |
|---|---|
| **A** | At risk: a bicuspid or congenitally abnormal valve, dilated aortic sinuses or root, rheumatic change, or previous endocarditis, with no more than trace regurgitation |
| **B** | Progressive. Mild: vena contracta below 0.3 cm, volume below 30 mL, fraction below 30%, orifice below 0.10 square cm. Moderate: 0.3 to 0.6 cm, 30 to 59 mL, 30 to 49%, 0.10 to 0.29 square cm |
| **C1** | Asymptomatic severe with a compensated ventricle: ejection fraction 55% or more **and** end-systolic diameter below 50 mm |
| **C2** | Asymptomatic severe with the ventricle giving way: ejection fraction below 55%, **or** diameter above 50 mm, **or** indexed diameter above 25 mm per square meter |
| **D** | Severe with symptoms |

Severe is a vena contracta above 0.6 cm, a volume of 60 mL or more, a fraction of 50% or more,
or an orifice of 0.30 square cm or more, normally with holodiastolic flow reversal in the
proximal descending aorta.

## §2 C2 is reached by the ventricle, not the valve

A patient whose regurgitation has not changed at all moves from C1 to C2 when the ejection
fraction falls below 55% or the end-systolic diameter crosses 50 mm.

C2 is the line at which an asymptomatic patient is reconsidered. So an assessment that stops
at the valve misses the whole distinction that matters — and when the tile lands on C2 it
names which of the three ventricular numbers crossed.

## §3 The diameter threshold is absolute **or** indexed

An indexed end-systolic diameter above 25 mm per square meter reaches C2 on its own. That
route exists because 50 mm in a small-bodied patient is proportionally far more dilation than
50 mm in a large one, and reading the absolute number alone under-calls exactly those
patients.

The tile says so twice over: when only the indexed number crosses, and when the absolute
number is under the line and no indexed number was entered at all.

## §4 The severity criteria are a set, not a ladder

The guideline lists them together. This tile grades each criterion entered, reports the most
severe grade reached, and **says when they disagree** rather than quietly picking one. It also
reconciles the flow-reversal finding both ways: present when the numbers say moderate, and
absent when they say severe.

## §5 Sourcing (spec-v97 gate)

- Otto CM, Nishimura RA, Bonow RO, et al. 2020 ACC/AHA Guideline for the Management of
  Patients With Valvular Heart Disease. *Circulation.* 2021;143(5):e72-e227.

ACC and AHA are tracked issuers, so `docs/citation-staleness.md` carries a row.

## §6 Posture

Decision support, not a verdict. It applies a published staging to measurements already taken.
It does not select or adjust therapy. `el-khoury-ar` classifies the *mechanism* of the leak,
which is a different question.

Catalog 1637 → 1638.
