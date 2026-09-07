# spec-v1098 — the last two, and what the finder has left

The finder's first section is empty of defects. It read **47 fields across 19
calculators** when it was written at [spec-v1092](spec-v1092.md) and reads **2
across 2** now, both of which are correct tiles it cannot help flagging.

## `nhsn-vae` named the gap without naming the measurement

It already explained itself — *"Why: the rise is unknown and 0 cmH2O of PEEP,
against thresholds of 20 and 3"* — which says a rise could not be computed and
not **which** of the four daily minimums was absent.

Oxygenation qualifies on the FiO2 route **or** the PEEP route, so an unentered
pair can only create an event, never remove one. And "no ventilator-associated
event" is not a bedside reading: it is a **surveillance denominator**, a number
that gets counted and reported. It now names each absent setting and says either
route can still qualify.

## `aortic-stenosis-stage`: my own guard was too narrow

[spec-v1090](spec-v1090.md) refused only at a **moderate** gradient, on the
reasoning that a velocity of 3.4 m/s with nothing else measured really is stage B
and refusing it would refuse the ordinary reading. That reasoning was right and
the scope drawn from it was not.

The same gap sits under the *milder* readings. A symptomatic patient whose
velocity reads at-risk, with no valve area entered, is still one whose severe
stages are defined by an area nobody measured — and severe stenosis at a **low
velocity** is precisely the low-flow pattern D2 and D3 exist to name. The tile
now adds a footing there (not a refusal: a low velocity with nothing else
measured really is stage A by the velocity criterion), and spec-v1090's
behaviour is unchanged.

**A fix scoped by one worked case is scoped to that case.** This is the third
time in this programme that a conclusion drawn from a single reading turned out
to be narrower than the defect.

## The two that remain are correct

| Tile | Why it is flagged | Why it is right |
|---|---|---|
| `sea-guideline` | supplying the sedimentation rate changes the recommendation | it is a decision tree; asking for the next test **is** its answer |
| `loe-silness-gingival-index` | one surface moves the index across 1.0 | it is a **mean**, not a sum |

`loe-silness` deserves the longer answer, because it looks like the tiles fixed
in [spec-v1093](spec-v1093.md) and is not one. The Gingival Index is the mean of
the surface scores, so an omitted bucket changes the **denominator** as well as
the numerator: leaving out the surfaces that scored 2 lowers the index, and
leaving out those that scored 0 raises it. There is no direction to disclose —
"can only rise" would simply be false — and the tile already prints "Mean of N
surface scores", so the count it worked from is on screen.

**A sum and a mean fail differently.** Every fix in this programme rests on a
score being monotone in the number of inputs, and that is a property to check
rather than assume.

## What the finder is for now

Both remaining rows are permanent. A future pass should read them, recognise
them from this page, and move on — which is the whole reason they are written
down rather than left to be rediscovered.

The second section (**49 fields across 31 calculators**) is a weaker signal by
construction: a verdict that moves without `abnormal` flipping. It is worth a
pass, but it is not a defect list.
