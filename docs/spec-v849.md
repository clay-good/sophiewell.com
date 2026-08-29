# spec-v849 — Secondary Mitral Regurgitation Stages A to D (ACC/AHA)

## What this gives you

Enter what the leak measures in a patient whose valve is normal and whose ventricle is not;
get the stage — read against the **secondary** table, which is not the primary one.

## §1 The stages

| | |
|---|---|
| **A** | At risk: coronary disease or cardiomyopathy with a structurally normal valve, and no more than a small central jet |
| **B** | Progressive: orifice below 0.40 square cm, volume below 60 mL, fraction below 50% |
| **C** | Asymptomatic severe: orifice 0.40 square cm or more, volume 60 mL or more, or fraction 50% or more |
| **D** | Severe with heart failure symptoms that **persist after revascularization and optimized medical therapy** |

## §2 The 2014 thresholds are superseded, and reading them is the common error

The 2014 guideline called secondary regurgitation severe at an orifice of **0.20 square cm** and
a volume of **30 mL**. The 2017 focused update moved those lines to **0.40** and **60**, and the
2020 guideline kept them there — the same numbers as the primary table.

So an orifice of 0.25 square cm is severe under the old table and **moderate** under the current
one. That whole band is still read as severe in practice. The tile raises the point precisely
inside it.

## §3 There is no C1 or C2 here

The primary table subdivides asymptomatic severe disease on the ventricle: C1 above an ejection
fraction of 60% with a dimension below 40 mm, C2 below. The secondary table does not subdivide
at all.

That is not an omission. In secondary regurgitation the ventricular dysfunction is the **cause**
of the leak, not a consequence of it, so it cannot mark the point at which the valve has worn the
ventricle out. A low ejection fraction here is the underlying disease. The tile says so whenever
a fraction is entered against a severe leak, because a reader arriving from
`mitral-regurgitation-stage` will look for the split.

## §4 Stage D waits for the underlying disease to be treated

D is not "severe plus symptoms". The guideline reserves it for symptoms that persist **after**
revascularization and optimization of guideline-directed medical therapy, because in this disease
the leak is downstream of a ventricle that has not yet been treated.

When symptoms are present and that has not been recorded, the tile reports **C or D** and says
what is missing rather than picking one.

## §5 Scope is stated on every result

These criteria are for a **structurally normal valve** pulled open by ventricular or atrial
remodeling. Prolapse, flail, rheumatic change and endocarditis are primary disease and go to
`mitral-regurgitation-stage`. Crossing the two tables is a real error in both directions, so the
scope is printed on every result rather than left to the tile's name.

## §6 The criteria are a set, not a ladder

As in `mitral-regurgitation-stage`: each criterion is graded, the most severe grade is reported,
and a disagreement between them is stated rather than silently resolved.

## §7 Sourcing (spec-v97 gate)

- Otto CM, Nishimura RA, Bonow RO, et al. 2020 ACC/AHA Guideline for the Management of
  Patients With Valvular Heart Disease. *Circulation.* 2021;143(5):e72-e227.

ACC and AHA are tracked issuers, so `docs/citation-staleness.md` carries a row.

## §8 Posture

Decision support, not a verdict. It applies a published staging to measurements already taken.
It does not select or adjust therapy.

Catalog 1640 → 1641.
