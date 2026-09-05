# spec-v1074 — the guard that only fires on an empty call

[spec-v1073](spec-v1073.md) shipped a gate keyed on the empty call: does a
calculator built entirely of rated items answer `inputs: {}`? Seventeen did, and
the wave fixed them.

`snakebite-severity` was not one of the seventeen, and it has the same defect.

## Why it was invisible

Its library opens with the guard that looks like the fix:

```js
let any = false;
for (const k of keys) {
  const v = fin(input[k]);
  if (v != null) any = true;
  subs[k] = v == null ? 0 : clampInt(v, 0, SSS_MAX[k]);
}
if (!any) return { valid: false, band: 'Enter the six SSS body-system subscores ...' };
```

`if (!any)` is true only when **every** system is missing. Send five and omit
one, and the sixth is `subs[k] = 0` — and the band names it:

> SSS 11/20: middle third of the 0-20 range (moderate) (**pulmonary 0**,
> cardiovascular 3, local wound 4, GI 2, hematologic 1, CNS 1).

"pulmonary 0" is a normal respiratory exam, asserted about a system nobody
examined. This is exactly the trap [spec-v1063](spec-v1063.md) paid for on the
browser side — a guard against *all* fields missing goes quiet the moment one
field is present — and here it also **hid the tile from spec-v1073's sweep**,
because that sweep only ever asks the empty call.

## The narrower question, asked per field

A gate keyed on the empty call cannot see this. A gate keyed on every numeric
field sees too much: 93 fields across 43 calculators, most of them counts,
disclosures the vocabulary does not recognise, or dependent lines that simply
disappear (that walk is `scripts/probe-omitted-item.mjs`, and it stays a probe
because each row needs reading).

The half in between needs no judgment at all:

> a `kind: 'number'` field carrying a **`values` picklist** — a field the browser
> renders as a `<select>`.

A select always has a value on screen. There is no state a reader can reach that
requiring the field would refuse, so the fix is one word and there is nothing to
weigh. Fill each calculator from its worked example, drop one picklist item, and
fail if the answer moves without asking for the value or saying it is missing.

**Eight fields, three calculators.** All 567 picklist-valued number fields in the
catalog were swept; 68 of them across 15 tiles are not declared required, and the
other 60 are fine — `berg-balance`, `edss`, `villalta`, `lund-mackay` and the
rest disclose how many items they scored, which [spec-v1044](spec-v1044.md) gave
them. Behaviour is the oracle here, not the declaration.

| Fixed | |
|---|---|
| `snakebite-severity` | six body-system sub-scores; each omission printed that system as 0 |
| `cdai-crohns` | the abdominal-mass select, worth up to 50 points of a CDAI, silently scored "none" |

`mayo-uc|mu-en` is the one ledger line, and it earns it: the endoscopy subscore
is labelled optional on the form, and without it the tile reports the
**"partial Mayo" subset by name** rather than a full Mayo score. That is a tile
saying what it did, which is the whole ask.

## What holds it

A fifth assertion in `test/mcp/rated-items-are-required.test.js` (0.2 s), with
`OPTIONAL_PICKLIST_OK` beside it keyed `tileId|fieldId`, so exempting one item
leaves every other item on that calculator guarded — the rule
[spec-v1067](spec-v1067.md) settled on.

Verified by reintroducing the defect: making `ss-pul` optional again fails it,
naming the field.

## The lesson, restated for sweeps

> **A sweep keyed on the empty form inherits every `if (!any)` guard in the
> catalog.** A tile that refuses when nothing is sent looks fixed to it, and can
> still be reading five of six values and inventing the sixth. Ask the question
> at the granularity the defect lives at — one field — wherever the answer does
> not need a human to read it.
