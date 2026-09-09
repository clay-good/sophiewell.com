# spec-v1182 — the ledger, drained

[spec-v1179](spec-v1179.md) found that a view module's `field(label, id, opts)`
can accept a `max` and silently drop it, fixed the four modules that wave had
declared a bound in, and **ledgered 18 more**.

This drains them. All 18 honour `max` now, and the ledger is empty rather than
capped — a new entry is a regression, not a backlog item.

## What was inert

**51 `max:` declarations across 18 modules** that never reached the page. Someone
wrote the bound, the helper accepted the option, and nothing rendered it — so
`watchDeclaredRanges` had nothing to read and the warning above the answer could
not fire for any of them. Four of the modules (`group-v125`, `-v126`, `-v127`,
`-v129`) honoured `min` and not `max`, which is [spec-v1179](spec-v1179.md)'s
observation repeated: support gets added for the option someone needed at the
time.

Catalog-wide, **966 number inputs render a bound now.**

## Verified on the page, and in the direction that could break

The lesson spec-v1179 exists for is that a declaration is not a rendering, so
this was measured in a browser rather than read out of the source. The risk that
matters runs the other way, though: activating a bound that was inert can make a
tile warn about a value it has always accepted.

> **0 tiles warn on load**, across the whole catalog.

No worked example trips a newly-active bound. `declared-ranges.spec.js` and
`no-impossible-number.spec.js` — the two sweeps that read this attribute — were
run locally, because `release:check` does not include e2e and that gap has hidden
a regression in this repo before.

## What this does not do

`min` is still dropped by these helpers. Adding it would make a below-minimum
value start warning on tiles nobody has examined — a behaviour change rather than
a repair, and a separate wave with its own on-load measurement. spec-v1179 made
the same call for the same reason.

## Verification

`npm run release:check` green. `test/unit/field-helpers-honour-max.test.js` is
unconditional now: it asserts its own reach (20+ modules examined), that the
ledger is empty, and it fails when the fix is removed from any single module.
