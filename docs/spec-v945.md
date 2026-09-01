# spec-v945 — 49 links resolved perfectly and opened the wrong paper

## The finding

spec-v943 asked whether every source link resolves, fixed the 66 that did not, and left a
script that answers that question on demand. It is the wrong question on its own.

`pipkin-femoral-head` cites Pipkin's 1957 hip fracture-dislocation paper. Its link resolved,
in the right journal, in the right year, and opened **"Integrated actions and functions of the
chief flexors of the elbow: a detailed electromyographic analysis."** `russe-scaphoid` opened
a Hungarian case report on congenital hemangiomatosis. `hamada` was off by a single digit of
PMID and opened the article next to its own in the same 1990 issue.

Pulling every linked record's metadata and comparing it with the citation it sits under found
**61 links that disagree with their citation on two or more of {year, first page, first
author}** — the signature of a wrong record. One disagreement is normal (online-first years,
corporate authors); two is not.

## What changed

**49 tiles now link their own paper.** Each was re-matched on the citation's own journal,
volume, first page and year, with the journal name and either the author or the title required
to agree, and every match read against its citation by hand. Six of them cite two papers and
now carry a labelled `citationUrls` pair (`delta-check`, `reference-change-value`,
`weiss-adrenal`, `acr-eular-boolean`, `albi-plt`, `meyers-mckeever`).

A sample of what readers were getting:

| Tile | Its link opened | It opens now |
| --- | --- | --- |
| `pipkin-femoral-head` | an elbow EMG study | Pipkin 1957 |
| `russe-scaphoid` | congenital hemangiomatosis, in Hungarian | Russe 1960 |
| `berndt-harty` | Dupuytren's contracture | Berndt & Harty 1959 |
| `levine-edwards` | Achilles tendon rupture after steroid injection | Levine & Edwards 1985 |
| `edinburgh-claudication` | a drug-therapy appropriateness method | Leng & Fowkes 1992 |
| `qcsi` | a COVID limb-ischemia case report | Haimovich 2020 |

`nyhus-hernia`'s own numbers were wrong, not just its link: Nyhus's "Individualization of
hernia repair" is Surgery **1993;114**(1):1-2, not 1991;110. Citation and link both corrected.

## The gate

`scripts/check-citation-agreement.mjs`, on the network, run by hand alongside the liveness
checker:

```bash
node scripts/check-citation-agreement.mjs
```

It pulls each record from Crossref or PubMed and reports any link disagreeing with its citation
on two of the three fields. Twelve tiles are frozen in `KNOWN_DISAGREEMENTS`, shrink-only in
both directions — for those the *citation* is what needs editing, not the link (`femg` cites
Miner Electrolyte Metab 1998 for a paper that is Magnes Res 1997; `rhig-dose` describes AABB
dosing guidance for a paper about RHD genotyping), and that is source review, not a link swap.

`test/unit/citation-agreement.test.js` pins the rule offline — including that one disagreement
must not fire — and pins four of the corrected links.

## Proof

| Check | Result |
| --- | --- |
| `node scripts/check-citation-agreement.mjs` | **clean — 1,467 links checked** (was 61 disagreeing) |
| All 55 replacement records vs their citation's year and first page | 54 agree; the 55th is `nyhus-hernia`, whose citation was corrected |
| `node scripts/check-citation-links.mjs` | clean |
| `node scripts/check-citations.mjs` | clean |
| `citation-agreement.test.js` | 6 pass |
| `npm run lint`, `npm run build` | clean |
