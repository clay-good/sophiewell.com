# spec-v936 — Two tiles on no hub at all

## The finding

`scripts/build-hub-pages.mjs` builds `dist/for/<audience>/` from a fixed `HUBS` map and fills
each page with the tiles whose `audiences` array contains that hub's **key**. An audience value
that is not a key is descriptive metadata and nothing more — it places the tile nowhere.

Two tiles were tagged only `facility-billing` and `coders`, and **neither names a hub**:

| Tile | Audiences | Hubs it reached |
| --- | --- | --- |
| `apc-payment` — OPPS APC Payment Estimate | `facility-billing`, `coders` | none |
| `drg-payment` — IPPS DRG Payment Estimate | `facility-billing`, `coders` | none |

Every other tile in the catalog reaches at least one. These two were findable only by search.

The fix is to add the key, not to invent a hub: the billers hub is labelled **"Billers and
coders"** and its own description already names **DRG and APC**. Their sibling `rvu-payment` —
the same kind of Medicare payment estimator — was already tagged `billers`. The billers hub now
lists 39 tiles, up from 37.

## The gate

`test/unit/hub-reachability.test.js` reads `UTILITIES` the same way the hub builder does and
requires every tile to carry at least one audience that names a hub. It is deliberately narrow:
a tile may carry any descriptive audience it likes, as long as one of them places it somewhere.
Negative-tested — removing the key again fails it by name, listing the tile and the audiences it
does have.

## A cut row, and why the count went down

Adding two tiles to a hub added two rows, and one of them tipped `check-page-copy`'s cut-row
ratchet from 775 to 776. `apc-payment`'s adapter summary opened with a 145-character sentence,
and the hub row is cut at about 100. Splitting the packaging rules into a second sentence lets
the row finish — so the count came back at **774**, one *below* where it started, because that
row now completes everywhere it appears.

## Also checked

The odd audience values are otherwise harmless. `posting`, `front-desk`, `credentialing` and
`nursing-icu` each appear on exactly one tile, and every one of those tiles also carries a
hub-backed audience — so they are inert descriptive tags, not placement errors. (`nursing-icu`
is a specialty term sitting in an audiences array, which is a category slip, but it changes
nothing a reader sees.)

## Files

`app.js` (two tiles retagged), `mcp/adapters/billing-v83.js` (one summary resentenced),
`test/unit/hub-reachability.test.js`, this file. No catalog change, no count change.
