# spec-v1096 — three gradings where the missing parameter was the deciding one

Three tiles from the finder's list, all grading on a **maximum over parameters**
and all reading an absent parameter as one that did not raise the grade.

| Tile | Missing | Took | To |
|---|---|---|---|
| `nen-who-grade` | Ki-67 index | NET **G1** | NET **G2** at Ki-67 6% |
| `amsler-krumeich` | refraction | stage **2**, moderate | stage **3**, severe |
| `niosh-lifting` | lift rate | index **0.96**, at or below 1.0 | index **1.03**, above it |

## The parameter is optional; the silence is not

Each of these fields is legitimately optional, and that is exactly why the defect
survived. The tiles were written to tolerate a missing parameter, and tolerating
it quietly became answering as though it had been measured and found reassuring.

`nen-who-grade` came closest to saying so already — *"NET G1 — graded on the
mitotic count alone"* names which index it used. But naming the parameter you had
is not the same as naming the direction the one you lack can move the answer, and
the WHO grade follows whichever index is **higher**, so it can only move up.

`amsler-krumeich` has the most interesting reason for its gap. Refraction is
optional because it is *"not measurable"* at stage 4 — a real fact about advanced
keratoconus, and the documented reason the field was made optional. But that
reasoning only holds **once the stage is 4**. Below it, an unmeasured refraction
is a gap, not an unmeasurable quantity, and the tile was applying stage 4's
excuse at stage 2.

## `niosh-lifting`: the best value in the table

A blank lift rate takes the frequency multiplier as **1.00** — not a neutral
default but the *best* value in the published frequency table, the multiplier for
a task with no frequency penalty at all. Every real rate reduces it. So the
recommended weight limit sits at its maximum and the lifting index at its
minimum, on the wrong side of the 1.0 line the entire number exists to be read
against.

## Where each stays quiet

All three are silent once the missing parameter cannot change the answer:

- `nen-who-grade` at G3, the top grade for a well-differentiated NET.
- `amsler-krumeich` at stage 4, where the refraction is unmeasurable by
  definition — the original reasoning, now applied only where it is true.
- `niosh-lifting` once the index is already above 1.0, since the frequency
  multiplier can only push it further that way.

## Result

The finder read 13 fields across 10 calculators after
[spec-v1095](spec-v1095.md) and reads **9 across 7** now.

Of those nine, four are tiles that already disclose or ask in wording the shared
lists miss — `hf-ef-classification` refuses with "an ejection fraction is
needed", `sea-guideline` answers "the next step is the sedimentation rate",
`delta-check` labels itself "No threshold entered", `modified-marshall` prints
"assessed: renal 0". That is the [spec-v1094](spec-v1094.md) question again, and
it needs the same measurement before touching a shared list: count where each
phrasing is used, and change the tile if it is one tile's idiom or the list if it
is the house's.
