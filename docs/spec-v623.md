# spec-v623 — Batch compute for agent workups

**Status:** proposal. No code changed. Written 2026-07-31. Part of the v620 program.

## What this does for you

A clinical question rarely maps to one calculator. Sepsis triage wants qSOFA, SOFA, NEWS2, and a lactate
read together; an anticoagulation decision wants CHA₂DS₂-VASc next to HAS-BLED. Today an agent runs these one
`compute_calculator` call at a time — N round-trips, N chances to drop the thread. This spec adds
`compute_batch`: run several calculators in a single call and get all results back together.

A surveyed competing server offers exactly this (`calculate_batch`) for cross-analysis. It is a small,
obvious win we are missing.

## The design

```
compute_batch({
  calculations: [
    { id: 'qsofa',  inputs: { ... } },
    { id: 'news2',  inputs: { ... } },
    { id: 'sofa',   inputs: { ... } }
  ]
})
  -> {
       count: 3,
       results: [
         { id: 'qsofa', valid: true,  result: { ... }, citation, ... },
         { id: 'news2', valid: true,  result: { ... }, citation, ... },
         { id: 'sofa',  valid: false, message: 'Missing required input "gcs".' }
       ],
       disclaimer
     }
```

- **It is a thin fan-out over the existing dispatch.** Each element runs through the same
  `computeCalculator` path — same validation, same output-safety guard, same citation. `compute_batch` adds
  no new math and no new failure modes; it just loops.
- **One failure never sinks the batch.** An invalid element returns its own `{ valid: false, message }` in
  place; the others still compute. Results come back in request order.
- **Bounded.** Cap the array (e.g. 25 calculations) so a single call can't be turned into a load amplifier,
  and return a clear message when the cap is exceeded. The stdio server is local and single-user, but the
  cap also keeps the transcript legible and makes v626's optional remote server safe by construction.
- **The disclaimer is carried once** at the top level, not repeated per result.

## Why this is safe and cheap

- **Deterministic.** A batch is the ordered concatenation of independent deterministic calls; identical
  input → byte-identical output.
- **No shared state between elements.** Each calculation is isolated; there is no cross-talk, no accumulation,
  nothing an agent could exploit to make one calculation affect another.
- **Tool count.** Adds exactly one tool.

## Explicitly out of scope

- **No cross-calculator "interpretation."** `compute_batch` returns the individual results; it does not
  synthesize them into a combined verdict. Combining scores is a clinical judgment, not a deterministic
  compute, and inventing one would violate the tool's posture (spec-v50 §3). Agents may reason over the
  results; the tool does not.
- **No implicit panels.** This spec does not define named bundles ("run the sepsis panel"). Curated panels
  could later be built *on top of* `compute_batch` using the v624 relatedness edges, but they are not part of
  this spec.

## Files (when built)

`mcp/tools.js` (`compute_batch` + `TOOL_DEFS` entry + `dispatch` case), `mcp/server.js` (no change beyond the
shared registration), `test/mcp/*` (batch success, partial-failure, cap-exceeded, determinism),
`mcp/README.md` / `docs/mcp-coverage.md` (generated per v625).
