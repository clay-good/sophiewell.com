# spec-v1091 — a grade is only as complete as the study behind it

[spec-v1090](spec-v1090.md) fixed `aortic-stenosis-stage`, where a missing valve
area was read as a valve area that was not small. Its two siblings have the same
defect one level out, and they are worth taking together because the mechanism
is the same in both and different from v1090's.

## The reading changes and nothing says why

Both tiles grade severity by taking the **worst** of several independent echo
measurements. `mitral-stenosis-stage` is an OR — an area of 1.5 cm² or less
**or** a half-time of 150 ms or more. `aortic-regurgitation-stage` is the
maximum over four quantitation criteria. Either way the grade is **monotone in
how many measurements were entered**, so a partial study can only under-call.

| Tile | Everything measured | One measurement absent |
|---|---|---|
| `mitral-stenosis-stage` | Stage **C** — asymptomatic severe stenosis | Stage **B** — "no severe obstruction" |
| `aortic-regurgitation-stage` | Stage **C** — asymptomatic severe regurgitation | Stage **B** — progressive moderate |

Same patient in each row. `pending` was `null` on both of the right-hand
readings: nothing named the measurement that had never been taken.

"No severe obstruction" is the phrase doing the damage. Nothing was obstructing
the number nobody has.

The aortic-regurgitation tile already carries a `disagreeNote`, which exists
*because* these four criteria disagree with each other — that is the tile
conceding that one of them does not stand for the rest. But it only fires once
two have been entered, so it says nothing in exactly the case where a single
criterion is being asked to speak for all four.

## A footing, not a refusal

This departs from v1090 on purpose. A routine study reports a vena contracta and
not the other three, and refusing to stage whenever the quantitation is partial
would break the ordinary case rather than the defective one. So each tile keeps
its stage and gains a sentence:

> Graded from 1 of 4 severity criteria; the regurgitant volume, regurgitant
> fraction and effective regurgitant orifice were not entered. The grade is the
> most severe of the criteria measured, so a criterion still missing can only
> raise it.

Where v1090 withheld an answer, this discloses one. The test for which shape
applies is whether the missing measurement is *expected* to be there: an aortic
valve area at a low gradient decides between moderate and severe and its absence
is a gap in the workup, while three unquantified regurgitation criteria are what
a normal report looks like.

Both footings live in the **library**, not the view — [spec-v1088](spec-v1088.md)'s
rule, so the agent surface gets the same words as the browser. Both are worded to
land inside the existing `DISCLOSING` vocabulary ("Graded from … of 4 … criteria",
"was not entered", "can only raise") rather than widening the shared list for two
tiles.

No staging outcome moves. The footing is additive, and every pre-existing
assertion about `stage` and `severity` in both tiles still holds.

## Where a severe reading stays silent

Neither tile discloses when it has already called the disease severe. That is
not an oversight: a severe grade from a subset is the floor, so the measurement
still missing cannot change it. The disclosure belongs to the reassuring
reading, which is the one that can be wrong.
