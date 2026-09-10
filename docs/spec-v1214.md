# spec-v1214 — an impossible reading that scored as normal

[spec-v1213](spec-v1213.md) closed by measuring the copied readers in `lib/` and
calling a hoist "the next chunk." Measuring them again — behaviourally this time,
rather than by comparing text — found a live defect first.

## SALT: 150% hair loss, "S0 (no loss)"

`lib/dermscore-v234.js` carried two readers shared by its four instruments:

```js
function lvl(v, hi) {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > hi) return 0;   // <-- off the scale
  return Math.round(n);
}
function pct(v) { /* same, bounded 0-100 */ }
```

Returning `0` for a value off the scale is the silent clamp
[spec-v1209](spec-v1209.md) exists to remove, and it has the property that makes
that shape dangerous: the impossible input does not merely score, **it scores as
the most normal score the instrument has.**

Four scalp regions entered as 150% terminal hair loss:

```
Severity of Alopecia Tool 0 of 100 — S0 (no loss).      valid: true
```

`-50%` gives the same answer. Total alopecia entered; none reported.

All four exports — `masi`, `salt-score`, `napsi`, `vancouver-scar-scale` — now ask
`inputFault` first, so an off-scale value is refused **by the name the reader
sees** ("The top of the scalp must be between 0 and 100 %."), and the two readers'
fallback is `NaN` rather than `0`: unreachable today, and visible rather than
reassuring the day somebody adds a fifth export and forgets the guard.

### What was already right, and it matters

The **blank** half of this was never live, and saying so is the point of
[spec-v1211](spec-v1211.md)'s reach discipline. `views/group-v234.js` guards SALT
with `needItems`, whose message is better than anything the library would say —
*"the total is the sum of the items, so one left blank is not an item scoring
zero"* — and the other three are `<select>`s with no blank option. Every field is
`required: true` in the adapter, so an agent omitting one gets `MISSING_INPUT`
before the library is called. That is why the empty-form sweep, which drives the
browser, was correct to pass.

Only the **range** was unguarded, and only on the two free number fields. That is
why this is `inputFault` at the top of each function rather than a rewrite.

### The refusal had to carry two keys

`render()` in `views/group-v234.js` branches on `!r.valid` and prints
`r.message`. A guard returning only `band` — the shape `critcare-v112.js` uses —
would have printed "Complete the fields." beside an impossible input: exactly the
`cdai-crohns` regression [spec-v1212](spec-v1212.md) had just finished fixing, in
a new file. The module's `refuse()` returns both keys and a test asserts they are
the same sentence.

## The finder: behaviour, not text

`scripts/check-helper-drift.mjs` compares normalised function **bodies** for six
names in `views/`. That is the right shape for a gate, and it has two blind spots:
a renamed parameter reads as drift, and it never looks at `lib/` — where the
copying is far heavier.

`scripts/probe-helper-behaviour-drift.mjs` asks the behavioural question. It
extracts every copy of a watched name, runs all of them over one battery of 27
plausible, boundary and not-a-reading values, and reports only the names whose
copies return **different answers** for some value, naming the value that
separates them.

Two corrections it needed before it was right, in the tradition of
[spec-v1202](spec-v1202.md):

| it said | it was |
| --- | --- |
| every watched name drifts, on every value | copies that close over a module-scope helper throw `ReferenceError`, which is the probe's limit, not a disagreement. They are excluded and **counted in the header** instead |
| `fin` disagrees on all 27 values | `fin` exists as a 1-argument reader **and** a 3-argument bounds-checking one. Feeding one argument to both makes every 3-arg copy answer on an undefined `lo`/`hi`. Copies are grouped by arity and compared within the group; the 20 three-argument copies then **agree on all 27 values** |

`new Function` is forbidden by house lint, so each extracted body is written out
as its own module and imported — the more honest evaluation anyway, since the copy
runs exactly as written.

## What it prints, and why most of it is latent

| name / arity | copies | verdict |
| --- | --- | --- |
| `clamp/3` | 22 | 14 values disagree |
| `fin/1` | 37 | 7 values disagree — all of them **strings and booleans** |
| `pct/1` | 3 | 8 values disagree (was 16, before this wave) |
| `bool/1` | 36 | 2 values disagree: the number `1` and the string `'on'` |
| `r1/1` | 7 | 6 values disagree, all non-finite |
| `fin/3` | 20 | **agree** on all 27 |
| `B/1`, `r2/1` | 4, 3 | **agree** on all 27 |

**Most of this cannot be reached, and the reason is worth writing down.** Both
surfaces normalise before a library is called: `mcp/fields.js` `toBool` hands
every `kind: 'bool'` field a real `true`/`false`, and `mcp/tools.js` coerces
`kind: 'number'`. The browser reads a checkbox with `.checked`. So the three
modules whose `bool` reads the number `1` as **false**, and the thirty whose `fin`
reads `'7.2'` as **null**, are latent — they matter the day something calls a
library directly.

That is the honest reading, and it is why this probe is a report and not a gate.
It also cost this wave its first hypothesis: the `fin` string divergence looked
live for about ten minutes, and `mcp/tools.js:776` is why it is not.

`r1` is the one worth a second look. It is **exported from `lib/num.js`** and
still has seven local copies; the canonical one is Infinity-guarded and returns
its input unchanged for a non-number, which is a different leak from the plain
copies' `NaN`. `fmt()` catches both downstream. Hoisting it is still the next
chunk, and it is now a refactor with a measurement behind it rather than a hunch.

## And the red main that preceded it

[spec-v1213](spec-v1213.md) was pushed with lint, 13,567 unit tests and 449 MCP
tests green, and **CI failed on `unit`**. Not on a test: on the step after them,
*"The build must be idempotent"*. `sbom.json` and `sbom.md` carry a per-file size
and SHA-256 for every source file, `npm run build` regenerates them, and five
source files had changed.

Nothing in `npm run lint`, `npm run test:unit` or `npm run test:mcp` looks at the
SBOM. `npm run release:check` does — it ends in `sbom && build` — and running the
three suites separately is exactly how you miss it. The pre-flight for any change
under `lib/` or `views/` is `npm run build`, then commit whatever it writes back.

Worth one more line, because it happened while fixing the above: the first attempt
at that pre-flight compared `md5` of an unquoted file list that expanded to
nothing, and printed a clean diff of empty against empty. `git status` is the
oracle; a checksum comparison that checked no files is the same
report-clean-by-checking-nothing failure this whole program keeps finding in its
own gates.

## Proof

The three new tests fail on the old code and pass on the new. The eight existing
worked examples are unchanged — every valid result is identical, which is the
claim a guard of this kind has to support. The `pct` row drops from 16 disagreeing
values to 8 as a direct result of the fix.

Lint (19 gates), 13,570 unit tests and 449 MCP tests pass.
