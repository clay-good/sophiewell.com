# spec-v944 — PubMed has the papers Crossref never indexed, and matching on numbers alone gets the wrong one

## The finding

spec-v941 recovered 29 citations through Crossref and named the rest unfixable: "pre-DOI or
unindexed — Crossref has no record that matches." It was the wrong index. Crossref starts
where publishers started depositing DOIs; **PubMed goes back to 1946**, and it carries almost
every foundational instrument in this catalog.

`bishop` — the Bishop score, Obstet Gynecol 1964;24:266-268 — was the worked example spec-v941
gave for "no record exists." PubMed has it: PMID 14199536. So does it have Downes 1970,
Mahoney and Barthel 1965, Centor 1981, Ganzoni 1970 and Mentzer 1973.

## The trap, which is the more useful half of this spec

The obvious query is volume, first page and year: `24[vi] AND 266[pg] AND 1964[dp]`. Run that
across the backlog and 37 of 63 citations come back "resolved". Read the results and roughly
**half are the wrong paper**:

| Tile | Matched on volume + page + year | What that record actually is |
| --- | --- | --- |
| `kdigo-aki` | 2013;2:1 | tick infestation in African buffalo |
| `saag` | 1992;16:240 | derivative spectroscopy in toxicology |
| `flacc` | 1997;23:293 | cell kinetics in oesophageal cancer |
| `bsa_burn` | 1944;79:352 | a case report titled "Thymoma" |

Journals share volume numbers and page numbers freely; three numbers are not an identifier.
Worse, they are not an identifier *within* a journal either: Lancet 1973;1:882 holds two
items, and `mentzer` matched its page-neighbour, "Acanthocytes and hypobetalipoproteinaemia",
rather than Mentzer's own "Differentiation of iron deficiency from thalassaemia trait".

The matcher this spec uses adds two checks, and every accepted match was then read against its
citation by hand:

1. **the journal** — every token of the record's `source` must appear in the citation clause
   (`Md State Med J` → all four tokens);
2. **the author or the title** — the first author's surname appears in the clause, or at least
   two distinctive title words do.

That takes 37 down to 23, and hand-review takes 23 to **14**. The nine dropped are eight
citations naming a second work with no findable record — the spec-v938 rule, unchanged: a list
with a hole in it is a worse answer than an honest silence — and two where the title check
still passed on generic words (`rabies-pep` matched a pneumococcal-vaccine MMWR, `tetanus` a
meningococcal one).

## What changed

**Twelve tiles** gained a `citationUrl`, **two** gained a two-entry `citationUrls`
(`barthel` → Mahoney 1965 and Shah 1989; `centor` → Centor 1981 and McIsaac 1998). Backlog
**63 → 49**.

Among them are `perc`, `pecarn-head`, `pf-ratio`, `prevent` and `flacc` — instruments used
daily, whose source was one click away and unreachable.

## Left open

**49.** Eight name a second work that no index carries (`aa-pf-suite`, `audit-full`,
`corrected-sodium`, `device-day-counter`, `ecog-karnofsky`, `mtp-tracker`,
`sepsis-bundle-clock` and one more) and would need a partial list; the rest are books,
manuals, and papers with no structured reference to search on at all.

## Proof

| Check | Result |
| --- | --- |
| `node scripts/check-citations.mjs` | clean — **49** dated citations still unlinked (was 63) |
| All 16 PMIDs vs their citation's year and first page | 16/16 agree |
| `node scripts/check-citation-links.mjs` | clean |
| `citation-link-recovery.test.js` | 11 pass |
| `npm run lint`, `npm run build` | clean |
