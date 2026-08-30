# spec-v938 — 220 tiles named a paper and gave you no way to reach it

## The finding

`check-citations.mjs` rule 2 bans a bare URL in citation prose: a link belongs in the
structured `META[id].citationUrl`, which both surfaces render as **"Read the source ↗"**.
Nothing ever required that field to exist. So it was possible — and common — for a tile to
print a full academic citation that a reader could only act on by retyping it into a search
engine.

| Citation shape | Tiles | Has a link |
| --- | --- | --- |
| Names a year (a real paper: `Teasdale G, Jennett B. … Lancet. 1974;2(7872):81-84.`) | 1,658 | 1,438 → **1,551** |
| No year (a formula or a rule: `MAP = ((2 × DBP) + SBP) / 3`) | 52 | not applicable — there is no document to link |

The 52 undated ones are correct as they stand. **220 dated ones were not.**

## What was done

**113 links, resolved rather than remembered.** Every tile's own citation text was sent to
the Crossref API, and a DOI was accepted only when *both* held:

1. the paper title Crossref returned appears **verbatim inside the tile's own citation**, and
2. the publication year Crossref returned is **one of the years the citation already names**.

Rule 2 alone matched 122 tiles; rule 1+2 matched 113. The nine the year rule removed are
exactly the ones that would have been wrong — `barthel` matched a 2018 Japanese review that
quotes "The Barthel Index" in its title, not Mahoney & Barthel 1965; `bishop` matched a 2019
Oxford textbook chapter, not the 1964 paper.

All 113 DOIs were then requested at `doi.org` and **all 113 resolve**.

No DOI was written from memory. A plausible-looking DOI is worse than an absent link: an
absent link is honest about not knowing.

**107 remain**, listed in `data/citation-url-backlog.json` — mostly older or society
documents Crossref could not match against the citation text with this confidence.

## The gate

Rule 6 in `scripts/check-citations.mjs`, gated both ways:

- a citation that names a year and has no `citationUrl` **fails**, unless the tile id is in
  the frozen backlog;
- a backlogged tile that has since **gained** a URL, or that is no longer a tile, also fails.

So the backlog can only shrink. A new tile cannot join it, and a fixed one cannot be left on
it. `test/unit/check-citations.test.js` covers all four directions plus a drift check that
the shipped JSON still matches `lib/meta.js` exactly.

## Proof

| Check | Result |
| --- | --- |
| `node scripts/check-citations.mjs` | clean — 1710 tiles, **107** dated citations still unlinked |
| DOI resolution, all 113 | 0 problems |
| `npm run test:unit` | 12,898 pass (1 known miniflare-env failure) |
| `npm run test:mcp` | 420 pass |
| `npm run build` | clean; pages carrying "Read the source" 1,438 → **1,551** |
