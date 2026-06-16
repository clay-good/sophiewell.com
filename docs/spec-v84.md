# spec-v84.md — Complete the offline shell precache (favicons, web manifest, topbar logo)

> Status: **IMPLEMENTED (2026-06-16). Catalog unchanged at 366.**
> Housekeeping with a correctness angle, not a new tile — and a direct
> completion of [spec-v75](spec-v75.md). v75 set out to precache "the full
> application shell — every file `index.html` loads," but only added the two
> shell *scripts* (`theme.js`, `file-origin-guard.js`) it had been missing. It
> overlooked the six remaining local assets the head and topbar reference: the
> four icon files, `site.webmanifest`, and `logo.png` — the brand `<img>` that
> renders in the topbar on **every** view. So an offline cold reload still drew a
> broken logo and dropped the favicons/manifest. v84 adds those six to
> `SHELL_ASSETS`, making the precache list the *complete* static shell, and adds
> a unit guard so the list can never silently fall behind `index.html` again.
> Every prior spec (v4–v83) remains in force; no runtime network call, no AI, no
> new tile.

## 1. Thesis

`sw.js` precaches a **shell** (`SHELL_ASSETS`, fetched at `install`) and lazily
caches the **data** layer (`DATA_CACHE`, populated cache-first by the `fetch`
handler). spec-v75 corrected the data half of the drift (it removed ten stale
`/data/*` manifest entries) and *began* completing the shell half (it added
`theme.js` and `file-origin-guard.js`). But the shell was still incomplete.

`index.html` references exactly ten local resources via `<link>`, `<script>`,
and `<img>` tags:

| `index.html` reference | in `SHELL_ASSETS` before v84? |
|---|---|
| `styles.css`, `app.js`, `theme.js`, `file-origin-guard.js` | yes |
| `favicon.ico` | **no** |
| `favicon-32x32.png`, `favicon-16x16.png` | **no** |
| `apple-touch-icon.png` | **no** |
| `site.webmanifest` | **no** |
| `logo.png` (topbar brand `<img>`, every view) | **no** |

The install handler swallows individual fetch failures (`try/catch`, install
still resolves), so the gap never surfaced at runtime — and the lazy shell
cache-first path picks these up on the first *online* visit. But a true cold
offline load (first visit offline, or after a cache eviction) had only the
shell-minus-six, so `logo.png` rendered as a broken image in the topbar. That
contradicts the contract `sw.js`'s own comment states: precache *every file the
shell loads*.

## 2. The change

```
sw.js  SHELL_ASSETS
  +  ./favicon.ico
  +  ./favicon-32x32.png
  +  ./favicon-16x16.png
  +  ./apple-touch-icon.png
  +  ./site.webmanifest
  +  ./logo.png                       (the six head/chrome assets index.html loads)
  (kept: ./, ./index.html, ./styles.css, ./app.js, ./theme.js,
         ./file-origin-guard.js, ./CHANGELOG.md, ./docs/stability.md)
```

The comment block is rewritten to state the completed contract and point at the
new guard. The `install` / `activate` / `fetch` handlers, the `DATA_CACHE`
cache-first logic, and the build-time `BUILD_HASH` stamping
(`scripts/build.mjs`) are all unchanged.

### New guard: `test/unit/sw-shell.test.js`

A unit test parses `index.html` for every local `<link href>` / `<script src>` /
`<img src>` (skipping absolute, protocol-relative, anchor, `mailto:`, `data:`
and `tel:` URLs), normalizes each to the `./x` form, and asserts every one is in
`SHELL_ASSETS`. The check is **one-directional**: every shell asset must be
precached, but `SHELL_ASSETS` may carry extras (`CHANGELOG.md` and
`docs/stability.md` are fetched by JS for the changelog/stability doc tiles, not
referenced in the HTML). A second case asserts no entry is a `/data/*` manifest
(the v75 drift) and that all entries are relative `./` paths. This makes the
"precache the whole shell" invariant enforced, not aspirational — the failure
mode both v75 and v84 hit (a hand-maintained list silently falling behind the
HTML) can no longer ship undetected.

## 3. Robustness

- No behavior change online: all six assets were already served from the origin
  and cached lazily on first fetch; precaching only improves the offline cold
  path.
- The `install` handler already tolerates a failed asset fetch, so the change
  cannot regress install even if an asset is briefly unavailable mid-deploy.
- All six assets are emitted into `dist/` by the existing build
  (`build-favicons.mjs` for the icons; `COPY_FILES` for `site.webmanifest` and
  `logo.png`), so the precache targets exist in production.

## 4. Files touched

```
docs/spec-v84.md                     (this file)
sw.js                                (SHELL_ASSETS: add the 6 head/chrome assets; rewrite comment)
test/unit/sw-shell.test.js           (new guard: index.html local assets ⊆ SHELL_ASSETS; no /data/* entries)
README.md                            (intro spec-progression range -> v84)
CHANGELOG.md                         (Unreleased: v84 entry, +0 catalog delta)
```

## 5. Acceptance criteria

- `sw.js` `SHELL_ASSETS` contains the full shell: `./`, `index.html`,
  `styles.css`, `app.js`, `theme.js`, `file-origin-guard.js`, `favicon.ico`,
  `favicon-32x32.png`, `favicon-16x16.png`, `apple-touch-icon.png`,
  `site.webmanifest`, `logo.png`, `CHANGELOG.md`, `docs/stability.md` — and no
  `/data/*` manifest paths.
- `test/unit/sw-shell.test.js` passes (every local `index.html` asset is
  precached; no data-shard entries).
- `UTILITIES.length` is still **366**; all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` pass; the
  full e2e suite stays green.
- The CHANGELOG records v84 with a +0 catalog delta.

## 6. Out of scope for v84

- **No re-introduction of a curated data-precache list** — that is exactly the
  drift v75 removed; the lazy `DATA_CACHE` remains the durable mechanism for
  tile datasets.
- **No new input, no new tile, no change to any tile's computed output.**
