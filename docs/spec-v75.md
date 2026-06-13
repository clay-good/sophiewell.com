# spec-v75.md — Precache the live shell in the service worker, not removed datasets

> Status: **IMPLEMENTED (2026-06-13). Catalog unchanged at 337.**
> Housekeeping with a correctness angle, not a new tile. The service-worker
> precache list ([sw.js](../sw.js) `SHELL_ASSETS`) still named **ten code-lookup
> dataset manifests** that were retired in the [spec-v29](spec-v29.md) prune:
> **five of those directories no longer exist** (their install-time fetch 404'd
> and was silently swallowed), and **none of the ten is fetched by any current
> tile**. Meanwhile the list **omitted two shell scripts** the page actually
> loads (`theme.js`, `file-origin-guard.js`), so an offline cold reload would
> miss them. v75 replaces the stale dataset block with the complete app shell;
> dataset manifests and shards remain cached lazily on first fetch via the
> existing `DATA_CACHE` path. The matching stale offline test (which navigated a
> removed tile) is also corrected. Every prior spec (v4–v74) remains in force; no
> runtime network call, no AI, no new tile.

## 1. Thesis

`sw.js` has two caches: a precached **shell** (`SHELL_ASSETS`, fetched at
`install`) and a lazy **data** cache (`DATA_CACHE`, populated cache-first by the
`fetch` handler the first time any `/data/*` URL is requested). The shell list
had drifted badly:

| `SHELL_ASSETS` data manifest | directory today | fetched by a live tile? |
|---|---|---|
| `icd10cm`, `hcpcs`, `cpt-summaries`, `mpfs`, `ndc` | exists (bundled corpus) | **no** — the lookup tiles were removed in spec-v29 |
| `nadac`, `npi`, `ncci`, `mue`, `hospital-prices` | **gone** | **no** — 404 on install, swallowed |

So all ten precache entries were dead weight: five 404'd, and the other five
precached datasets that no surviving tile reads. At the same time, the shell
itself was *incomplete* — `index.html` loads `styles.css`, `app.js`,
`theme.js`, and `file-origin-guard.js`, but the precache list carried only the
first two. (Lazy shell caching still picks the missing two up on first online
load; precaching them makes an offline cold reload robust.)

The lazy `DATA_CACHE` already handles offline data for **every** live tile: the
first time a tile fetches its dataset online, the shard is cached cache-first.
Precaching a hand-maintained subset of manifests duplicates that, and — as this
drift shows — rots as the catalog changes. The honest contract is: **precache
the shell, lazily cache the data.**

## 2. The change

```
sw.js  SHELL_ASSETS
  -  ./data/icd10cm/manifest.json  ./data/hcpcs/manifest.json
  -  ./data/cpt-summaries/manifest.json  ./data/mpfs/manifest.json
  -  ./data/nadac/manifest.json  ./data/ndc/manifest.json
  -  ./data/npi/manifest.json  ./data/ncci/manifest.json
  -  ./data/mue/manifest.json  ./data/hospital-prices/manifest.json   (10 stale entries removed)
  +  ./theme.js  ./file-origin-guard.js                               (the two shell scripts the list omitted)
  (kept: ./, ./index.html, ./styles.css, ./app.js, ./CHANGELOG.md, ./docs/stability.md)
```

The comment block is rewritten to state the shell-vs-lazy-data contract. The
`install` / `activate` / `fetch` handlers, the `DATA_CACHE` cache-first logic,
and the build-time `BUILD_HASH` stamping (`scripts/build.mjs` rewrites
`dist/sw.js` so each deploy gets a fresh cache name) are all unchanged.

### Stale offline test corrected

[test/integration/no-network.spec.js](../test/integration/no-network.spec.js)
listed `icd10cm-lookup` in its three-tile sample as the "data-shard fetch"
representative — but that tile was removed in spec-v29, so navigating
`/#icd10cm-lookup` fell through the router to the home view and the test no
longer exercised any on-origin data fetch (it still passed, because it only
asserts the *absence* of off-origin calls). Swapped to `sti-screening`, a live
tile that fetches `/data/sti-screening/sti.json` on render (verified), so the
"on-origin `/data/*` fetch does not leak off-origin" path is genuinely covered
again.

## 3. Robustness

- No behavior change for live tiles: data was, and still is, cached lazily on
  first fetch; the removed precache entries fetched nothing a tile uses (five
  404'd). Adding `theme.js` / `file-origin-guard.js` strictly improves offline
  shell completeness.
- The `install` handler already tolerates a failed asset fetch
  (`try/catch`, install still resolves), so the change cannot regress install
  even if an asset is briefly unavailable mid-deploy.
- No new test file: the corrected `no-network.spec.js` *is* the guard, and it
  now exercises a real data-fetching tile. `pa-no-network.spec.js` (the PA-linter
  no-network path) is unaffected.

## 4. Files touched

```
docs/spec-v75.md                          (this file)
sw.js                                      (SHELL_ASSETS: drop 10 stale dataset manifests, add theme.js + file-origin-guard.js; rewrite comment)
test/integration/no-network.spec.js        (SAMPLE_TILES: icd10cm-lookup -> sti-screening; comment)
README.md                                  (intro spec-progression + range -> v75)
CHANGELOG.md                               (Unreleased: v75 entry, +0 catalog delta)
```

## 5. Acceptance criteria

- `sw.js` `SHELL_ASSETS` contains the full shell (`./`, `index.html`,
  `styles.css`, `app.js`, `theme.js`, `file-origin-guard.js`, `CHANGELOG.md`,
  `docs/stability.md`) and no `/data/*` manifest paths.
- `no-network.spec.js` exercises a live data-fetching tile and stays green (no
  off-origin calls, no cookies, allowlisted storage only).
- `UTILITIES.length` is still **337**; all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` pass; the
  full e2e suite (incl. no-network on all engines) stays green.
- The CHANGELOG records v75 with a +0 catalog delta.

## 6. Out of scope for v75

- **The bundled `icd10cm` / `hcpcs` / `cpt-summaries` / `mpfs` / `ndc` data
  directories are not removed.** They are still produced by
  `scripts/build-data.mjs` and integrity-checked by `verify-integrity.mjs`
  (part of the bundled corpus); deleting them is a separate data-scope decision,
  not a service-worker change.
- **No re-introduction of a curated data-precache list** — that is exactly the
  drift this spec removes; the lazy `DATA_CACHE` is the durable mechanism.
- **No new input, no new tile, no change to any tile's computed output.**
