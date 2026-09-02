# spec-v998 — Three of the "retired" datasets were never retired

## The finding

spec-v996 split `docs/data-sources.md`'s retired-dataset section into two lists and said the
remaining question — *which of these can actually be deleted?* — needed a per-dataset check of how
each is loaded, not a grep, because the first grep-based answer had been wrong.

That check is done. A dataset reaches the browser exactly two ways: a `loadFile` / `loadShard` /
`loadAllShards` / `loadManifest` call in `app.js`, `lib/` or `views/`, or a
`META[id].source.dataset` declaration. Nothing else.

It found the error in the other direction. **Three folders on the "tile retired" list are not
retired at all:**

| Dataset | Loaded by | Live tile |
| --- | --- | --- |
| `mpfs/` | `views/group-b.js:208` | `rvu-payment` |
| `icd10cm/` | `views/group-b.js:936` | `icd10-validate` |
| `drg/` | `views/group-b.js:1036` | `drg-payment` |

All three tiles are in `UTILITIES` and all three load their dataset at render time. They were
listed as retired because the spec-v29 waves named their *folders* alongside the ones whose tiles
really went.

The other twenty-eight are confirmed unreachable — 44.9 KB. Every apparent mention of one of them
in `app.js` is its **tile id inside a `REMOVED_V29_IDS` tombstone list**, which is exactly what
made the grep answer misleading.

## The decision, recorded

Keeping the twenty-eight is deliberate as of 2026-09-02, not an oversight: they are seeds a future
tile can be built against, and several are CMS code sets a billing tile would want. The cost is
written down so the call can be revisited with the numbers rather than re-derived: 44.9 KB in the
bundle, twenty-eight manifests through `npm run data:verify` on every run, and twenty-eight of the
forty-six datasets the weekly refresh re-stamps.

## What holds it

`test/unit/retired-datasets.test.js` gains two assertions on top of spec-v996's three:

- Nothing on the still-built list can actually be loaded. Negative-tested: adding a
  `loadFile('tccc', …)` call to a renderer fails it, naming `tccc`.
- Nothing a tile loads is missing from `data/`.

Together with the coverage assertion, the doc can no longer say a dataset is retired while a tile
loads it, say one is deleted while it is on disk, say one is present while it is gone, or leave a
folder out entirely.
