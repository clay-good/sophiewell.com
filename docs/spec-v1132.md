# spec-v1132 — the finder that could not see the defect it was written from

[spec-v1131](spec-v1131.md) fixed a default parameter that reached the answer as
prose: ROX printed *"failure-predicting at 12h"* for an hour nobody entered. That
is a shape, not an incident, so it deserves a finder:

> **Does any function print a DEFAULTED parameter's value into its own answer?**

The first version reported thirteen rows, all of them disclosed or benign, and
the wave was about to be written up as *measured and rejected*.

## Then it was pointed at the defect it came from

```
$ git show HEAD~1:lib/clinical-v4.js > /tmp/nt/lib/clinical-v4.js
$ cd /tmp/nt && node probe-default-in-answer.mjs
0 defaulted parameter(s) reach a prose string.
```

**Zero, on the pre-fix ROX.** The probe tracked one hop of aliasing —
`const x = ... param ...` — and the default reaches ROX's sentence in two:

```js
const hrRaw = Number(hoursAfterStart);          // hop 1
const hr = Number.isFinite(hrRaw) ? hrRaw : 12; // hop 2
band = `... at ${hr}h ...`;
```

Resolving aliases to a fixed point instead took the pre-fix file from 0 rows to
1 (ROX, correctly) and the live catalog from 13 to **23**. Ten rows had been
invisible, and one of them was a defect.

This is [spec-v1092](spec-v1092.md)'s lesson arriving again: *a finder's silence
is evidence about the finder until you have watched it speak.* The negative test
costs one command and it is the whole difference between a wave and a false
clean. **Run it before reading the report, not after.**

## `duke-treadmill` — a survival percentage for a test nobody described

```js
export function dukeTreadmill({ exerciseTime, stDeviation, anginaIndex = 0 })
```

The angina index is 0 (none), 1 (non-limiting) or 2 (exercise-limiting), and it
is multiplied by 4. So the default is the best of the three levels, worth **8
points on a scale whose middle band is 15 wide** — and omitting it produced an
answer identical to a patient who exercised without angina:

```
omitted   Duke treadmill score 4: moderate risk (DTS -10 to +4),
          95% 5-year survival (Mark 1987).
angina 0  Duke treadmill score 4: moderate risk (DTS -10 to +4),
          95% 5-year survival (Mark 1987).
```

Both surfaces could reach it: the adapter does not mark the field required, and
the page's select had no blank, so it opened on `0 — no angina`.

**The fix is a range, not a refusal** (rule 25). Three levels 4 points apart put
an unstated index inside a known 8-point window, so:

| Both ends of the window | What the tile does |
| --- | --- |
| in the same band | answers — *"between -26 and -18: high risk whatever the angina index turns out to be"* |
| in different bands | asks — *"worth up to 8 points, which puts this test between 4 and 12 — moderate risk at one end and low at the other"* |

The guard names the stake rather than the field, which is what makes it worth
answering.

## `Number('')` is 0, on all three surfaces

The same trap appeared three times in one tile and is now commented in each
place: the library (`String(v).trim() !== ''` before `Number`), the renderer
(`selVal(id) === '' ? null : Number(...)`), and the adapter's `to:` coercion,
which turned an empty enum value into the exact level the new guard exists to
refuse. **A guard in the library is worth nothing if the surface coerces the
blank away before it arrives.**

## The other twenty-two rows

Rejected on reading, and the reason is worth keeping: **a default is disclosed
when the control says what it means.** `heatstroke-decision` labels its checkbox
*"Sweating present (unchecked = anhidrotic / classic)"*; `sodium-correction`
offers *"Chronic / unknown onset (ceiling 8 mEq/L/24h)"*; `kings-college` prints
the lactate threshold its timing selects. Those are the model, not the problem.
The `vis` drug rates default to 0, where zero is a real "not running".
