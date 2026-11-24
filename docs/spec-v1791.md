# spec-v1791 — Batch two: the list built away from the message

> Status: **SHIPPED (2026-11-24)**: 17 more tools fixed, 27 left. No arithmetic changed; the catalog stays
> 2,390.

[spec-v1790](spec-v1790.md) fixed the twelve tools whose refusal named an identifier **on the same line as
the message**, and left 169 refusals across 41 tools. Most of the rest share one shape: the list is built
somewhere else.

```js
const bad = read.filter((r) => Number.isNaN(r.v)).map((r) => r.i.key);
// ... further down
return { valid: false, message: `Each yes/no item must be yes or no. Unrecognized: ${bad.join(', ')}.` };
```

The message is innocent; the keys were chosen four lines earlier. So the codemod now follows the variable:
it rewrites a builder only when that builder's variable is **interpolated into a refusal** in the same file,
which leaves a `.map(... .key)` that builds data rather than prose alone.

17 tools fixed, and the refusals read as the forms do:

| Tool | Before | After |
|---|---|---|
| `nems` | `Unrecognized: basicMonitoring` | "Basic monitoring: hourly vital signs, regular record and calculation of fluid balance" |
| `alsfrs-r` | `Still needed: salivation` | "Still needed: Salivation" |
| `global-ards` | `Still needed: riskFactor` | "Still needed: An acute predisposing condition" |
| `hardman` | `Still needed: hemoglobin` | "Still needed: Hemoglobin below 9.0 g/dL (90 g/L)" |
| `bethesda` | `Still needed: underFifty` | "Still needed: Colorectal cancer diagnosed under age 50" |
| `amsterdam-ii` | `Still needed: fapExcluded` | "Still needed: Familial adenomatous polyposis excluded in the colorectal cancer family" |

**113 refusals across 27 tools remain.**

## The guard rail earned its place again

`robarts-index` came out of the rewrite saying `undefined must be 0, 1, 2 or 3`. Its items carry no prose of
their own -- no `text`, no `name` -- and the file does contain `text:` entries, for the four *levels* each
item is scored on. A file-level test for "does this module have `text`" cannot tell an item's prose from its
options' prose. The adapter labels every item by its Geboes grade, which the item does carry, so that is
what it says now, as the line above it already did.

That is the third time in two specs that the runtime check for `undefined` caught a mechanical rewrite
before it was committed. It is the cheapest test in this programme: a codemod that renames a property can
only fail in one visible way, and the whole catalog can be asked in two seconds.

## Nine tests, same intent

Each asserted that the refusal **names** the item, by matching the key:
`assert.match(r.message, /salivation/)`. The intent is exactly right and is kept; the expected name is now
the reader's. `/cns/` became `/Central nervous system involvement/`, `/fapExcluded/` became
`/Familial adenomatous polyposis excluded/`.

Two of the nine are worth noting, because the key was ALSO an English word -- `ffs-1996`'s `cns` and
`sternbach`'s `fever` -- so those tests passed before for the wrong reason: `/fever/` matches "Fever" in any
sentence about fever. Tightening them to the item's own wording makes them assert what they were always
meant to.

## What is left, by what the table offers

| | Tools |
|---|---|
| Items carry only a `label` | 6 |
| Items carry no prose at all | 6 |
| A message shape neither batch has read | the rest |

`twstrs-severity` is the example of the last: batch one fixed its "Still needed" line and it still has
"Out of range: shoulderElevation (0 to 3)" beside it. Each remaining file needs the same two questions
answered by reading it -- which property is the reader's word for the item, and is the key already the
instrument's own notation -- which is why this is a finder with batches and not a sweep.
