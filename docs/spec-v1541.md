# spec-v1541 — Offline that survives the field

Program: [scope-field-health.md](scope-field-health.md). Platform spec; builds no tile. It makes
the offline promise true for someone who gets a signal once a week.

## What works today, and what breaks

Read from `sw.js`, `app.js`, `scripts/build.mjs` and `test/integration/works-offline.spec.js`
(inferred from the code, not yet run on a device):

| Today | Effect in the field |
|---|---|
| `app.js` statically imports every view and lib module (about 1,840 files, about 18 MB raw, about 4.1 MB gzipped as one stream, about 5.8 MB gzipped file by file) | One complete online visit caches everything, so every tile works offline afterwards. But a visit interrupted on 2G leaves a partial cache and an app that cannot boot offline |
| The service worker precaches 12 shell files; everything else is cached as it happens to load | What is offline depends on what loaded before the signal dropped |
| `BUILD_HASH` is the commit, and there were 92 commits in the last 7 days | Every deploy is a new cache name |
| On activate, the new worker deletes every older cache, then precaches only 12 files | **A phone that updates during a brief signal is dead at its next offline open**: the module cache it depended on was deleted and the replacement was never downloaded |
| `data/fields/*` (search prefill), dataset shards, and `/tools/<id>/` pages load only when first visited | Each returns a 504 or a broken page offline |
| `navigator.storage.persist()` is never called | The browser may evict the cache when the phone runs low on storage |
| `file-origin-guard.js` tells a `file://` user to run `npm run dev` | Useless to a health worker |
| `works-offline.spec.js` checks that the 12 files are cached | Its own header says it does not prove the app renders from them. No test boots the app offline or after an update |

## What this spec builds

### 1. A complete, atomic precache

- **The build writes `precache-manifest.json`**: every module in `app.js`'s static import graph
  (walked by the build, not listed by hand), the shell, the search corpus, the field index
  shards, and `data/tool-copy`. Each entry has a content hash.
- **Install succeeds only if every entry is stored.** Today failures are swallowed. Under this
  spec, one failed fetch fails the install, and the old worker stays in control.
- **No `skipWaiting()` until the new cache is complete.** The old cache is deleted only after the
  new one has every entry. A half-downloaded update is invisible to the user.
- **A pack version separate from the commit.** The cache name is derived from the manifest's
  combined content hash, not `BUILD_HASH`. A docs-only commit, a test change, or a copy fix to a
  page that is not in the shell does not change it, so a phone does not re-download 5 MB for a
  commit that changed nothing it runs.
- **Update only what changed.** On an update, entries whose hash is unchanged are copied from the
  old cache instead of fetched. A one-tile fix costs one file, not the catalog.
- `navigator.storage.persist()` is requested after the first complete install. The result is not
  surfaced unless it is refused, in which case the offline status line (§3) says the phone may
  clear the saved copy when storage runs low.

### 2. Deep links work offline

- Every prerendered page (`/tools/<id>/`, `/for/`, `/topics/`) is in the precache manifest, or
  the navigation fallback serves the app with root-absolute asset URLs so a never-visited
  `/tools/<id>/` still boots. Choose one during build; the test in §5 decides.
- An offline miss on a data shard renders a readable message in the tile ("This list needs a
  connection the first time"), never a raw 504 body.

### 3. One line of status, and no more

The product direction is minimalist (search, find, use, leave). This adds **one line** in the
footer, and nothing on the home box:

- *"Saved for offline use, version of September 25, 2026."* when the pack is complete.
- *"Saving for offline use… 40%."* while installing.
- *"An update is ready. It will be used the next time you open the site."* when a new pack has
  finished installing in the background.

The date is the pack's build date, so a supervisor can see whether two phones carry the same
edition. No banners, prompts, or install nags. The browser's own "Add to home screen" is the
install path.

### 4. Smaller boot for small phones

About 18 MB of JavaScript is parsed on every cold boot. On a 1–2 GB RAM Android Go phone that
has never been measured.

- **Measure first**: a Lighthouse or WebPageTest run at 4x CPU slowdown on the home view and
  four tile routes, recorded in `docs/performance.md`, which today states a home-view figure
  that counts `app.js` alone and not the modules it imports. Correct that figure in the same
  change.
- **Then, if boot is over 5 seconds at 4x slowdown**, move views to dynamic `import()` behind the
  existing registry, so boot parses the shell and search, and a tile's module is parsed when it
  opens. The precache still stores every module, so offline behavior does not change. This is
  the prerequisite for any future subset pack.

### 5. Tests that prove it

The existing spec's lesson holds: both ways of faking offline in Playwright (`setOffline`,
`route` plus `abort`) pass even with the cache emptied, so they prove nothing. These tests read
Cache Storage directly:

1. **Complete install**: after install, every entry in `precache-manifest.json` is present in
   the active cache.
2. **Offline boot**: with the network routed to fail and the page loaded from the cache only,
   the home box renders, search returns results, and three tiles from different groups compute
   their worked examples.
3. **The update window**: install version A; serve version B and let B's install fail halfway;
   confirm A's cache is intact and still boots offline.
4. **Unchanged entries are not refetched** on an update that changes one module.
5. **A never-visited `/tools/<id>/` page** boots offline.

### 6. Sharing without internet

- **The `file://` banner** is rewritten for a non-developer: *"Open sophiewell.com in Chrome
  once with a connection; after that it works without one."* The developer instruction moves to
  CONTRIBUTING.
- **A packaged Android app is out of scope for this spec**, and recorded as an owner decision in
  spec-v1564. Research found the only true offline-sharing path is a WebView app that bundles
  the files (a Trusted Web Activity does not carry the site and is blank until online). It would
  work over Nearby Share, but it needs sideloading, and a copy passed phone to phone has no
  update path, so a stale dose table could circulate for years. If the owner chooses it, it
  prints its pack date on every page and refuses to open when older than the high-volatility
  review window (spec-v1540 §8).

## Acceptance

The five tests in §5 pass in CI. `docs/performance.md` records measured boot and transfer size at
4x slowdown. A docs-only commit leaves the pack version unchanged (tested by building twice, with
and without a docs change, and comparing). The `file://` banner no longer mentions npm.

## Build status

**§1, §2, §3, §5 and §6 built October 3, 2026. §4 is not built.**

| Part | What was built |
|---|---|
| §1 Pack | `scripts/build-precache.mjs` walks the app from the shell (static `import`, re-exports, literal `import()`, and worker `new URL(..., import.meta.url)`) and adds the search corpus, `data/synonyms.json`, `data/fields/` and `data/tool-copy/`: 2,566 entries, 21.9 MB raw. Each entry has a content hash. The version hashes the entries plus every other file under `lib/`, `views/`, `data/`, `vendored/` and `samples/`, so a lazily fetched dataset still changes it. `lib/build-info.js` (the per-commit receipt stamp) is left out of the version. A rebuild after a docs-only edit gave the same version, `b687c2208a5a4234`. |
| §1 Install | `sw.js` fails the install on any failed entry, stores the manifest last as the completion mark, copies entries with unchanged hashes from the previous complete pack, and resumes a partial install from what is already stored. Old caches are deleted on activate, which only follows a complete install. |
| §1 persist | Requested from the page once the pack is complete. Firefox shows its own permission prompt for this; Chrome does not. |
| §2 Deep links | Option two: a navigation that misses offline redirects `/tools/<id>/` to `/#<id>` (and `/for/`, `/topics/` to `/`), because the 1,964 prerendered pages are 23 MB. Prerendered pages are network-first, so a copy fix is seen online. An offline dataset miss returns a 504 marked `X-Offline`, and `lib/data.js` turns it into "This list needs a connection the first time it is used." Whether every tile prints that message rather than its own error was not swept. |
| §3 Status | `lib/offline-status.js`: one footer line, `#offline-status`, as written in §3, plus the storage warning when `persist()` is refused. |
| §5 Tests | `test/integration/works-offline.spec.js` (Chromium) runs its own server over `dist/` with `Cache-Control: no-store` and goes offline by dropping every connection. It covers all five cases. With the pack cut to the shell, the offline-boot and deep-link tests fail. The version rule and the status line are unit-tested in `test/unit/offline-pack.test.js`. The `:4175` Playwright server, used only by the old test, is removed. |
| §6 Banner | `file-origin-guard.js` now speaks to a health worker. The developer instruction was already in the README ("To run your own copy"). |

**Not built:** §4. Boot at 4x CPU slowdown has not been measured, and `docs/performance.md` has not been corrected. Lazy view loading waits on that measurement.
