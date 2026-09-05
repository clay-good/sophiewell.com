# spec-v1080 — the scale that runs the other way

First fix off [spec-v1079](spec-v1079.md)'s queue, and it needed different
reasoning from the stroke scales.

## Why the Braden could not just disclose

Every subscale scores 1 to 4 (friction 1 to 3) and a **higher total means less
risk**. That inverts both failure modes:

- Six sliders parked at their maxima gave **"Braden 23: not at risk"** for a
  patient nobody had assessed — the reassuring end, by default.
- Summing only the rated subscales is no better. It *understates* the total, so
  it reads as **more** risk than the patient has — and
  [spec-v1036](spec-v1036.md) settled that an alarm from nothing is not the safe
  direction either.

The stroke scales could disclose a floor because every item adds points or
leaves them alone, so a partial total is a true lower bound. On a scale with a
minimum of 1 per item and the reassuring end at the top, there is no honest
partial band in either direction.

So it asks:

> Braden not scored: rate **friction and shear**. All six subscales are needed —
> a higher total means LESS risk, so a partial sum reads as more risk than the
> patient has, and parking the unrated ones at their best reads as none.

Measured on the page: six number inputs, no sliders, and the three states
distinct — the example bands, an unassessed patient is asked for all six, and a
five-of-six form names the one it is waiting on.

The agent surface already declared all six `required`, so this was a browser-only
defect and closes without a new cross-surface disagreement.

## The worked example was the same defect, from the other side

`braden` opened on **23 of 23, "not at risk"** because its example set every
subscale to its best value. That is exactly what [spec-v1031](spec-v1031.md)
replaced across forty-seven tiles —

> They are wrong as an **opening screen**, because a reader who glances at a tile
> before filling it in sees the rule-out their patient has not earned.

— and that sweep could not see this one, because it looked for examples whose
every field was `0`. On an inverted scale the reassuring end is the **maximum**.

Asking the catalog the mirror question — which examples sit at every field's top
option — returns four tiles, and only two are the defect:

| Tile | All-max means | |
|---|---|---|
| `braden` | 23, "not at risk" | **fixed**: a plausible inpatient, 14, moderate risk |
| `barthel` | 100, "independent" | **fixed**: a rehab inpatient, 65, moderate dependency |
| `graeb-ivh` | 32 of 32, maximal haemorrhage burden | fine — the top is the alarming end |
| `four-ts-hit` | 8, high probability of HIT | fine — as above |

`barthel` needed no control change, only the example: a functional-independence
measure was opening on the reading that says there is nothing to plan for.

## What holds it

`test/unit/braden.test.js` pins all three states, including that a five-of-six
form names the missing subscale rather than banding. Verified by disabling the
absent check — the assertion fails, and passes on restore.

Changing the control also moved `braden` into the three whole-catalog sweeps that
only touch text and number inputs; all twelve shards pass.

## The lesson

> **A sweep for the reassuring reading has to know which way the scale runs.**
> "Every field is zero" found forty-seven tiles and could never have found these
> two, because their most reassuring answer is every field at its maximum. When
> a finder encodes a direction, something pointing the other way is invisible to
> it by construction.
