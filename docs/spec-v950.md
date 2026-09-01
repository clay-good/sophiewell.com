# spec-v950 — A second signal for the duplicate finder, and the last citation the record could settle

## The second signal

spec-v947 fixed *how* the finder reads a name. This adds a signal that is not a name at all:
**do the two tiles cite the same paper?**

It is much sharper than name similarity — and on its own it is not evidence of a duplicate. One
guideline routinely defines several distinct instruments. Every pair in the catalog that scores
on both signals was read, and **all 24 turned out to be companions**: TG18 grades cholangitis
diagnosis and severity separately, the SUN working group grades anterior-chamber cell and flare
separately, one HOMA paper defines beta-cell function and insulin resistance.

So `sharesSource` is **reported beside the score** rather than used to widen the net. It tells
the reader *why* a pair matched, which is what makes a pair quick to rule on — and the 24 are
now recorded as `DISTINCT` with the reason, each written so a future reader does not have to
re-derive it.

Unruled pairs **121 → 106**, and no unruled pair now shares a source: that intersection is
exhausted.

## The citation

`rdw-index` was one of five frozen in `KNOWN_DISAGREEMENTS` as needing a human with the source.
Crossref settles it: Jayabose's RDW-based index is **a meeting abstract**, "#262", J Pediatr
Hematol Oncol 1999;21:314 — which is why every full-record search missed it and why the
citation names a single page rather than a range. Linked; frozen list **5 → 4**.

The other four stay. Two cite a paper no index carries under the numbers given, one names a
book chapter with no numbers at all, and `rhig-dose` describes AABB dosing guidance while its
numbers name a paper about RHD genotyping — that one is a question about what the tile's source
*is*, which no lookup can answer.

## Proof

| Check | Result |
| --- | --- |
| `node scripts/find-duplicate-tiles.mjs` | 125 pairs, **31 ruled** (was 12), 0 unruled pairs share a source |
| `node scripts/check-citation-agreement.mjs` | clean — **4** known disagreements (was 5) |
| `node scripts/check-citations.mjs` | clean |
| `find-duplicate-tiles.test.js` | 6 pass |
| `npm run lint`, `npm run build` | clean |
