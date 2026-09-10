# spec-v1216 — `r1` hoisted, and the drift report shortened by one

[spec-v1214](spec-v1214.md) measured the small readers `lib` modules copy and
called hoisting them "a refactor with a measurement behind it rather than a
hunch." This is the first one, chosen because it is the clearest case in the
table: **`r1` is already exported from `lib/num.js`** and seven modules kept a
local copy anyway.

## What differed

Six of the seven rounded with a bare expression:

```js
const r1 = (n) => Math.round(n * 10) / 10;
```

The canonical one guards the saturating case ([spec-v183](spec-v183.md) §4.5):

```js
const safeRound = (n, scale) => {
  const x = Math.round(n * scale) / scale;
  return Number.isFinite(x) ? x : n;
};
```

For any clinical-range value these are byte-identical, which is why nothing has
ever moved. They part company only at a float64-saturating magnitude — `n * 10`
overflows to `±Infinity`, the plain copy returns it, and the canonical returns `n`
rather than leak an `Infinity` token into an interpolated band string. The
seventh, `lib/pulmnod-v115.js`, had already written the guard out longhand,
which is the copying this file exists to stop: the same fix applied to one copy
and not its six siblings.

**No valid result moves.** That is the whole claim a refactor of this kind can
make, and the 13,570 unit tests are what supports it.

## What it leaves

`scripts/probe-helper-behaviour-drift.mjs` now reports **four** disagreeing
name/arity groups where it reported five:

| name / arity | copies | verdict |
| --- | --- | --- |
| `clamp/3` | 22 | 14 values disagree |
| `fin/1` | 37 | 7 values disagree |
| `pct/1` | 3 | 8 values disagree |
| `bool/1` | 36 | 2 values disagree |
| ~~`r1/1`~~ | ~~7~~ | **gone: one canonical copy** |
| `fin/3`, `B/1`, `r2/1` | 20, 4, 3 | agree |

`r1` was the cheap one and it should not be read as a template for the rest.
`fin` carries three genuinely different policies under one name and `clamp`
carries two, so hoisting either is a decision about which behaviour wins, not a
deduplication. `clamp` in particular is mostly the documented saturation of a risk
model's own validated range — SCORE2 is fitted for ages 40-69 and clamping the age
term is what the paper says to do — a vein [spec-v1207](spec-v1207.md) already
worked, and the open question there is disclosure, not the helper.

Six of the seven modules had **no imports at all** before this. That is worth a
line only because it is the reason a hoist is not free: a self-contained module
becomes one with a dependency, and the argument for doing it anyway is that the
alternative is what `pulmnod-v115` shows — a fix that reaches one copy in seven.

## Proof

Lint (19 gates), 13,570 unit tests and 449 MCP tests pass — the same counts as
[spec-v1214](spec-v1214.md), because this wave adds no test and changes no valid
result. `grep -n "^const r1 = " lib/*.js` returns nothing.
