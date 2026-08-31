# spec-v943 — Sixty-six links that said "Read the source" and did not reach one

## The finding

Three specs had spent effort making sure every citation carries a link. None had asked
whether the links that were already there still worked. A sweep of all 1,556 distinct source
links — DOIs through the handle API, PubMed through esummary, everything else through a GET —
found **66 that reach no source**, in three shapes.

**41 were a search, not a source.** `https://pubmed.ncbi.nlm.nih.gov/?term=Judet+Letournel+…`
under a link that says "Read the source". The reader lands on a result list that may hold the
paper, six unrelated ones, or none: `narakas-obpp`'s search returns a page of 2026 physical
therapy studies, and the 1987 book chapter it cites is not among them.

**12 were DOIs that 404.** They read like real records — right prefix, plausible suffix — which
is why nothing caught them. Two were near-misses rather than inventions: `olbi` dropped one
slash from a Hogrefe DOI (`10.1027//1015-5759…`), and `proportion-ci` had Wilson 1927 in the
right journal and volume under the wrong article number.

**13 were rotted web pages.** ACR moved Lung-RADS, the VA retired its Schwab-England page,
Wikipedia renamed the Spaulding article, and six CMS URLs 404 after a site reorganisation.

## What changed

**33 of the 41 searches now name a record.** Each was resolved through PubMed on the
citation's own journal, volume, year and first page, and every match was checked back against
the citation before it was written — `larsen-ra`'s volume and page alone return five papers in
five different fields, and only one is Larsen's.

**All 12 DOIs are fixed.** Ten now point at the PubMed record for the paper the citation
names (`lvh-criteria` → Casale 1985, `baux-score` → the 2012 review it cites, `schatzker-classification`
→ the 1979 Toronto series); `olbi` and `proportion-ci` got the corrected DOI.

**11 web links repointed**, each to a page that is actually the cited document where one
exists — `global-period` now opens the MLN Global Surgery Booklet itself rather than a dead
path to it, `sequestration-adjust` opens Public Law 112-25, `medicare-cost-share` opens the
cost-sharing amounts it quotes. `allowed-amount` lost its link: its citation names no document
and no year, so a CMS index page was never its source.

**Twelve tiles keep a search link, and now say so.** Six book chapters, four pre-1946 papers,
one meeting abstract, and one tile whose citation names no single paper. No index carries any
of them. Their pages read **"Search PubMed for this source"** instead of "Read the source", on
the tool page and in the live app — the link is the same, the promise is not.

## The gates

**Rule 7**, offline, in `scripts/check-citations.mjs`: a `citationUrl` (or any `citationUrls`
entry) whose query string carries a search term fails, unless the tile is one of the twelve in
the frozen `SEARCH_URL_GRANDFATHERED`. That set shrinks only, in both directions, exactly like
the spec-v938 backlog: a tile that gains a real link must leave it, and a retired tile must
leave it.

**`scripts/check-citation-links.mjs`**, on the network, run by hand:

```bash
node scripts/check-citation-links.mjs
```

It is deliberately **not** in `npm run lint` — a publisher outage would fail CI for a reason
that has nothing to do with the change under test. It checks each kind the way that kind can
be checked honestly: DOIs through the handle API, so no publisher can answer 403; every PMID
in one esummary call; everything else through a GET counting only 404, 410 and 5xx as broken,
because publishers routinely answer a script with 401 or 403.

`citation-link-recovery.test.js` pins the twelve fabricated DOIs by string, so a copy-paste
cannot reintroduce one under a different tile.

## Proof

| Check | Result |
| --- | --- |
| `node scripts/check-citation-links.mjs` | **clean — 1,556 distinct links across 1,605 tile references** (was 66 broken) |
| `node scripts/check-citations.mjs` | clean; rule 7 bites on a search URL outside the frozen set |
| `/#larsen-ra` in the live app | "Read the source" → the 1977 record |
| `/#bromage-scale` in the live app | "Search PubMed for this source" |
| `/#peds-weight-est` | "Read the source" → the APLS 6th-edition DOI |
| `check-citations.test.js` | 24 pass (6 new rule-7 cases) |
| `citation-link-recovery.test.js` | 8 pass |
| `npm run lint`, `npm run build` | clean |
