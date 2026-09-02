# spec-v996 — Retiring a tile did not delete its dataset

## The finding

`docs/data-sources.md` has a section headed **"Retired datasets"**: *"The following data folders
were bundled in v1-v8 and have been retired."* It then lists forty folders under the spec-v29
wave 29-2 and spec-v10 waves.

Twenty-eight of the forty are still on disk. They are still produced by
`scripts/build-data.mjs`, still hashed into a manifest, still verified by `npm run data:verify`,
still copied into `dist/`, and still re-stamped every Sunday by the weekly refresh. What those
waves retired was the **tiles**. The doc conflated the tile with the dataset, and one buried aside
— *"Some folders linger on disk but no tile reads them"* — was the only trace.

Three more folders in exactly the same state were named in **no list at all**:
`hcpcs-modifiers/`, `pos-codes/` and `revenue-codes/`, the pieces the old `crosswalks/` dataset
was split into. Those were found by the coverage assertion below rather than by reading, which is
the point of writing one.

## What changed

The section is now two lists — twelve folders that are gone, thirty-one that are still built —
and `test/unit/retired-datasets.test.js` parses those lists out of the doc's own prose and holds
them to the tree:

1. A folder listed as deleted must not exist.
2. A folder listed as still-built must exist.
3. **Every** folder under `data/` must be accounted for: named in one of the two lists, read by a
   tile through `META.source.dataset`, or in the small build-time set (`search-corpus`, `fields`,
   `tool-copy`, `workflow`, `clinical`). The original defect was a folder existing while the doc
   said it did not; a folder nobody has written down at all is the same blind spot from the other
   side.

Each of the three was negative-tested: recreating `data/nadac/` fails (1), moving `data/apc/`
away fails (2), and adding an undocumented folder fails (3).

## What this deliberately does not do

It does not delete anything. The tempting claim — "thirty-one datasets nothing reads, delete them"
— is one I measured wrong on the first pass. `META.source.dataset` is not the only load path:
`toxidromes/` is read by a live tile through a different one, and several of the folders are named
in `lib/pa/` as *source identifiers* rather than as data loads. Sixteen of the thirty-one are not
mentioned anywhere in `app.js`, `lib/` or `views/` and are the obvious candidates, but deciding
which can go needs a per-dataset check of how each is actually loaded, not a grep.

The prize for doing that work is not mainly the 50.2 KB. **Thirty-one of the forty-six datasets
the weekly refresh re-stamps are in this list**, which is most of what makes that pull request
noise — the same noise spec-v987 was about.
