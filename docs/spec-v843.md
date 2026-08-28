# spec-v843 — Blood Pressure Categories (ACC/AHA)

## What this gives you

Enter a systolic and a diastolic; get the category, plus the reason it landed there when the
two numbers disagree.

## §1 The categories

| | |
|---|---|
| **Normal** | Systolic under 120 **and** diastolic under 80 |
| **Elevated** | Systolic 120 to 129 **and** diastolic under 80 |
| **Stage 1 hypertension** | Systolic 130 to 139 **or** diastolic 80 to 89 |
| **Stage 2 hypertension** | Systolic 140 or more **or** diastolic 90 or more |

The 2025 guideline kept this table and the 130/80 diagnostic threshold the 2017 guideline
introduced. What changed around them was management, not the classification.

## §2 The higher of the two numbers decides, and that is why this computes

Where the systolic and the diastolic fall in different categories, the **higher one applies**.
So **135/95 is stage 2**, not stage 1 — and reading down the systolic column alone gets it
wrong on exactly the readings where it matters.

Printing the table would leave that rule to the reader. The tile applies it and names which
of the two pressures set the category.

## §3 There is no diastolic route to "Elevated"

Elevated is the only category defined by **and** rather than **or**: it needs a diastolic
below 80 as well as a systolic of 120 to 129. So **125/85 is stage 1 hypertension**, not
elevated — and "elevated" is the label most often reached for when a reading looks not quite
normal. The tile says so when it sees that shape.

## §4 Above 180/120 is reported alongside the category, not as one

The 2025 guideline calls a reading that high without acute target-organ damage **severe
hypertension**, the term it uses in place of *hypertensive urgency*. It is not a fifth
category, so the tile reports it next to the category rather than instead of it.

## §5 A category is not one reading

The guideline categorizes on the **average of at least two careful readings taken on at least
two occasions**. The tile states this on every result rather than letting a single entry read
as a diagnosis.

## §6 Sourcing (spec-v97 gate)

- Jones DW, Ferdinand KC, Taler SJ, et al. 2025 AHA/ACC Guideline for the Prevention,
  Detection, Evaluation and Management of High Blood Pressure in Adults.
  *Circulation.* 2025;152:e114-e218.

ACC and AHA are tracked issuers, so `docs/citation-staleness.md` carries a row noting the 2025
guideline retained the 2017 categories.

## §7 Posture

Decision support, not a verdict. It applies a published classification to readings already
taken. It does not select or adjust therapy.

Catalog 1634 → 1635.
