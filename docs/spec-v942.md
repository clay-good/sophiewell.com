# spec-v942 — One link cannot stand for two papers, so give it two

## The finding

spec-v938 named the rule and lived with the cost: a citation that names two or more papers
carried **no** source link at all, because `citationUrl` is one field and picking one paper
would misrepresent the citation. spec-v941 held the same line and left 18 tiles unlinked for
exactly this reason after their papers had already been found.

The rule is right. The data shape was wrong.

`nexus-cspine` cites Hoffman's NEXUS criteria *and* Stiell's Canadian C-Spine Rule; a reader
comparing the two decision rules is the whole point of that tile, and neither was reachable.
`wells-pe-geneva` cites Wells and revised Geneva. `phq2-gad2` cites the PHQ-2 paper and the
GAD-2 paper. Eleven tiles are in this shape with **both** papers resolvable.

## What changed

An optional `citationUrls` on a META entry: a labelled list, two entries or more, used
**instead of** `citationUrl`.

```js
citationUrls: [
  { label: 'Hoffman 2000', url: 'https://doi.org/10.1056/nejm200007133430203' },
  { label: 'Stiell 2001',  url: 'https://doi.org/10.1001/jama.286.15.1841' },
],
```

The label is not decoration. Two bare "Read the source" links side by side tell the reader
nothing about which paper each opens, which is the same failure in a new costume. Author and
year is the shortest thing that maps a link back to a clause of the citation above it.

Rendered the same way on all three surfaces — `Read the sources: Hoffman 2000 ↗, Stiell 2001 ↗`
on the tool page and in the live app; in MCP, `describe_calculator` gains `citationUrls` while
`citationUrl` keeps naming the first paper, so nothing that reads only the old field loses a
link.

**Eleven tiles, 22 papers.** All 22 DOIs were matched on journal + volume + first page + year
and resolved through the DOI handle system. Backlog **74 → 63**.

| Tile | Now links |
| --- | --- |
| `nexus-cspine` | Hoffman 2000, Stiell 2001 |
| `wells-pe-geneva` | Wells 2000, Le Gal 2006 |
| `wells-dvt-caprini` | Wells 1997, Caprini 2005 |
| `alvarado-pas` | Alvarado 1986, Samuel 2002 |
| `iss-rts` | Baker 1974, Champion 1989 |
| `lams` | Llanes 2004, Nazliel 2008 |
| `phq2-gad2` | Kroenke 2003, Kroenke 2007 |
| `dast10` | Skinner 1982, Yudko 2007 |
| `fast` | Kleindorfer 2007, Aroor 2017 |
| `hypothermia-rewarm` | Durrer 2003, ERC 2021 |
| `vent-sbt-peep` | Boles 2007, ARDS Network 2000 |

## The gate

Rule 3b in `scripts/check-citations.mjs` refuses a `citationUrls` that is shorter than two
entries (one link belongs in `citationUrl`), that has an entry without a label or without a
valid `https://` URL, or that sits beside a `citationUrl` — because then neither field is the
source of truth. Rule 6 counts either field as "reachable", in both directions, so a tile that
gains a list must leave the frozen backlog.

`citation-link-recovery.test.js` pins all 11 tiles' labels and URLs and asserts no two labels
share a link. Six new cases in `check-citations.test.js` prove each half of rule 3b bites.

## Still not linked

**63.** Eight tiles have one of their two papers findable and the other not; the rest name no
title (only author + journal + year with no volume), or cite a book or a manual with no DOI,
or predate indexing. A list with a hole in it would be a worse answer than the honest silence
the backlog records, so those stay.

## Proof

| Check | Result |
| --- | --- |
| `node scripts/check-citations.mjs` | clean — **63** dated citations still unlinked (was 74) |
| DOI resolution, all 22 | responseCode 1, 0 failures |
| `/#nexus-cspine` in the live app | both links, labelled, correct hrefs |
| `dist/tools/` pages carrying "Read the sources" | 11 |
| `/#gad7` (single-source) | unchanged, one "Read the source" link |
| `describe_calculator('nexus-cspine')` | `citationUrls` both; `citationUrl` = Hoffman |
| `mobile-no-hscroll.spec.js` full sweep | 48 pass, 6 skipped |
| `npm run lint`, `npm run build` | clean |
