# spec-v965 — Three of the unlinked citations were unlinkable because they were wrong

## Why

`data/citation-url-backlog.json` is the frozen set of tiles whose citation names a dated paper
and gives the reader no way to reach it. It stood at **40**. spec-v954 shrank it from 49 and
recorded what was left: books with no DOI, and *"three where the citation's own numbers name
something the record does not … Those need the source in hand, not another lookup."*

They did not need the source in hand. They needed the right query.

## The query that finds a paper from a citation

Free-text PubMed search fails on citation strings — every one of 17 queries built from
"author journal year volume page title-words" returned **NO HITS**, because the terms `AND`
together and one wrong word empties the result. NCBI's **citation matcher** takes the citation
apart instead:

```
ecitmatch.cgi?db=pubmed&retmode=xml&bdata=Journal|year|volume|first_page|Author|key|
```

Fed the 17 citations as structured fields, it returned **12 PMIDs**, each of which matched its
tile on journal, volume, pages, year, first author *and* title. The five it could not match were
the interesting ones.

## What did not match, and why

| Tile | The citation said | The record says |
| --- | --- | --- |
| `saag` | Runyon BA. *Hepatology* 1992;16:240-245 | Runyon BA, Montano AA, Akriviadis EA, et al. *Ann Intern Med* 1992;117(3):215-220 |
| `ttkg` | Halperin ML, Kamel KS. *Kidney Int* 1998;53(5):1313-1327 | Halperin ML, Kamel KS. Potassium. *Lancet* 1998;352(9122):135-140 |
| `electrolyte-replacement` | Hammond DA, et al. *JAMA Netw Open* 2019;2(8):e198587 | Hammond DA, King J, et al. *Crit Care Nurse* 2019;39(1):e13-e18 |

In all three cases the *named journal, volume and page* holds no paper at all — searching
`Hepatology 1992 vol 16 page 240`, `Kidney Int 1998 vol 53 page 1313` and
`JAMA Netw Open 2019 vol 2 page e198587` each returns zero records. The authors and years were
right, so the tiles were never citing the wrong work; they were citing it by numbers that lead
nowhere, which is why no lookup had ever resolved them.

**`saag` had the right answer in the building already.** Its `interpretation.sourceCitation`
read "Runyon BA, et al. Ann Intern Med. 1992;117(3):215-220 (SAAG)" while its `citation` read
Hepatology — the two fields disagreed, and only the wrong one was reader-facing on the link.
That is spec-v962's finding again: **a citation lives in more than one file.** The Hepatology
numbers were also in `lib/clinical-v5.js`, `data/tool-copy/saag.json`, and
`docs/clinical-citations.md`, where they were dressed up as a "continuation series" that PubMed
has no record of. All four are corrected.

`ttkg` gained its derivation as a second link: Ethier JH, Kamel KS, Magner PO, et al.,
*Am J Kidney Dis* 1990;15(4):309-315, the study that defined the expected TTKG values.

## What shipped

Six tiles leave the backlog, each linking every paper its citation names:

| Tile | Links |
| --- | --- |
| `saag` | Runyon 1992 (corrected) |
| `ttkg` | Halperin 1998 (corrected) + Ethier 1990 (the derivation) |
| `electrolyte-replacement` | Hammond 2019 (corrected) + Brown 2006 |
| `ranson-bisap` | Ranson 1974 + Wu 2008 |
| `fena-feurea` | Espinel 1976 + Carvounis 2002 |
| `sepsis-bundle-clock` | Evans 2021 + Nguyen 2004 |

Only the citations changed. **No threshold, formula or computed answer moved.**

## Proof

| Check | Result |
| --- | --- |
| `data/citation-url-backlog.json` | **40 → 34** |
| citations corrected | 3, each verified against the PubMed record for journal, volume, pages, year, author and title |
| `check-citations.mjs` | clean — 34 unlinked |
| `check-citation-agreement.mjs` | clean — 1,492 links checked, 3 known disagreements |
| README source-link count | 1,603 → **1,609**, gated by `check-catalog-truth` |
| `npm run lint`, `npm run build` | clean |
