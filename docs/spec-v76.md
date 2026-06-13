# spec-v76.md — The tool-page builder's discovery-surface allowlists name only live tiles, and prove it

> Status: **IMPLEMENTED (2026-06-13). Catalog unchanged at 337.**
> Housekeeping with a correctness angle, in the lineage of [spec-v75](spec-v75.md)
> (dead service-worker precache entries). The static tool-page builder
> ([scripts/build-tool-pages.mjs](../scripts/build-tool-pages.mjs)) classifies
> each tile's schema.org discovery surface (`MedicalCalculator` vs `HowTo` vs
> `Dataset` vs `Reference`) from three hand-curated allowlists — `HOW_TO_TILES`,
> `DATASET_TILES`, `REFERENCE_TILES`. `HOW_TO_TILES` still named **seven tile ids
> retired in the [spec-v29](spec-v29.md) prune** (`decoder`, `eob-decoder`,
> `msn-decoder`, `insurance-card`, `abn-explainer`, `cms1500`, `ub04`). Because
> `classify()` is only ever called on live tiles, the dead ids never matched and
> emitted nothing — but the surrounding comment frames each set as *"an explicit
> choice a contributor makes about a tile's discovery surface,"* so the dead
> entries were actively misleading: they advertised seven tiles that do not
> exist. v76 removes them and adds a **build-time guard** that fails loudly if any
> allowlisted id is not in the live catalog, so this class of drift can never
> silently return. Every prior spec (v4–v75) remains in force; no runtime network
> call, no AI, no new tile, and **no change to any generated page** (the seven
> dead ids produced no output before or after).

## 1. Thesis

`build-tool-pages.mjs` pre-renders one `/tools/<id>/index.html` per live tile.
`classify(tile)` decides the page's `additionalType` JSON-LD from three sets:

```
HOW_TO_TILES      → schema.org/HowTo      (template/workflow generators)
DATASET_TILES     → schema.org/Dataset    (bundled reference datasets)
REFERENCE_TILES   → MedicalWebPage        (lookup tables, not a calculator)
default           → schema.org/MedicalCalculator
```

The sets are an **allowlist over live tiles**: `main()` iterates `UTILITIES`
(parsed from `app.js`), and for each *live* tile asks the sets which surface it
belongs to. An id in a set that is *not* a live tile is therefore inert — it is
a key no live tile will ever look up. That is exactly why the seven spec-v29
removals lingered undetected: removing a tile from the catalog does not remove
its id from these sets, and nothing complained.

This is the same failure shape as spec-v75 (`SHELL_ASSETS` precaching ten
retired dataset manifests): a hand-maintained list that the runtime tolerates
when it drifts, so the drift hides. The durable fix is the same — **make the
drift fail a gate**, not rely on someone noticing the stale comment.

### The seven dead ids

| dead id in `HOW_TO_TILES` | removed in | live today? |
|---|---|---|
| `decoder`, `eob-decoder`, `msn-decoder`, `insurance-card`, `abn-explainer` | spec-v29 (Group C decoders) | **no** |
| `cms1500`, `ub04` | spec-v29 (Group L printable forms) | **no** |

The remaining `HOW_TO_TILES` members (`appeal-letter`, `hipaa-roa`, `prep`,
`prior-auth`, `hipaa-auth`, `roi`, `discharge-instr`, `specialty-visit`,
`wallet-card`, `sbar-template`, `ems-doc`) are all live, as are the sole
`DATASET_TILES` member (`sti-screening`) and all three `REFERENCE_TILES`
(`peds-dose`, `anticoag-reversal`, `co-cn-antidote`). An exhaustive sweep of
every other hardcoded tile-id list in `scripts/`, `lib/`, and CI config found
**no other dead-id drift** — `REMOVED_V29_IDS` (app.js) is the intentional
tombstone map, the topic/hub/sitemap lists carry route slugs (not tile ids), and
the `lib/meta.js` backfill objects are all keyed by live ids.

## 2. The change

```
scripts/build-tool-pages.mjs
  HOW_TO_TILES
    -  'decoder', 'eob-decoder', 'msn-decoder', 'insurance-card', 'abn-explainer'   (Group C decoders — gone in v29)
    -  'cms1500', 'ub04'                                                            (Group L printable forms — gone in v29)
    (comment retitled: "Group C template generators"; the now-empty
     "Group L printable forms" comment removed; the stale HowTo-recipe
     comment "decoders + template generators" → "the template/workflow generators")

  main()  + guard (new):
    after the catalog loads, assert every id in
    HOW_TO_TILES ∪ DATASET_TILES ∪ REFERENCE_TILES is a live tile id;
    throw with the offending ids if not.
```

The guard runs inside `npm run build` (the CI **Static build** step and a
prerequisite of `npm run test:e2e`), so a future tile removal that forgets to
prune these sets fails the build with a precise message naming the orphan ids
and where to fix them.

## 3. Robustness

- **No page-output change.** `classify()` only ever ran against live tiles; the
  seven dead ids produced zero pages before and produce zero pages now. Every
  `/tools/<id>/` page's JSON-LD `additionalType` is byte-identical.
- **The guard is the test.** Verified two ways: the clean catalog passes the
  guard (build is green), and injecting a synthetic dead id into a set makes the
  build throw `classify() allowlist names 1 non-catalog tile id(s): <id>`. No new
  spec file needed for a separate test — the build *is* the guard, exactly as
  spec-v75 used the corrected `no-network.spec.js` as its guard.
- **Parse-based, like its siblings.** The live id set is derived from the same
  `loadUtilities()` parse the builder already uses; no new source of truth.

## 4. Files touched

```
docs/spec-v76.md               (this file)
scripts/build-tool-pages.mjs   (HOW_TO_TILES: drop 7 spec-v29-removed ids; comments; + live-catalog guard in main())
SECURITY.md                    (drift fix: pinned-dep example ESLint 9.17.0/playwright 1.49.1 → 9.39.4/1.59.1, matching package.json)
README.md                      (intro spec-progression + range → v76)
CHANGELOG.md                   (Unreleased: v76 entry, +0 catalog delta)
```

The `SECURITY.md` edit is an unrelated doc-drift fix folded in: the
"Pinned dev dependencies" bullet cited ESLint `9.17.0` and `@playwright/test`
`1.49.1` as the current versions, but `package.json` pins `9.39.4` and `1.59.1`.
The *posture* (exact-version pins, no `^`/`~`) was already true; only the example
version strings had gone stale.

## 5. Acceptance criteria

- `HOW_TO_TILES`, `DATASET_TILES`, `REFERENCE_TILES` contain only ids present in
  the live `UTILITIES` catalog; `build-tool-pages.mjs` throws otherwise.
- `npm run build` writes 337 `/tools/<id>/` pages with byte-identical JSON-LD to
  before the change.
- `SECURITY.md`'s pinned-dependency example matches `package.json`.
- `npm run lint`, `npm run test`, `npm run sbom`, `npm run build`, and the full
  e2e suite stay green; `UTILITIES.length` is still **337** and all
  catalog-truth surfaces agree.
- The CHANGELOG records v76 with a +0 catalog delta.

## 6. Out of scope for v76

- **No data-directory deletion.** The bundled corpus (e.g. `data/icd10cm`,
  `data/mpfs`, `data/clinical`) is retained per [spec-v75](spec-v75.md) §6;
  pruning the bundled datasets is a separate data-scope decision, not a
  builder-allowlist change.
- **No new discovery surface.** The four `additionalType` buckets and their
  membership for live tiles are unchanged; v76 only removes ids for tiles that
  do not exist.
- **No new input, no new tile, no change to any tile's computed output.**
