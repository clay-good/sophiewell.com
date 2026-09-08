# spec-v1141 — twelve points against bands five points wide

Re-running `probe-omitted-field-decides` after [spec-v1137](spec-v1137.md) took
its first section from 17 rows to 13. Most of what remains discloses honestly —
*"is recorded"*, *"from what is recorded"*, *"not met by what was entered"*, or
the unit named in the reading. One did not.

## `elapss`

```js
const locKey = ELAPSS_LOC[input.location] != null ? input.location : 'icaAcaAcom';
const popKey = ELAPSS_POP[input.population] != null ? input.population : 'na';
```

Both fall back to their **zero-point** level: an ICA/ACA/ACOM aneurysm in a North
American cohort. Location is worth 0 to 5 and population 0 to 7 — **twelve points
between them, against risk bands five points wide.**

```
age 60, 7 mm aneurysm, nothing else stated
  ELAPSS 14/40: aneurysm growth risk ~11.7% at 3 years, ~19.3% at 5 years.

the same patient, if PCOM/posterior and Finnish
  ELAPSS 26/40: aneurysm growth risk ~42.7% at 3 years, ~60.8% at 5 years.
```

Which artery the aneurysm sits on and which cohort the patient belongs to are
**known facts**, not optional extras — and the tile's own refusal message already
said so:

> Enter the patient age (years) and the aneurysm size (mm), **then choose the
> earlier-SAH, location, population, and shape items**, to compute the ELAPSS
> score.

Rule 23 again: the message lists them, and then the tile answered without them.
Third time this programme has found that shape after
[spec-v1120](spec-v1120.md) and [spec-v1137](spec-v1137.md).

## Disclosing the range, not withholding it

Here the percentage **is** the verdict, so a refusal would leave the reader with
nothing where the honest answer is a span. Following `euroscore2` and
`impede-vte`:

| | |
| --- | --- |
| both unstated | *ELAPSS **14 to 26** of 40: the location and the population are not stated, and together they are worth 12 points. Growth risk between ~11.7% and ~42.7% at 3 years…* |
| one stated | *…the population is not stated, and it is worth 7 points* |
| range inside one band | *ELAPSS **at least 27**/40: growth risk ~42.7% at 3 years… which holds whatever the location and the population turn out to be* |
| both stated | unchanged |

The last row is rule 25: at the top of the table every extra point lands in the
same row, so the reading stands and the tile says so rather than hedging.

## The correction I made mid-wave

I first tested the library with `elapss({ age: 60, sizeMm: 7 })`, saw a refusal,
and reported that the library was correct and the **adapter** was at fault. The
argument is `size`, not `sizeMm` — the refusal I saw was the missing-size guard,
not the guard I was looking for. The library was wrong all along.

**A guard that fires for the wrong reason looks exactly like the guard you were
hoping for.** When a probe and a hand-check disagree, the hand-check is the one
to distrust: the probe drives the tile through the same adapter a caller does,
and it had the argument names right.
