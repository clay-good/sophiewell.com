# spec-v941 — Thirty-one more papers a reader can now open, and four links that went to the wrong one

## The finding

spec-v938 linked every citation it could match on **title**, and froze the 105 it could not
into `data/citation-url-backlog.json`. It named the largest remaining shape and called it
unfixable: "names no title, only author + journal + year" — `auditc`, `gad7`, `phq9`, `grace`,
`heart`, `psi`, `apache2`. Some of the most-used scores in the catalog were in that group.

They are not unfixable. A citation that gives **journal, year, volume and first page** is a
stronger key than a title is — Crossref's bibliographic query finds the record, and volume
plus first page confirms it. Of the 81 backlogged citations carrying volume and page, 47
matched; 29 of those name a single paper and were taken.

Checking the matches by hand turned up a second, worse problem. Four tiles' numbers named a
different paper than their words did.

| Tile | Its citation said | The volume and pages belong to |
| --- | --- | --- |
| `sodium-correction` | Adrogué & Madias, **Hyponatremia**, NEJM 2000;342:1493-1499 | **Hypernatremia** — the sibling paper in the same volume (`free-water-deficit` cites it correctly) |
| `cincinnati` | Kothari, "CPSS: reproducibility and validity", Acad Emerg Med **1997;4(9):986-990** | "Early stroke recognition: developing an out-of-hospital NIH Stroke Scale" — a different Kothari paper |
| `delta-gap` | Wrenn 1990 first, Rastegar 2007 as corroboration | "Read the source" went to **Rastegar** |
| `aldrete` | Aldrete 1995 "revisited" first, 1970 original in parentheses | "Read the source" went to the **1970** paper |

The last two are the quieter version of the same defect: the link resolves, so no gate
complains, but it lands the reader on a paper the citation did not lead with.

## What changed

- **29 tiles gained a `citationUrl`.** Every one was matched on journal + volume + first page,
  with the year or the journal name as a second check, then resolved through the DOI handle
  system. Backlog **105 → 74**; pages carrying "Read the source" **1,553 → 1,584**.
- **`sodium-correction`** now cites `342:1581-1589` and links the Hyponatremia paper.
  `docs/clinical-citations.md` §T1 had the two page ranges swapped between the two titles;
  fixed there too.
- **`cincinnati`** now cites Ann Emerg Med 1999;33(4):373-378 and links it — the same DOI the
  `cpss` tile already used for the same instrument.
- **`delta-gap`** and **`aldrete`** now link the paper their citation leads with.

The spec-v938 honesty rule was kept, not loosened: of the 47 matches, **18 were left on the
backlog** because the citation names two or more works and one link cannot stand for both
(`abg`, `audit-full`, `corrected-sodium`, `device-day-counter`, `mtp-tracker`, `pbw-ardsnet`,
`alvarado-pas`, `centor`, `nexus-cspine`, `wells-dvt-caprini` and eight more).

## The gate

`test/unit/citation-link-recovery.test.js` pins all 33 tile → URL pairs and asserts none of
them is still on the frozen backlog. Rule 6 of `scripts/check-citations.mjs` already forbids
the reverse — a linked tile may not stay on the list — so the two gates close on each other.
Negative-tested: deleting `gad7`'s URL fails the new test *and* the existing gate.

Nothing offline can prove a DOI points at the right paper; the pinning is what stops a future
edit from swapping one silently, which is exactly what the four wrong links looked like.

## Left open

`cincinnati` and `cpss` are the same instrument on two tiles, and the bibliographic sweep
surfaced several more near-identical pairs (`kings-score`/`king-score`, `four-ts-hit`/`four-ts`,
`ips-hodgkin`/`hodgkin-ips`, `abc-transfusion-score`/`abc-mtp`). That is the duplicate-tile
vein, not this one, and retiring a tile has redirect and count consequences. Recorded, not
touched.

## Proof

| Check | Result |
| --- | --- |
| `node scripts/check-citations.mjs` | clean — 1710 tiles, **74** dated citations still unlinked (was 105) |
| DOI resolution, all 33 | responseCode 1, 0 failures |
| Pages carrying "Read the source" | 1,553 → **1,584** |
| `citation-link-recovery.test.js` | 4 pass; 1 fails on a removed URL |
| `npm run test:unit` | 12,903 pass |
| `npm run test:mcp` | 421 pass |
| `npm run lint`, `npm run build` | clean |
