# spec-v619 — Scaling the site for the next thousand tiles

**Status:** proposal. No code changed. Written 2026-07-30 at catalog 1468 / MCP 1405.

The catalog just grew by 100 tiles in two days and the plan is to keep going. This spec measures what
actually breaks when it does, and proposes fixes in the order the measurements justify.

**The headline: one hard blocker, one architectural drag, and one annoyance that is not actually growing.**

## Measured baseline (2026-07-30, catalog 1468)

| What | Now | Growth per tile | Ceiling |
|---|---|---|---|
| **Search corpus, gzipped** | **227,519 B** | **~210 B** | **229,376 B — build `throw`s** |
| Modules pulled in by `app.js` | 1,098 files, 12.08 MB raw / **2.73 MB gzipped** | ~2 files, ~12 KB | none, but every byte is downloaded before any calculator runs |
| `dist/` | 72 MB, 6,200 files (18 MB OG PNGs, 12 MB tool pages) | ~50 KB | deploy weight only |
| CI wall time | ~43 min | **flat** (2548–2639 s across the last 8 runs, no trend) | throughput, ~1.4 pushes/hour |
| `npm run test:unit` | 49 s for 10,691 tests | negligible | none |

## 1. The search corpus will hard-fail the build in about nine tiles

This is the urgent one. `scripts/build-search-corpus.mjs` **throws** (not warns) above `BUDGET_GZIP`:

```
budget    229,376 B
current   227,519 B   (manifest.json, committed — authoritative)
headroom    1,857 B
marginal      210 B per tile   (v607 225,210 -> v618 227,519, twelve pairs, linear)
```

**1,857 / 210 ≈ 9 tiles.** The next session hits this, mid-loop, as a red build.

The script's own comment says to shave `CAP.band` again, then `MAX_BANDS`. That advice is running out: the
band count was already cut 4→3 at ~1253 tiles, cutting it to 2 was tried at ~1397 and **reverted because it
regressed a golden search probe**, and `CAP.band` was cut 92→64 instead. Each shave costs search quality and
buys a few hundred tiles at most. Raising the budget just moves the wall while growing a payload the client
actually downloads.

**Proposed: split the corpus into an index and a detail tier.**

`app.js:4155` fetches the whole 719 KB / 227 KB-gzipped `corpus.json` as one blob before the first search.
Most of that weight is prose nobody queries by — band text, expected values, long summaries — carried for
1,468 tiles so that a handful can match.

- **Tier 1 (always fetched):** id, name, synonyms, specialties. High signal, small, and the only thing
  ranking needs to *find* a tile. Estimated 40–60 KB gzipped, and it grows ~30 B/tile rather than 210.
- **Tier 2 (fetched on demand):** everything else, sharded — per first-letter or per fixed-size bucket —
  and pulled only when a query needs to disambiguate or an answer card is rendered.

This removes the ceiling instead of postponing it, and cuts the first-search payload roughly fourfold.

**Risk and how to hold it:** `test/mcp/mcp-search-relevance.test.js` already pins golden probes for every
tile, and the MAX_BANDS revert proves those probes catch quality regressions. Any tiering change must leave
that suite green with no probe weakened. **Do not weaken a probe to make a tiering change pass.**

**Cheap immediate unblock if the next session is mid-loop:** cut `CAP.band` 64→48 and re-run `test:mcp`.
That is a stopgap, not the fix, and it should be recorded as such.

## 2. Every calculator use downloads all 1,098 modules

`app.js` statically imports **526 view modules** at the top:

```js
import { renderers as RV618 } from './views/group-v618.js';
...
const RENDERERS = { ...RA, ...RB, /* ...520 more... */ };
```

There is no bundler. `index.html` loads `<script type="module" src="app.js">`, so the browser walks the
whole graph: **1,098 files, 12.08 MB raw, 2.73 MB gzipped** — to use one calculator. Add the corpus and a
first search costs about **3 MB**.

The pre-rendered tool pages do not help: `dist/tools/erefs/index.html` is 8 KB with **zero `<input>` or
`<select>` elements**. They are copy and SEO surfaces that link to `/#erefs`, where the real calculator
lives. So every actual calculation pays the full graph.

**This is the cost that scales with the plan.** At ~12 KB per pair, the next hundred tiles add ~1.2 MB raw.

**Proposed: route-level code splitting.** Replace the 526 static imports with a lazy `import()` keyed by tile
id, so a route loads the app shell plus that one tile's view and lib. A given tile should land in the low
hundreds of KB instead of 2.73 MB, and — the point — **stop growing with the catalog**.

**Risk and how to hold it:** `RENDERERS` is consumed synchronously today, so routing becomes async. That is
a real refactor, but it is unusually well covered: the e2e test `every tool route renders without console
errors and shows an h1` already walks **every** tool route and is the gate that caught the arc-hbr renderer
crash. It will catch a broken lazy route the same way. Keep both `all-tools.spec.js` tests in the gate chain.

## 3. CI is expensive but is not the scaling problem

43 minutes per push is the throughput limit — roughly 1.4 pushes an hour, which is what actually paced the
last hundred pairs. But it is **flat**: 2548–2639 s across the last eight runs with no upward trend, so it is
dominated by fixed e2e cost, not by catalog size.

**Recommendation: leave it alone for now.** It caps iteration speed but it is not a wall, and it is the
easiest place to burn effort for the least return. Two contingent items, neither urgent:

- 1,482 OG PNGs (18 MB) are regenerated every build. Making that incremental is low risk, but the build is
  ~20 s when the machine is idle, so **measure before optimizing** — this may be worth nothing locally and
  only matter for deploy weight.
- If CI ever does start trending up, shard `all-tools.spec.js` before touching anything else.

## Ordering, and what not to do

1. **Corpus tiering** — unblocks the next nine tiles' worth of work. Do this first.
2. **Route-level code splitting** — the user-facing win, and the one that decouples payload from catalog size.
3. **Nothing in CI** until it stops being flat.

**Explicitly not proposed:** adding a bundler to a repo that has deliberately shipped dependency-free ES
modules; rewriting the renderer or view conventions; touching `lib/` compute or any clinical content. None of
that is what the measurements point at, and the tile conventions are load-bearing for 1,468 tiles.

**Every number above is reproducible** from the commands in this session: `manifest.json` history for the
corpus trend, a transitive-import walk from `app.js` for the module graph, `gh run list` for CI timings.
