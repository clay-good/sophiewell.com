# spec-v1229 — the clamp is not the guard, on the liver scores

The shape [spec-v1224](spec-v1224.md) named on the cardiovascular engines, found
again on the hepatology ones — and beside it a second way an impossible number
stays invisible.

## The clamp

`meld30` clamps sodium to 125–137 and albumin to 1.5–3.5 **because OPTN says
to**. Those are the allocation score's operational bounds; clamping a sodium of
120 to 125 is what the score *is*. It is not a plausibility check, and it was
standing in for one:

> sodium **2000 mEq/L** → clamped to 137 → a transplant-priority MELD-3.0.

`childPugh` is the reassuring direction. Its albumin band is `> 3.5 → 1 point`,
the **best** of the three, so an albumin of 70 g/dL scored the healthiest liver
there is. `maddreyDf` and `lille` take a bilirubin straight into a difference and
a log.

## The log

In `lib/endo-v136.js` every reading is a log of a value or a comparison against a
cutoff, so an impossible number never looked impossible from inside the formula:

| tile | impossible input | what it printed |
| --- | --- | --- |
| `quicki` | fasting glucose 20000 | *"QUICKI 0.1859"*, beside its own reference range |
| `tyg-index` | fasting glucose 20000 | *"TyG index 14.22"* |
| `metabolic-syndrome` | SBP 3000, DBP 2000, or glucose 20000 | *"Metabolic syndrome PRESENT (4 of 5 criteria met)"* |

A log compresses. 20000 and 200 are two-thirds of a unit apart on the TyG scale,
so the impossible value comes out looking like an ordinary abnormal one — which
is worse than a number that looks wrong.

## The fix

Each value is checked against `BOUNDS` before it is used, with `boundsAdvisory`'s
sentence. **No clinical number is decided here, and no OPTN operational bound
moves** — a sodium of 120 still scores as 125, and the test pins that.

Two surfacings, each the one its file already uses:

- `lib/scoring-v4.js` **throws** a `RangeError`, which is what `maddreyDf` and
  `lille` next door already do. The renderer's `safe()` wrapper prints
  `err.message` and `computeCalculator` reports `valid: false`, so both surfaces
  read it with no view change — which matters here, because
  `views/group-g.js` interpolates `m.score` straight into a heading with no
  refusal branch to add one to.
- `lib/endo-v136.js` returns its own `{ valid: false, message }` shape.

Each check runs **after** the function's own missing-value branch
([spec-v1207](spec-v1207.md)), so a blank field is still asked for by name.

## Ledger

`scripts/probe-envelope-unbounded.mjs`, first section: **80 fields / 50
calculators → 66 / 45.**
