# spec-v1180 — the surface the warning did not cover

[spec-v1179](spec-v1179.md) made the browser warn about `sokal-cml`'s platelet
count: the bound renders now, and the range warning appears above the answer.

**The library still computed.** So the agent surface went on returning:

> Sokal relative risk **3.9512129886066085e+66** (high risk); ELTS 0.92 (low risk)

A warning on one surface is not a guard on the other — the split
[rule 18](incomplete-input-program.md) names, and the shape this session hit in
[spec-v1174](spec-v1174.md) (where `saps-ii` carried a rendered `max: 200` and
still answered a WBC of 15,000 through the agent) and again in
[spec-v1172](spec-v1172.md). Leaving it here would have been a half-fix of my
own making, one wave old.

## Why `Number.isFinite` was not enough

```js
0.188 * ((plt / 700) ** 2 - 0.563)   // inside Math.exp(...)
```

The platelet term is squared **inside an exponential**. A count of 20,000 — the
figure a US report prints for what this field wants as 20 — gives `exp(153)`,
which is `3.95e+66`. The guard below it reads:

```js
const sokal = Number.isFinite(sokalRaw) ? r2(sokalRaw) : null;
```

That catches `Infinity` and not this. It is [spec-v1012](spec-v1012.md)'s line
exactly — *"the gate passed because 1e+308 is a number that exists"* — sitting in
a library rather than a gate.

And 20 ×10⁹/L is not an odd number to be entering here: it is severe
thrombocytopenia, which is exactly the CML presentation someone would be scoring.

## The fix

The same guard as [spec-v1174](spec-v1174.md) and [spec-v1178](spec-v1178.md),
at `BOUNDS.platelets`, with the conversion in the message:

> A platelet count of 20000 is above ~2000, beyond recorded extremes. This field
> is in x10⁹/L (the same as x10³/µL), so a lab report reading 20000/uL is entered
> as 20.

A real count of 300 still answers (Sokal 0.91), and an extreme reactive
thrombocytosis of 1500 still answers (Sokal 2.09). The test asserts the answer
carries **no exponent**, not merely that it is finite — because finite was the
property that let this through.

## Verification

`npm run release:check` green. `test/unit/platelet-unit-confusion.test.js` now
covers this tile on both surfaces alongside the five it shares a cause with.
