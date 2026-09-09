# spec-v1156 — the gate asks the wide question now

[spec-v1146](spec-v1146.md) found that `required-field-agreement.spec.js` cleared
the **first** required field a tile renders and then stopped — one field per tile,
and always the same one. Widened, it found 62 (tile, field) pairs answering without
a field the agent surface requires. Those were drained over
[spec-v1146](spec-v1146.md) to [spec-v1155](spec-v1155.md): **35 tiles taught to
ask, 27 declarations corrected.**

With the backlog at zero, the wide question needs no ledger. So the gate asks it
itself, and the probe that carried it while the backlog drained is deleted rather
than left as a second copy of the same rule.

## What changed

- It clears **every** required text or number field, one at a time, putting each
  back before the next. An accumulating pile of blanks is the empty-form sweep
  again, and that sweep already exists.
- It **prints its own reach** with its result, and asserts it. A clean gate is a
  claim about what it reached, not about the catalog — and this programme has been
  caught by that twice ([spec-v1099](spec-v1099.md),
  [spec-v1106](spec-v1106.md)). If a change ever narrows what the sweep can see, it
  fails on the reach rather than going quiet:

```
REQFIELD shard0: 495 of 979 declared required fields cleared; 89 tile(s) had no
                 filled text/number input to clear
```

**2,041 of 4,192** declared fields cleared across the four shards. The rest are
selects, checkboxes and sliders — clearing one sets a different *value* rather
than removing one ([spec-v1029](spec-v1029.md)) — or fields a worked example leaves
blank.

- `required-field-every-probe.spec.js` is **removed**. `test/lib/required-fields.js`
  stays: the "did it answer?" test is a regex that has been tuned three times and
  belongs in one place.

## Negative-tested

With [spec-v1155](spec-v1155.md)'s `acetaminophen-nomogram` fix reverted, the gate
fails and names the pair:

```
1 (tile, field) pair(s) answered without a field mcp/fields.js calls required.
  acetaminophen-nomogram (cleared apap-lvl): Treatment line at this time: 150
  ug/mL Below the treatment line: NAC not indicated by the nomogram for a single
  acute ingestion
```

Restored, it passes. Four shards in 1.1 minutes — no slower than the version that
tested a quarter as much, because the cost was always the page loads and not the
field clears.
