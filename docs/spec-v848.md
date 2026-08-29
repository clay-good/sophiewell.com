# spec-v848 — Tricuspid Regurgitation Stages A to D (ACC/AHA)

## What this gives you

The stage, read against this valve's own thresholds — which are not the left side's.

This completes the four-valve set from the 2020 guideline: `aortic-stenosis-stage`,
`mitral-stenosis-stage`, `aortic-regurgitation-stage`, `mitral-regurgitation-stage` and now
this one.

## §1 The stages

| | |
|---|---|
| **A** | At risk: no or trace regurgitation, with a leaflet abnormality or the substrate for a secondary leak — annular dilation, right-sided remodeling, an intracardiac lead |
| **B** | Progressive mild to moderate regurgitation |
| **C** | Asymptomatic severe: jet area 10 square cm or more, vena contracta 0.7 cm or more, orifice 0.40 square cm or more, or volume 45 mL or more |
| **D** | Severe with the signs of right heart failure: ascites, peripheral edema, raised venous pressure, fatigue |

## §2 The thresholds are valve-specific, and that is the point

| | Tricuspid | Mitral | Aortic |
|---|---|---|---|
| Severe regurgitant volume | **45 mL** | 60 mL | 60 mL |
| Severe regurgitant orifice | **0.40 square cm** | 0.40 square cm | 0.30 square cm |

A reader who carries one valve's numbers across gets it wrong in both directions:

- **50 mL is severe here** and only moderate on the left side. Carrying the left-sided figure
  across **under-calls** a tricuspid leak — and the tricuspid valve is already the one most
  often under-called.
- **0.35 square cm is not severe here**, but it is on the aortic valve. Carrying that figure
  across **over-calls** it.

The tile raises each of those notes precisely in the band where the valves disagree, and every
numeric field carries its tricuspid threshold in its own label.

## §3 Usually secondary, and that does not change the numbers

Most tricuspid regurgitation is secondary: the valve is normal and the right ventricle, the
atrium or an intracardiac lead has pulled it open.

Unlike the mitral valve — where `mitral-regurgitation-stage` covers primary disease only and
secondary disease has its own table — a secondary tricuspid leak is staged against **these
same thresholds**. The tile records the mechanism because it governs what the finding means,
and says explicitly that the numbers are shared either way.

## §4 There is no C1 or C2 here

The mitral and aortic tables subdivide asymptomatic severe disease on ventricular function.
The tricuspid table does not, so this tile does not invent a split — and says so when it lands
on C, where a reader arriving from the sibling tiles would expect one.

## §5 Sourcing (spec-v97 gate)

- Otto CM, Nishimura RA, Bonow RO, et al. 2020 ACC/AHA Guideline for the Management of
  Patients With Valvular Heart Disease. *Circulation.* 2021;143(5):e72-e227.

ACC and AHA are tracked issuers, so `docs/citation-staleness.md` carries a row.

## §6 Posture

Decision support, not a verdict. It applies a published staging to measurements already taken.
It does not select or adjust therapy.

Catalog 1639 → 1640.
