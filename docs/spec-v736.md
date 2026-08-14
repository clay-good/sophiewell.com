# spec-v736.md — Tier the search corpus (reclaim the build budget)

> Status: **SHIPPED (2026-08-14).** Refactor, no catalog change (stays 1566 / MCP 1542). Implements
> the "corpus tiering" fix proposed in [spec-v619](spec-v619.md) §1.

## Why

`scripts/build-search-corpus.mjs` **throws** when the single `corpus.json` exceeds its gzip budget.
At 1566 tiles the blob was ~225 KB against a 226 KiB ceiling — **~4 tiles of headroom**, after which
every new tile would red the build mid-loop. The cheap levers (`CAP.band`, `MAX_BANDS`) were exhausted
and each cost search quality. The real fix is to stop carrying the low-find-signal prose in the
budgeted, always-fetched blob.

## What it does

Splits the corpus into two files along the seam `lib/search-corpus.js` already defines
(`corpusDesc`/`corpusOneLiner` read exactly the Tier-2 fields):

| File | Tier | Fields | gzip @ 1566 | Growth |
|------|------|--------|-------------|--------|
| `corpus.json` | 1 (budgeted, always) | name, group, audiences, specialties | **50.3 KB** (was 225) | ~35 B/tile |
| `corpus-detail.json` | 2 (guardrail 320 KB) | summary, what, when, expected, bands | 184.1 KB | ~210 B/tile |

The hard budget now applies to **Tier 1 only**, which drops the ceiling from ~4 tiles of headroom to
thousands. Both consumers — `app.js` (browser) and `mcp/tools.js` (Node) — fetch/read both files and
**merge them per id before ranking**, so ranking sees the exact same row as the pre-tiering single
file. Ranking behavior is byte-for-byte unchanged; only the on-the-wire layout changed.

## How the risk is held

- **Golden probes:** `test/mcp/mcp-search-relevance.test.js` (the suite the earlier `MAX_BANDS` revert
  proved catches quality regressions) stays green — the merged row is identical.
- **Band-text routing:** the `smoke.spec.js` band-text→chads e2e now waits for `corpus-detail.json`
  (the tier that carries band text) and passes.
- **No off-origin creep:** the second fetch is same-origin `data/`; `no-network.spec.js` passes.
- **Determinism:** `test/unit/search-corpus.test.js` now rebuilds and byte-compares **both** files and
  checks both manifest hashes; manifest bumped to `version: 2` with a `detail` sub-object.
- **Degrade-gracefully contract preserved:** if Tier 2 fails to load, Tier 1 still ranks on
  name/specialties; if both fail, search falls back to name/id/synonym routing.

## Files

- `scripts/build-search-corpus.mjs` — split rows into Tier 1 / Tier 2, budget each, write both + manifest v2.
- `mcp/tools.js` — read both files, merge per id into the corpus cache.
- `app.js` — fetch both, merge per id into `SEARCH_CORPUS`.
- `test/unit/search-corpus.test.js` — Tier-2 row/count/dash/gzip/hash/determinism checks.
- `test/integration/smoke.spec.js` — wait on `corpus-detail.json` for the band-text route.
- `data/search-corpus/{corpus.json, corpus-detail.json, manifest.json}` — regenerated.
- `docs/spec-v736.md` (this file).

## Not done (follow-ups, per spec-v619)

Tier 2 is still fetched at boot (in parallel), so the client download is unchanged — this reclaims the
**build ceiling**, not yet the first-search payload. Deferring Tier 2 to on-demand/sharded loading, and
route-level code splitting (spec-v619 §2), remain the next payload wins.
