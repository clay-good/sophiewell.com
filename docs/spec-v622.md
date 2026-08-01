# spec-v622 — Publish input ranges and flag implausible values

**Status:** proposal. No code changed. Written 2026-07-31. Part of the v620 program.

## The gap

Our published JSON Schema tells an agent an input is a `number` and nothing more. It carries no bounds. So:

- The schema an agent reads (`describe_calculator`) gives it no way to self-correct before calling. It cannot
  know that "heart rate" is roughly 20–300 bpm, or that "age" is 0–120 years.
- `compute_calculator` validates only that a number is *finite* (`mcp/fields.js:71`). An agent that sends
  `age: 900` or `weight_kg: -5` gets a computed answer back, silently. The math is correct; the input is
  nonsense; nothing says so.

A surveyed competing server treats literature-backed clinical ranges as an explicit safety layer. We should
too — but as **transparency and a soft signal, not a hard gate**, because clinical extremes are real (a
neonate's weight, a hyperkalemia of 9 mmol/L) and rejecting them would be its own error.

## The design

**1. Optional bounds on field descriptors.** Two independent, optional pairs:

```js
{ dom: 'vs-hr', arg: 'hr', kind: 'number', unit: 'bpm',
  min: 0, max: 400,            // hard: physically impossible outside this
  plausibleMin: 20, plausibleMax: 300 }   // soft: outside this is worth a second look
```

Both pairs are optional and additive — a field with neither behaves exactly as today.

**2. Publish the hard bounds in the schema.** `fieldSchema` emits `minimum`/`maximum` when `min`/`max` are
present. Now the contract an agent reads is self-describing, and a schema-aware client can catch a fat-finger
before the call.

**3. Enforce hard bounds; warn on soft.** In `compute_calculator`:

- A value outside `[min, max]` is a validation failure — `{ valid: false, message: '"vs-hr" must be between 0
  and 400 bpm.' }` — because the value is impossible, not merely unusual.
- A value inside the hard bounds but outside `[plausibleMin, plausibleMax]` still computes and still returns
  the result, with a non-blocking `warnings` array: `warnings: [{ input: 'vs-hr', value: 320, message:
  'Outside the usual range (20–300 bpm); check the value.' }]`. The result is unchanged; the warning is
  advisory.

**4. Same signal on the site.** The renderers can show the same soft warning inline next to an out-of-range
field. One bounds declaration, two surfaces — the invariant the whole program holds to.

## Why soft warnings, not rejection

Rejecting an implausible-but-possible value would make the tool wrong for exactly the sick patients these
calculators exist for. The competing server's ranges are a good instinct applied with too heavy a hand for a
clinical tool. Our version: reject only the impossible, flag the unusual, compute either way, and always say
what we did.

## Rollout and guards

- **Incremental.** Start with the highest-value shared inputs — age, weight, the common vitals and
  electrolytes — ideally tied to the v621 concepts so bounds attach to a concept once, not to every field.
  Most fields will carry no bounds for a long time, and that is fine.
- **Determinism preserved.** A warning is a pure function of the inputs; identical inputs → identical
  `warnings`.
- **Output-safety unchanged.** The existing non-finite guard still runs on the result.
- **Gate.** `scripts/check-mcp-catalog.mjs`: where both pairs exist, require `min ≤ plausibleMin ≤
  plausibleMax ≤ max`. A worked example in `META.example` must never itself trip a hard-bound rejection
  (it would break the round-trip gate) — the check asserts this, catching a mis-entered bound at lint time.
- **Tool count unchanged** (0 new tools).

## What not to do

- Do **not** turn soft warnings into rejections, and do **not** let a warning alter the numeric result.
- Do **not** invent bounds. A bound is a sourced clinical/physiologic range or it is absent. An unsourced
  guess that rejects a real value is worse than no bound.

## Files (when built)

`mcp/fields.js` (accept `min`/`max`/`plausibleMin`/`plausibleMax`; emit schema bounds; enforce + warn),
`mcp/tools.js` (thread `warnings` through `compute_calculator`), `mcp/concepts.js` (optional per-concept
default bounds, if v621 has landed), `scripts/check-mcp-catalog.mjs` (ordering + example-safety gate),
`views/*` (optional inline soft warning), `test/mcp/*`.
