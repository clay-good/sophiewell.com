# spec-v1077 — a week nobody wrote down

The CDAI is the score that decides whether a Crohn's patient is in remission,
and four of its eight items are a diary the patient keeps for seven days.

Leave one of those four blank and the tile answered as if the week had been
symptom-free.

## What it did

`clampInt(v, lo, hi)` returns its **low bound** for anything non-finite, so an
unfilled tally arrived as `0`. On the shipped worked example, omitting the stool
count alone:

```
CDAI 265: moderate disease   ->   CDAI 215: mild disease
```

A band boundary, crossed downwards, on a diary nobody had kept. Moderate and mild
Crohn's activity are different conversations about escalating therapy.

The other three do the same at their own weights: abdominal pain ×5, general
well-being ×7, complications ×20.

## Why it is not simply "blank is zero"

It is the harder version of the rule, because **zero is a real answer here**. A
patient in remission genuinely reports no liquid stools all week. So the fix
cannot be "refuse a zero"; it has to keep a typed `0` meaning zero while treating
a blank as a gap — [spec-v1006](spec-v1006.md)'s rule 1, stated exactly.

The four terms are all non-negative with positive coefficients, so a partial
total is a **lower bound**: it may rule in, and must not rule out. That is why
the fix discloses rather than refuses — the number is still worth something, it
just is not the patient's CDAI.

## The reading now

| Input | Reading |
|---|---|
| all four entered | `CDAI 266: moderate disease (…).` |
| stool count **blank** | `CDAI 226: moderate disease (…). Scored from 3 of the 4 diary items -- the 7-day liquid-stool count was not entered, and can only raise the total, so treat this as a floor.` |
| stool count **`0`** | `CDAI 226: moderate disease (…).` — no caveat |

The last two compute the same arithmetic, as [spec-v930](spec-v930.md) requires
of a blank and an absent input, and say different things about it.

## Both surfaces

The renderer reads these with `field(...)` number inputs and hands the strings
straight to `cdaiCrohns`, so the browser had it too. The fix is in `lib/gi-v126.js`
and lands on the page and the agent tool together, like
[spec-v1076](spec-v1076.md) and unlike the three adapter waves before it.

## What holds it

One assertion in `test/unit/cdai-crohns.test.js` covering all three readings
above, including the one that is easy to lose in a refactor: **blank and zero
must still compute the same total** while only one of them discloses. Verified by
deleting the line that records a gap — the assertion fails, and passes on
restore.

The agent-side probe reads **95 fields across 52 calculators**, down from 99.
