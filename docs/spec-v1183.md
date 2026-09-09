# spec-v1183 — the floor, activated

[spec-v1179](spec-v1179.md) found that a view module's `field(label, id, opts)`
can accept a bound and silently drop it. It fixed `max` in four modules;
[spec-v1182](spec-v1182.md) drained the other 18 and closed with the one thing
neither wave had done: **`min` was still dropped by the same 18 helpers.**

This activates it. Both ledgers are empty now, and they are one gate rather than
two.

## What was inert

**85 `min:` declarations across 18 modules** that never reached the page. The
machinery was already complete — `watchDeclaredRanges` reads `rangeUnderflow`
alongside `rangeOverflow`, and has since [spec-v1009](spec-v1009.md) — so the
only missing piece was the attribute. 83 of the 85 are `min: 0`, and the other
two are the Glasgow Coma Scale's floor of 3.

Nearly all of these sit in helpers that already honour `max`, because
spec-v1182 added the option someone needed at the time. That is spec-v1179's
observation for the third wave running.

## Measured before it was turned on

spec-v1182 deferred this deliberately: activating an inert floor is a behaviour
change, not a repair. A value the tile has always accepted can start warning, and
the value most likely to be sitting in a field is the **worked example's** — which
every reader sees on load without typing anything.

So the sweep is the tile as it opens, example applied, nothing touched:

| | before | after |
|---|---|---|
| number inputs rendering a floor | 1,976 | **2,061** |
| number inputs rendering a ceiling | 966 | 966 |
| tiles warning about their own example | 0 | **0** |

85 declared, 85 rendered, nothing newly flagged. `test/integration/declared-floor-probe.spec.js`
is the finder, kept as the record; it reports and asserts nothing, per the house
probe convention.

## One rule, one gate

`field-helpers-honour-max.test.js` becomes `field-helpers-honour-bounds.test.js`
and loops over both bounds. It was nearly a second, near-identical test file —
and a second copy of a rule is exactly how these helpers came to disagree about
which options they honour in the first place.

Negative-tested: with the fix removed from `group-v7.js` alone, the `min` case
fails and names that file.

## Verification

`npm run release:check` green: lint, **13,406 unit** (13,405 + the split of one
bound test into two), 448 mcp, sbom, build. The exit code was read directly
rather than through a pipe, because `cmd | tail` reports the pipe's status and
this repo has shipped a red main on exactly that.

`declared-ranges.spec.js` and `no-impossible-number.spec.js` — the two sweeps
that read this attribute — were run locally (24 passed, 6 skipped), because
`release:check` does not include e2e and that gap has hidden a regression here
before.
