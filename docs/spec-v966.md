# spec-v966 — Eight more off the backlog, and the fourth citation that named no paper

## Why

spec-v965 took the unlinked-citation backlog from 40 to 34 with NCBI's citation matcher, and
found that three of its residents were unlinkable because the journal, volume and page they
named held no paper at all. This is the same pass run over the rest of the list.

## What shipped

Eight tiles leave the backlog, each linking every paper its citation names:

| Tile | Links added |
| --- | --- |
| `heatstroke-decision` | Bouchama 2002 (NEJM) + Lipman 2019 (WMS guideline) |
| `rabies-pep` | Rupprecht 2010 (ACIP 4-dose schedule) |
| `tetanus` | Havers 2020 (ACIP Tdap/Td) — **citation corrected** |
| `abg` | Narins 1980 (compensation rules) + ARDS Berlin Definition 2012 |
| `corrected-sodium` | Katz 1973 + Hillier 1999 |
| `corrected-ca-na` | Payne 1973 + Katz 1973 + Hillier 1999 |
| `aa-pf-suite` | ARDS Berlin Definition 2012 |
| `ecog-karnofsky` | Oken 1982 + Buccheri 1996 (the crosswalk) |

Every PMID was checked against its tile on journal, volume, pages, year, first author and title.

## The fourth wrong citation

`tetanus` cited **MMWR Recomm Rep. 2020;69(3):1-44**. That volume of *Recommendations and
Reports* carries six issues — meningococcal, influenza, tuberculosis, health-care personnel
exposure, hepatitis A, organ donors — and no Tdap guidance at any pagination. The ACIP Tdap/Td
recommendation the tile means is in the other MMWR series:

> Havers FP, Moro PL, et al. Use of Tetanus Toxoid, Reduced Diphtheria Toxoid, and Acellular
> Pertussis Vaccines: Updated Recommendations … **MMWR Morb Mortal Wkly Rep. 2020;69(3):77-83**

Right authors, right year, right issue number, wrong series and wrong pages — the same shape as
spec-v965's three. **MMWR publishes under several titles, and citing the wrong one lands the
reader in a volume that exists.** That is worse than a broken link, because nothing about it
looks broken.

## An agreement failure worth keeping

The first attempt linked the Berlin Definition from `abg`, whose citation read only "ARDS Berlin
definition for P/F bands." `check-citation-agreement` rejected it: a link has to open the paper
the **citation text** names, and that text named no year, volume or page to agree with. The fix
was to write the citation out in full rather than to weaken the check. A link the gate cannot
tie to a citation is a link the reader cannot either.

## Proof

| Check | Result |
| --- | --- |
| `data/citation-url-backlog.json` | **34 → 26** (49 at spec-v938) |
| citations corrected | 1 — `tetanus`, verified against the PubMed record |
| `check-citations.mjs` | clean — 26 unlinked |
| `check-citation-agreement.mjs` | clean — 1,506 links checked, 3 known disagreements |
| README source-link count | 1,609 → **1,617**, gated by `check-catalog-truth` |
| `npm run lint`, `npm run build` | clean |
