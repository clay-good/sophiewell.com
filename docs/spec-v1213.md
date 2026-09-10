# spec-v1213 — the field the page called optional

[spec-v1212](spec-v1212.md) fixed `toxic-alcohol`, whose blank optional pH reached
the library as a measured zero, and closed by naming what it left:

> **Fifteen view modules carry a helper of that shape.** … The remaining fourteen
> are latent: they matter the day a field they feed gets an envelope that excludes
> zero.

That framing was too narrow. An envelope is not the only thing a zero walks past.
**A library branch written for the absent case is another**, and one of the
fourteen was walking past one already.

## Bristol girth: an escalation off an empty field

`bristol-girth` takes an abdominal girth and a timestamp at two points and reports
the change per hour. The library guards the pair the way you would expect:

```js
const g0 = Number(girthT0Cm);
const g1 = Number(girthT1Cm);
if (Number.isFinite(g0) && Number.isFinite(g1) && t0Timestamp && t1Timestamp) {
```

That guard is **correct against the agent surface and useless against the
browser**, which is the whole defect. The MCP adapter omits a field nobody filled,
so `girthT0Cm` arrives as `undefined`, `Number(undefined)` is `NaN`, and the
branch does not run. The renderer read the same field with `nv29d`, which is
`Number(input.value)` — and `Number('')` is `0`, which is finite.

So a nurse who charts a girth of 95 cm at T1, has no T0 measurement, and enters
both timestamps was told:

```
Girth change: 95 cm over 4 h (23.75 cm/h).
Girth increase >=2 cm/h: abdominal-compartment-syndrome concern per SCCM 2013;
  escalate and consider bladder pressure.
Absolute girth change >20 cm in <=24 h: ACS concern per SCCM 2013; escalate.
```

Two escalation banners, from one field left blank. Both fields say "(optional)" on
their own labels.

This is the cross-surface shape from [spec-v1037](spec-v1037.md) run backwards:
there the browser answered what agents were refused, and here the browser
*fabricates* what agents correctly decline. The agent surface was clean
throughout, which is why no MCP test saw it.

### Passing `null` does not fix it

The obvious repair — have the view send `null` for a blank field — does nothing on
its own, because `Number(null)` is `0` too. The guard had to move as well. Both
layers were wrong in the same way, and fixing either alone leaves the banners up.

## `measured()`, and the three meanings of `fin`

`lib/num.js` now exports `measured(v)`: null, undefined, whitespace and
unparseable values read as `null`; a **typed** `0` still reads as `0`. It checks
presence only. Bounds stay with `inputFault` and `gradeFault` in the same file,
and a test pins that separation, because conflating the two is how the existing
house helper drifted.

That helper is `fin`, and `lib/` holds **60 declarations of it under three behaviours**:

| body | `'42'` | out of range | copies |
| --- | --- | --- | --- |
| `typeof v === 'number' && Number.isFinite(v) ? v : null` | `null` | passes | 31 |
| `fin(v, lo, hi)` — blank-aware, **returns null when outside `lo…hi`** | `42` | **`null`** | 20 |
| `'' → null`, else `Number` | `42` | passes | 9, across three near-identical bodies |

Two of those disagree about the thing the name is for. `scripts/check-helper-drift.mjs`
cannot see any of it: it reads `views/` only, and watches six names, none of them
`fin`. **This is a measurement, not a fix.** The 31-copy shape rejecting a numeric
string looked live and is not — `mcp/tools.js` coerces a `kind: 'number'` field
before the adapter calls the library, so no caller reaches those functions with a
string. Hoisting `fin` and extending the drift gate to `lib/` is the next chunk,
and it is a refactor, not a bug fix.

## Also fixed

- **`salicylate-toxicity`** read "Arterial pH (optional)" with `val`, so a blank pH
  arrived as `0`. It decided nothing — the library's own `ph > 6.5 && ph < 8`
  envelope excludes it — but a reading that was never a reading should not reach a
  threshold and be saved by a second guard. This is precisely the latency
  spec-v1212 predicted, found before the envelope changed rather than after.
- **`crrt-dose`** passed a blank "Ultrafiltration (mL/h, optional)" as `nv('cr-uf')`
  and the library returned `Number.isFinite(uf) ? uf : 0`, publishing
  `ultrafiltrationMlPerHr: 0` to the agent surface as a prescribed rate. Its
  sibling `cr-r` was given the blank-aware reader by
  [spec-v1148](spec-v1148.md) and this one, two lines down, was not — the
  half-guarded shape again.

## The finder

`scripts/probe-optional-read-as-zero.mjs` asks one question of the fifteen
modules: is a field whose **own label says "optional"** read through the
zero-coercing helper, with nothing at the call site doing the asking instead?

It matters that it filters. Most optional fields are already guarded, and the
guard is nearly never on the line with the read — `preg-dating` binds `const crl =
num('pd-crl')` and tests `crl > 0` eleven lines later; `hypertonic-saline` binds
`str('na-prior')` and tests the raw string. A line-local pattern reports all of
them and is useless. The probe follows the `const` alias through the module, which
is [spec-v1210](spec-v1210.md)'s lesson — *the branch is usually one call away* —
applied to guards instead of renderers.

Two other corrections worth keeping:

- The builder scan looked for a literal `type: 'number'` and found **zero** number
  inputs in six modules, because the house builder is `type: opts.type || 'number'`.
- The id is the second quoted string on a builder call, and reading to the closing
  paren truncated `field('Total cholesterol (mg/dL)', 'ldl-tc', …)` at the label's
  own bracket, so the label was collected as an id.

It reports **0 rows against a reach of 15 modules**, and was negative-tested rather
than trusted: restoring the `bg-g0` and `sal-ph` defects produces exactly those two
rows and nothing else.

## What this leaves

`fin` is not the only one. Running the same normalise-and-group check over `lib/`
for the small readers every module copies:

| name | copies | distinct bodies |
| --- | --- | --- |
| `fin` | 59 | 7 |
| `bool` | 36 | 3 |
| `clamp` | 22 | 5 |
| `oneOf` | 16 | 5 |
| `r1` | 8 | 3 |
| `pct` | 6 | 6 |
| `B` | 5 | 2 |

Those body counts are looser than the three *behaviours* above — a renamed
parameter counts as a distinct body — so the table is a cost estimate, not a
defect count. Two rows are worth reading anyway. `r1` is **exported from
`lib/num.js`** and still has eight local copies, and it rounds numbers that get
published. `oneOf` is [spec-v1090](spec-v1090.md)'s copy-pasted lambda, whose
third argument was repeatedly the most favourable row of the table it looked up.

Hoisting these and extending `check-helper-drift.mjs` to `lib/` is the next chunk.
It is a refactor with a gate at the end of it, and it should not be mixed into a
wave that fixes a live defect.

## Proof

The two new library tests fail on the old code (2 failures) and pass on the new,
which is the only claim a test of this kind can make. `bristol-girth` gains the
half-filled case its existing "Without girth inputs, deltaPerHourCm is null" test
could not see — that one passes because the *timestamps* are absent too, so it
never reached the guard it was written for. Both new tests also pin the mirror: a
girth typed as `0` is still a measurement, and a prescribed ultrafiltration of `0`
still reports as `0`.

Lint (19 gates), 13,567 unit tests and 449 MCP tests pass.
