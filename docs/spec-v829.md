# spec-v829 — Obesity Hypoventilation Syndrome (2019 ATS)

## What this gives you

Enter the BMI, the awake blood gas and the exclusions; get whether the 2019 ATS definition is
met — and, when no blood gas has been taken, whether the guideline's bicarbonate rule lets
you skip one.

## §1 The definition, all four

- Body mass index **≥30 kg/m²**
- Sleep-disordered breathing
- Awake **resting** PaCO2 **≥45 mmHg**, at sea level
- Other causes of hypoventilation excluded

The carbon dioxide criterion is specific in three ways that get dropped: **awake**, **resting**,
and **at sea level**. Oximetry does not answer this question, and altitude changes it.

## §2 The screening rule carries its population with it

The guideline offers a way to avoid an arterial puncture: in patients whose probability of
OHS is **low to moderate** — it puts this at <20%, illustrated by a **BMI of 30–40** — a serum
bicarbonate **<27 mmol/L** removes the need for a blood gas. At ≥27, measure the PaCO2.

**That rule is routinely applied outside its population.** In someone with a high pretest
probability — a BMI well above 40, or daytime somnolence with known severe sleep apnea — a
bicarbonate under 27 does **not** rule OHS out, and treating it as though it did skips the
arterial gas in exactly the patient most likely to be retaining CO₂.

A screening threshold borrowed out of its population is not a screening threshold. So the
tile treats high probability as a first-class input, infers it from a BMI above 40, and when
the rule does not apply it says so instead of returning the reassuring answer. Tested three
ways: low probability defers, a high BMI does not, and an explicit high-probability flag does
not.

## §3 Two things bicarbonate cannot do

**It cannot diagnose OHS, in either direction.** A raised bicarbonate is a reason to measure
the PaCO2, not a substitute for it — so at ≥27 the tile returns "measure the PaCO2", never a
diagnosis.

**It has no role once a blood gas exists.** Bicarbonate decides whether to draw the gas; with
the gas in hand the question is closed. The tile goes silent on screening once a PaCO2 is
supplied. Tested.

## §4 Sourcing (spec-v97 gate)

- Mokhlesi B, Masa JF, Brozek JL, et al. Evaluation and Management of Obesity Hypoventilation
  Syndrome. An Official American Thoracic Society Clinical Practice Guideline. *Am J Respir
  Crit Care Med.* 2019;200(3):e6-e24.
- The definition, the 27 mmol/L threshold and the <20% / BMI 30–40 population it belongs to
  were all taken from the guideline's own statements.

ATS is a tracked issuer, so `docs/citation-staleness.md` carries a row.

## §5 Posture

Decision support, not a verdict. It applies published criteria to results already obtained.
It does not start positive airway pressure or arrange a sleep study.

Catalog 1620 → 1621.
