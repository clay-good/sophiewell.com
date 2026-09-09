# spec-v1166 — the waist bands are sex-specific, and the sex had a default

The row [spec-v1165](spec-v1165.md) named as still owed a read.

```js
const sex = o.sex === 'male' ? 'male' : 'female';
```

FINDRISC's waist bands are sex-specific — **94 / 102 cm for men, 80 / 88 for
women** — and an unstated sex became a female one. A waist of 90 cm scores **0
points as a man and 4 as a woman**:

| | FINDRISC | 10-year type-2-diabetes risk |
| --- | --- | --- |
| male | 9 | slightly elevated, ≈ 4% |
| female | 13 | moderate, ≈ 17% |
| **unstated** | **13 — the female bands** | ≈ 17% |

A silent default of a known fact, in the alarming direction, and the same shape
[spec-v1116](spec-v1116.md) fixed on `lvh-criteria`'s Cornell threshold.

The waist is the only term that reads the sex, so the rest of the score stands and
that term waits — spec-v1045's *"answer with the halves you have"*. The reading gives
the range and says why:

> FINDRISC 9 to 13 of 26: the sex is not stated, and the waist bands are
> sex-specific (94 / 102 cm for men, 80 / 88 for women), so a waist of 90 cm scores 0
> points as a man and 4 as a woman.

Where **both** bands give the same points — a 120 cm waist is 4 either way — the
reading is decided whatever the sex turns out to be (rule 25) and says so plainly.
The select opens on *"Not stated"* now; it opened on *"Female"*, which is the lower
pair of bands.

## Two facts, and the first version conflated them

`sexStated` is whether the reader said. `waistDecided` is whether it matters. They
come apart exactly at the rule-25 case — a 120 cm waist with no sex given is
`sexStated: false, waistDecided: true` — and the first version reported the second as
the first, which its own test caught.

## And both of this session's rendering lessons, walked into again

The band said *"FINDRISC 9 to 13 of 26"*, and the rows underneath said:

```
FINDRISC:      9
10-year risk:  null
```

The floor stated as the total, contradicting the line above it — which is
[spec-v1159](spec-v1159.md), found this session on `elapss`. And the literal token
`null`, because `risk` is deliberately withheld when the range spans two bands —
which is rule 26 and [spec-v1158](spec-v1158.md), found this session on `kdigo-aki`.

Both written down hours earlier, both repeated. They share one cause: **a library
that learns to withhold a field breaks every renderer that interpolates it**, and the
renderer is a different file from the one being fixed. Reading the page rather than
the return value is what catches it, every time.
