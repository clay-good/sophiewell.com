# spec-v1158 — anuria for fourteen hours, and "does not meet AKI criteria"

Found by running `prefilled-default-probe.spec.js`, which had not been run since
this session started fixing pre-filled zeros. It flagged four numeric inputs
opening with a value the worked example did not supply. Three are statutory
settings and correct by the probe's own rule — the 50% MPPR reduction, zero
lifetime-reserve days elected, the 50% OPPS discount. The fourth was
`kdigo-aki`'s **anuria duration**, opening at `0`.

Reading it found two defects, and the pre-filled zero was the smaller one.

## Anuria ≥ 12 h is Stage 3 on its own

KDIGO's urine-output criterion for stage 3 is *"< 0.3 mL/kg/h for ≥ 24 h **OR**
anuria for ≥ 12 h"*. The code had the anuria test **inside** a gate requiring the
mL/kg/h figure and its duration:

```js
if (uoMlPerKgPerHour != null && uoDurationHours != null) {
  if (anuriaHours >= 12 || (uoMlPerKgPerHour < 0.3 && uoDurationHours >= 24)) uoStage = 3;
```

So a patient with **fourteen hours of documented anuria** and a normal creatinine
read:

> Creatinine sub-stage: 0 · Urine output sub-stage: 0 · **Does not meet KDIGO AKI
> criteria.**

Anuria is a urine output of zero by definition and needs no second figure. This is
worse than a blank-field defect: the reader **entered** the finding and the tile
discarded it.

## A sub-stage of 0 for a urine output nobody measured

With neither urine-output field given, `uoStage` stayed `0` — indistinguishable
from a normal output — and the interpretation went on to rule AKI out entirely.
Rule 3: an incomplete assessment may rule in and never out. It is `null` now, and
the reading says which half it saw:

| | |
| --- | --- |
| creatinine rules in, no urine output | *"KDIGO AKI Stage 3. The urine output was not assessed, so the stage rests on the creatinine alone and can only rise."* |
| creatinine normal, no urine output | *"…the urine output has not been assessed — enter the urine output (mL/kg/h) with its duration, or the hours of anuria … this cannot yet rule AKI out."* |
| anuria stated but under 12 h | *"…4 h of anuria is short of the 12 h that makes stage 3 on its own…"* |
| urine output measured and normal | *"Does not meet KDIGO AKI criteria."* — unchanged |

`anuriaHours = 0` was a **default parameter**, so *"no anuria"* and *"nobody asked
about anuria"* were the same value — rule 21, and the reason the message could not
tell them apart. It is `null`, and the field is a placeholder rather than a value
(rule 8).

## And the disclosure leaked its own null

The view interpolated the sub-stage straight into the reading, so the first version
of this fix put the literal token **`null`** on screen. Rule 26: a disclosure is
output, and output built from a value the tile withheld is a leak
([spec-v53](spec-v53.md) output safety). Caught by looking at the page rather than
the library.

## The probe now prints its reach

`3 calculator(s)` is a number with no scale, and if a view ever moved to a custom
control the count would fall and read as an improvement:

```
Reach: 2828 number input(s) across 857 of 1706 tiles.
```

The other 849 are built of selects, checkboxes and sliders, which this probe cannot
see — `slider-default-probe.spec.js` is the one that looks at those.
