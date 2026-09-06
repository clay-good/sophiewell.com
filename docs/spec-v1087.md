# spec-v1087 — the fix's clothes

[spec-v1078](spec-v1078.md) and the waves after it converted a dozen tiles from
sliders to number inputs, on the reasoning that a slider cannot say "not
answered".

A number input *can*. But only if it is rendered blank.

## What `isth-bat` did

The ISTH bleeding assessment tool scores fourteen bleeding domains 0 to 4. Its
renderer built each one as:

```js
field(label, id, { type: 'number', min: '0', max: '4', value: '0' })
```

— a number input **pre-filled with a zero**. So the reader met a form already
answered, and would have had to delete fourteen zeros to say "I have not asked
about any of this". The tile opened at:

> ISTH-BAT 0 — below the ≥ 4 adult male threshold: **within the normal range.**

and dropping one domain from the worked example took it from 5, *"abnormal
bleeding score"*, to 3, *"within the normal range"* — a bleeding-disorder screen
ruling normal on a question nobody put.

This is the slider defect wearing the fix's clothes, and it is invisible to
`slider-default-probe.spec.js`, which looks for `input[type=range]`.

## The finder, and the line it has to draw

`prefilled-default-probe.spec.js` reports a numeric input that opens with a value
**the tile's own worked example did not supply** — because a value from the
example is the example doing its job, and only a value the *renderer* invented is
a default.

Seven calculators. One was the defect. The distinction that sorts the rest:

> A default is fine where the number is a **setting** the reader adjusts. It is
> wrong where the number is an **observation**, because a pre-filled 0 is a
> finding nobody made.

| | |
|---|---|
| `mppr`, `apc-payment` | 50% — a policy rate fixed by rule, and both carry a matching placeholder |
| `medicare-cost-share`, `allowed-amount`, `nsa-cost-share` | coinsurance and deductible settings |
| `kdigo-aki` | anuria hours, and its label says *"(hours, default 0)"* — the tile discloses its own default |
| **`isth-bat`** | **fourteen bleeding domains** |

## The fix

The domains render blank with a `0-4` placeholder, and the library tells an
unrated domain from a domain rated 0. Every domain only adds points, so a partial
total is a floor — it may rule in, and must not rule out:

```
nothing rated   ISTH-BAT is at least 0 from 0 of 14 domains — below the >= 4 adult
                male threshold so far, but each domain still unrated can only add
                points, so a partial score cannot yet read as within the normal
                range. Rate epistaxis, cutaneous / bruising, ...

all 14 rated 0  ISTH-BAT 0 — below the >= 4 adult male threshold: within the
                normal range.

2 rated, over   ISTH-BAT 5 — at or above the >= 4 adult male threshold: abnormal
                bleeding score. Scored from 2 of 14 domains; the rest can only
                raise it.
```

The middle row is the one that has to survive: a bleeding history actually taken
and negative throughout still reads normal.

The worked example rated 2 of 14 domains, so an honest tile opened on a
disclosure. A bleeding history asks all fourteen; the other twelve are now rated
0, and the total is unchanged at 5.

## The lesson

> **A fix has a shape, and the shape can be copied without the substance.**
> "Use a number input" was shorthand for "let the control be empty". Thirteen
> tiles got the substance; this one had the shape already and none of it, which
> is why no probe written for the old shape could see it.
