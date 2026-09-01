# spec-v967 — The five whose source is a document, not a paper

## Why

spec-v965 and spec-v966 took the unlinked-citation backlog from 40 to 26 using PubMed. What was
left is mostly not in PubMed: textbooks, standards, and guidance documents that a professional
body publishes itself. Five of those have a permanent, publisher-hosted home, and each was
checked by opening it and reading the title off the page — not by trusting a 200.

| Tile | Link added | Verified by |
| --- | --- | --- |
| `audit-full` | Saunders 1993 (PubMed) + the WHO AUDIT manual | WHO IRIS page title reads "AUDIT: the alcohol use disorders identification test" |
| `news2` | RCP NEWS2 resource page | page title reads "National Early Warning Score (NEWS) 2 \| RCP" |
| `ews-escalation` | the same RCP page | same |
| `must-nutrition` | the BAPEN "MUST" Explanatory Booklet (PDF) | first page of the PDF reads "'Malnutrition Universal Screening Tool' … BAPEN" |
| `device-day-counter` | Lo 2014 (SHEA CAUTI prevention update) | PubMed record matches on journal, volume, pages, year, author |

## What was left alone, and why

The CDC NHSN Patient Safety Component Manual and the ACS field-triage guideline both answer a
script with 403 or 404 while serving a browser normally. The repository's link checker tolerates
403 for exactly that reason — but **tolerating a status is not the same as having read the
document**, and this session could not read either one. `field-triage` keeps its place on the
backlog rather than gaining a link nobody verified. `device-day-counter` links the one source it
could confirm.

`vip-extravasation` stays too: the Infusion Nurses Society 2021 Standards of Practice is not in
PubMed under any title search, and the tile's other source, Jackson 1998, cannot stand for both.

## Proof

| Check | Result |
| --- | --- |
| `data/citation-url-backlog.json` | **26 → 21** (49 at spec-v938) |
| every added link | opened, and its title read against the citation |
| `check-citations.mjs` | clean — 21 unlinked |
| `check-citation-agreement.mjs` | clean — 1,508 links checked, 3 known disagreements |
| README source-link count | 1,617 → **1,622**, gated by `check-catalog-truth` |
| `npm run lint` | clean |

The 21 that remain are textbooks (Marino's *ICU Book*, Egan's *Fundamentals*, Hillman & Finch,
Winter & Tozer), standards sold as books (AABB, INS), pre-1946 papers no index carries (Du Bois
1916, Lund & Browder 1944, Bazett and Fridericia 1920), and two documents this session could not
open. That is a different problem from a missing lookup.
