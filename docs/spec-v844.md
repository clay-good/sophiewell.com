# spec-v844 — Aortic Stenosis Stages A to D (ACC/AHA)

## What this gives you

Enter the velocity, the gradient, the area, the ejection fraction and the flow; get the stage,
and — when the gradient is low but the valve is small — a reason not to stop reading.

## §1 The stages

| | |
|---|---|
| **A** | At risk: a bicuspid or congenitally abnormal valve, or aortic valve sclerosis, with a peak velocity below 2.0 m/s |
| **B** | Progressive. Mild at 2.0 to 2.9 m/s with a gradient below 20 mmHg; moderate at 3.0 to 3.9 m/s or a gradient of 20 to 39 mmHg |
| **C1 / C2** | Asymptomatic severe at 4.0 m/s or a gradient of 40 mmHg. C1 with an ejection fraction of 50% or more, C2 below 50% |
| **D1** | Symptomatic severe at a high gradient, with an area of 1.0 square cm or less |
| **D2** | Symptomatic severe at a **low flow and low gradient**: area 1.0 or less, velocity below 4.0, gradient below 40, ejection fraction below 50% |
| **D3** | Symptomatic severe at a **low gradient with a normal ejection fraction**: area 1.0 or less **and** indexed area 0.6 or less, stroke volume index below 35 |

## §2 A low gradient does not exclude severe stenosis, and that is the whole tile

D2 and D3 are severe disease sitting **below 4 m/s and below 40 mmHg**. Reading the gradient
alone calls both of them moderate — which is the one error worth building a tile to prevent.

A small valve area with a low gradient means the ventricle is not generating enough flow to
raise a gradient. It does not mean the valve is open.

So when the tile sees an area of 1.0 square cm or less at a low gradient, it says so before it
says anything else, and it names what is still missing: without the ejection fraction and the
stroke volume index, D2 and D3 cannot be told apart from moderate stenosis at all.

## §3 The velocity and the gradient are an OR

The more severe of the two decides. Where they disagree the tile names the one that decided —
because a single low number is exactly what makes a reader stop looking.

## §4 This is the axis `aortic-valve-area` does not cover

That tile computes the area from the continuity equation and bands it on **area alone**. It
says in as many words that low-flow and low-gradient states need integrated assessment. This
is that assessment: flow, gradient, ejection fraction and symptoms together. The two are
cross-linked rather than duplicated.

## §5 D2 and D3 require symptoms

Neither is a stage an asymptomatic patient can be in. A low-gradient small-area reading
without symptoms is reported as **the pattern it is**, not pushed into a stage the guideline
does not define.

Two confirmations ride along with those stages, because neither is decided on the numbers
alone: D2 needs low-dose dobutamine stress echocardiography to separate true severe from
pseudo-severe, and D3 should be judged with the patient normotensive.

## §6 Sourcing (spec-v97 gate)

- Otto CM, Nishimura RA, Bonow RO, et al. 2020 ACC/AHA Guideline for the Management of
  Patients With Valvular Heart Disease. *Circulation.* 2021;143(5):e72-e227.

ACC and AHA are tracked issuers, so `docs/citation-staleness.md` carries a row.

## §7 Posture

Decision support, not a verdict. It applies a published staging to measurements already taken.
It does not select or adjust therapy, and the severity adjudication stays with the
echocardiographer and the heart team.

Catalog 1635 → 1636.
