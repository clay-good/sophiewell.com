# spec-v845 — Mitral Stenosis Stages A to D (ACC/AHA)

## What this gives you

Enter the valve area, the pressure half-time and the anatomy; get the stage. Enter the mean
gradient too, and the tile will tell you why it did not use it.

## §1 The stages

| | |
|---|---|
| **A** | At risk: mild doming of the valve in diastole, normal transmitral velocity, no commissural fusion |
| **B** | Progressive: commissural fusion with diastolic doming, area above 1.5 square cm, half-time below 150 ms |
| **C** | Asymptomatic severe: area of 1.5 square cm or less, **or** a half-time of 150 ms or more |
| **D** | Symptomatic severe: the same hemodynamics with reduced exercise tolerance or exertional breathlessness |

Very severe sits inside the severe range: area of 1.0 square cm or less, or a half-time of
220 ms or more.

## §2 The mean gradient does not grade mitral stenosis

The guideline notes it is typically above 5 to 10 mmHg when the disease is severe — but the
stage is defined by the **valve area and the pressure half-time**, and not by the gradient.

The reason is mechanical. A mitral gradient rises with heart rate and with cardiac output,
because both shorten diastole and push more flow through the valve per beat. Tachycardia
inflates it; a slow, low-output patient deflates it. The same valve reads differently on two
days.

So the tile takes the gradient, and takes the heart rate alongside it, and stages on neither.
Accepting the number and refusing to use it says more than leaving the field out — and when
the heart rate is above 100 or below 60 the tile names which direction the gradient is being
pulled.

## §3 The half-time has its own failure modes

The empirical area is 220 divided by the half-time. That relation breaks with significant
aortic regurgitation, immediately after balloon valvuloplasty, and wherever ventricular or
atrial compliance is abnormal. The tile states this whenever a half-time is entered.

And when the area and the half-time **disagree** about severity, it reports the disagreement
rather than silently preferring one. Either meets the definition, so the stage follows the one
that does — but that is a disagreement worth resolving before acting on it.

## §4 Stages A and B are an anatomy question, not a number

Both sit below the severe threshold; what separates them is commissural fusion. Given numbers
alone the tile stops short of a stage and asks for the anatomy rather than guessing.

## §5 The companion axis

`wilkins-score` scores whether a valve is suitable for balloon valvuloplasty, and
`mitral-valve-area-pht` computes the area this tile consumes. How severe the stenosis is and
what can be done about it are different questions; neither tile answers the other.

## §6 Sourcing (spec-v97 gate)

- Otto CM, Nishimura RA, Bonow RO, et al. 2020 ACC/AHA Guideline for the Management of
  Patients With Valvular Heart Disease. *Circulation.* 2021;143(5):e72-e227.

ACC and AHA are tracked issuers, so `docs/citation-staleness.md` carries a row.

## §7 Posture

Decision support, not a verdict. It applies a published staging to measurements already taken.
It does not select or adjust therapy.

Catalog 1636 → 1637.
