# spec-v1161 — nineteen picklists an agent could not read

Third and last finding from [spec-v1159](spec-v1159.md)'s probe run.
`undeclared-picklist-probe.spec.js` reports fields that are a `<select>` on screen
while declaring no `values` in the registry, so **an agent cannot learn which
inputs mean anything, and both value-list gates walk past them.**

It printed **19 fields on one tile**: `cornell-csdd`, the Cornell Scale for
Depression in Dementia. Every item renders as

```
(blank) · a — Unable to evaluate · 0 — absent · 1 — mild or intermittent · 2 — severe
```

and was declared `kind: 'number'` with no `values`.

## `a` is the point, not an edge case

The library treats it carefully. `csddItem('a')` returns `{ score: 0, rated: false }`,
and the reading says so:

> 2 of 19 items marked unable to evaluate (scored 0); 17 rated.

That is exactly what this programme asks for — a resident who cannot be assessed on
an item is not a resident who scored zero on it, and the tile keeps the two apart.
**An agent had no way to know the option existed.** It would send numbers, and every
unassessable item would arrive as a real 0 with nothing to say so.

Declared as `enum` with `values: ['a', '0', '1', '2']` now, and each label spells the
scale out — *"0 absent, 1 mild/intermittent, 2 severe, or "a" for unable to
evaluate"*.

## What that also switches on

Two gates key on the declared list and had been walking past all nineteen:
`field-values-match-dom.spec.js` (declared vs offered, both directions) and the
undeclared-picklist probe itself. Both now cover them, and the probe reports **0
fields across 0 calculators** — its first empty run.

A value the registry does not declare is invisible twice over: to the agent that
would use it, and to the checks that would notice it went missing.
