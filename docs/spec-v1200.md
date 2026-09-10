# spec-v1200 — the three shapes the last wave named

[spec-v1199](spec-v1199.md) closed on three tiles in the early-warning family it
had not fixed, each wrong in a different way. This is those three.

## `meows` — an alarm from an impossible number

The function's own comment, written in [spec-v1036](spec-v1036.md), is the whole
argument:

> An alarm from nothing is not the safe direction; it is **a different wrong
> answer**.

It was applied to the empty chart and not to the impossible observation. Every
MEOWS band saturates, so a systolic of 3000 flags one red exactly as a survivable
extreme does:

```
sbp 3000  ->  MEOWS: trigger (1 red, 0 yellow). Activate the obstetric MEOWS response
```

A negative value already **threw** a `TypeError`, which the output-safety layer
turns into a bare `COMPUTE_ERROR`. Where `lib/bounds.js` declares an envelope it
now returns a refusal naming the range, in the same shape as the missing branch —
so the page reads it the way it already reads that one, and `valid: false` carries
it to an agent as a refusal. Oxygen saturation has no envelope in the table, so
that path is unchanged and still throws.

## `lods` — a dead end for the reader

`inRange(v, lo, hi)` returns null for blank, for non-numeric **and** for
out-of-range alike, and its callers read null as absent:

```
creatinine 250 mg/dL  ->  "Enter GCS, heart rate, systolic BP, BUN, creatinine, …"
```

Retype the same number and get the same sentence. That is the section
`scripts/probe-envelope-unbounded.mjs` keeps *apart* from the tiles that answer
from an impossible value, and LODS was **five of its rows**.

The range check now runs first and says something different:

> creatinine 250 is outside 0 to 40; WBC 9999 is outside 0 to 500. Check the value
> entered — this is not a missing measurement.

Every one is named, so a second retype is not needed to find the next. The ranges
are the ones this tile already declares; no clinical number is decided here.

That section reads **121 → 116**.

## `harvey-bradshaw` — the clamp on the fifth subscore

Four of the five ordinal subscores reported their clamp. `stools` did not:

```js
const clamped = wb.clamped || pn.clamped || ms.clamped || cx.clamped;
```

So a wellbeing of 999 carried "(a subscore was out of range and was clamped)" and
a stool count of 2,000,000 — silently capped at 1e6 — carried nothing at all.
Guard the set, not the four that were written.

The clamp itself stays. These are published ordinals with tiny ranges, clamping
is the conventional treatment, and the alternative would need a plausible ceiling
on stools per day that no source here supplies.

## Proof

The probe reads **132 → 129** fields and **77 → 76** calculators, and its second
section **121 → 116**. Lint, 13,490 unit tests, 448 MCP tests and four browser
sweeps pass.

## A test that pinned the old behaviour

```js
// A value that IS there and cannot be true still throws.
assert.throws(() => meows({ ...normal, hr: -5 }));
```

True when it was written and no longer the best behaviour available. It now
asserts the refusal, and keeps the `spo2` throw, which is genuinely unchanged.
Sixth test in this run recording the behaviour being fixed.
