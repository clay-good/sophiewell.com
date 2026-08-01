# spec-v625 — Generate the coverage ledger, and close the last clinical gap

**Status:** proposal. No code changed. Written 2026-07-31. Part of the v620 program.

## Two problems, one root cause: a hand-maintained record of a generated truth

### Problem 1 — the MCP README has already drifted

`mcp/README.md` is 39 KB, hand-kept, and stale. Line 81 documents a sample response as:

```
{ coverage: "1279 of 1109 catalog tiles exposed ...", ... }
```

That count never existed — 1279 exposed of 1109 total is impossible (exposed is a subset). It is a
copy-paste fossil from an earlier catalog. A surveyed competing server avoids exactly this by **generating**
its catalog docs. We already generate the truth at runtime — `list_calculators` reports
`"<N> of <M> catalog tiles exposed"` from the live registry — but then restate it by hand in prose, where it
rots.

**Fix: generate the coverage-count lines.** The authoritative numbers (exposed adapter count, catalog total,
per-group breakdown) come from `mcp/catalog.js`, not from a human. Either:

- generate the count-bearing sections of `mcp/README.md` and `docs/mcp-coverage.md` from the registry (a
  build step, like the OG images and tool pages already are), **or**
- if full generation is too invasive for the hand-written prose, have `scripts/check-mcp-catalog.mjs`
  **assert** every catalog-count token in `mcp/README.md` against the live registry and fail lint on drift —
  the same discipline `check-catalog-truth.mjs` already applies to the site's count surfaces.

Generation is preferable (drift becomes impossible); assertion is the cheap floor (drift becomes a red
build). Either kills the class of bug at `mcp/README.md:81`.

### Problem 2 — a small clinical coverage gap is undocumented

The registry exposes 1405 adapters. The catalog holds more `clinical: true` tiles than that. The difference
is a handful of clinical calculators that are **not** reachable over MCP — and nothing enumerates which ones,
or why. The [[project_inline_compute_extraction]] memory names the likely cause (tiles whose compute is
inline in the view with no separable `lib/` function) and the exact finder:

```
clinical:true  −  exposed  −  has-META.example
```

**Fix: run that diff, then rule on every tile it returns.** For each unexposed clinical tile, one of:

- **Adapt it** — if a pure `lib/` compute exists (or can be factored out without touching the math), write
  the adapter. The extraction program (waves 107–118) showed most "too risky to expose" deferrals were
  reclaimable once the lib function was actually read.
- **Document why not** — if the compute is genuinely inline-only, or the tile is a reference table rather than
  a calculation, record it in `docs/mcp-coverage.md` under a **"Clinical, not exposed — and why"** section,
  one line per tile with the reason. An honest, enumerated gap is fine; an unexplained one is not.

The end state: the difference between clinical tiles and exposed tiles is **zero, or fully accounted for in
writing.** No silent gap.

## Guards

- **The ledger check stays a no-op when `mcp/` is absent** (spec-v183 §3), like the rest of the gate.
- **Counts are never hardcoded in two places.** After this spec, exactly one place computes the coverage
  numbers (the registry); everything else is generated from or asserted against it.
- **The MCP count remains outside the 12 catalog-truth count surfaces** (spec-v46) — it is a subset, not the
  catalog total, and must not be conflated with `UTILITIES.length`.

## What not to do

- Do **not** expose a non-`clinical` tile to hit a round number. The clinical-only fence (spec-v183 §2.4) is
  deliberate; reference tables and utilities stay off the MCP surface.
- Do **not** relax the round-trip gate to admit a tile whose example doesn't reproduce. If it can't
  round-trip, it isn't ready to expose.

## Files (when built)

`scripts/check-mcp-catalog.mjs` (generate or assert the count lines; enumerate the clinical gap),
`mcp/README.md` (generated/asserted count sections), `docs/mcp-coverage.md` ("Clinical, not exposed — and
why" section), new adapters for any reclaimed tiles, `test/mcp/*`.
