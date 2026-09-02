# spec-v977 — A green test went red without a tile moving

## What happened

`test/integration/related-tools-shown.spec.js` failed in CI on the spec-v973 retirements, on
chromium and firefox, three retries each. The `abg` tile offered the same four related tools it
always had. They came back in a different **order**.

The test pinned the ids as an ordered list. The fill that produces them (`lib/related.js`) ranks
the catalog by tokens the tile shares with every other tile, weighted by how rare each token is
**across the whole catalog** — so removing four duplicate tiles reweighted every token in it, and
`cpis-vap` moved from third to first.

Nothing about the retirement was wrong. The assertion was.

## Why this keeps happening

This is the third time a derived ranking has been frozen into an assertion here. `mcp-not-exposed`
pinned a related-tools order for the same reason and had to be loosened to a set. The rule is
worth stating plainly:

> **A ranking derived from the whole catalog is not a constant. Assert the set, never the order.**

Any tile added, retired, or renamed reweights every IDF-style score in the catalog, and a test that
freezes one of those orders will go red for a change that did nothing to it.

## What replaces it

The two no-curated cases now assert what spec-v940 actually shipped, which is stronger than the
frozen list ever was:

- exactly four filled neighbours (the dead end it was written to prevent),
- none of them the tile itself, and no duplicates,
- and **the two surfaces agree** — the in-app list at `/#<id>` names the same neighbours as the
  pre-rendered `/tools/<id>/` page served from `dist` on :4174. That is the whole reason both
  surfaces call `lib/related.js`, and no ordering can drift it.

The curated case (`wells-pe`) still asserts its exact list in order. That list is hand-written, not
derived, so freezing it is the point: it pins that curation is rendered as curated, neither topped
up nor reordered.

**Negative-tested**: pointed at a different tile's page, both cases fail.

## Files

Changed: `test/integration/related-tools-shown.spec.js`. New: this file.
