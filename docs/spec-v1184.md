# spec-v1184 — the helper the gate could not see

[spec-v1183](spec-v1183.md) drained the second of two bound ledgers and left a
gate asserting both were empty. They were. The gate was still wrong, because
**it matched the helper by name.**

## What it missed

`function field(label, id, opts = {})` is the house convention, so three waves
of gate looked for exactly that signature. `views/group-v176.js` and
`views/group-v178.js` call theirs `numField`. Both honour `min` and drop `max`
— spec-v1179's observation for the fourth time — on three inputs:

| tile field | declared | rendered before |
|---|---|---|
| `chair-age`, `reach-age` | age 0–130 | floor only |
| `conut-chol` | cholesterol 0–600 | floor only |

An age field bounded at 130 that accepts 1307 is the case
[spec-v1009](spec-v1009.md) was written from: a transposed digit is the
commonest data-entry error there is, and SAPS II answered one with *"79.9%
predicted hospital mortality."*

These two modules sat clean through spec-v1179, spec-v1182 and spec-v1183. The
ledgers really were empty; the reach was the lie.

## The gate now matches shape, not name

Any local function whose last parameter is an options object, against every key
any call site passes it — **79 helpers, 282 helper/option pairs**, both floors
asserted. It no longer knows what an option is called, so it catches a dropped
`placeholder` or `step` as readily as a dropped bound.

Negative-tested in both kinds: with `opts.max` removed from `group-v176` it
reports `numField() drops max (2 call sites)`, and with `opts.placeholder`
removed from `group-v10` it reports `field() drops placeholder (36 call sites)`.

The probe is one probe for both directions too —
`declared-floor-probe.spec.js` becomes `declared-bounds-probe.spec.js` and reads
`rangeOverflow` beside `rangeUnderflow`. A second copy of the rule is how these
helpers came to disagree in the first place; spec-v1183 had written the floor
half and would have needed the ceiling half one wave later.

## Measured on the page

| | before | after |
|---|---|---|
| number inputs rendering a ceiling | 966 | **969** |
| number inputs rendering a floor | 2,061 | 2,061 |
| tiles warning about their own example | 0 | **0** |

Three declared, three rendered, nothing newly flagged.

## Verification

`npm run release:check` green: lint, **13,405 unit**, 448 mcp, sbom, build —
exit code read directly rather than through a pipe, because `cmd | tail` reports
the pipe's status. The unit count goes 13,406 -> 13,405 because spec-v1183's
per-bound pair collapses back into one test that no longer knows what a bound is.

`declared-ranges.spec.js` and `no-impossible-number.spec.js` run locally, 24
passed, because `release:check` does not include e2e and that gap has hidden a
regression here before.
