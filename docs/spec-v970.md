# spec-v970 — Every link now opens the paper its citation names

## Why

spec-v968 left one entry in `KNOWN_DISAGREEMENTS` and called it an owner's decision:
`savary-miller` linked a 1992 study of intestinal permeability in Crohn's disease, no index
carried its 1978 atlas, and both escape hatches were shrink-only lists. The decision was never
needed. The search was.

## Ask Crossref when PubMed has nothing

PubMed carries no record under "Savary-Miller" — not the classification, not the atlas, and
nothing by Ollyo or Monnier that defines the grades. Every previous attempt had been
PubMed-shaped, so every attempt had failed the same way.

Crossref, given the names already written in the tile's own citation, returned the paper on the
first page of results:

> **Monnier P, Ollyo JB, Fontolliet C, Savary M. "Epidemiology and Natural History of Reflux
> Esophagitis." *Surgical Innovation.* 1995;2(1):2-9.** — doi:10.1177/155335069500200102

All four authors, the subject, and the group that wrote the atlas. **Crossref indexes book
chapters, society journals and renamed titles that MEDLINE never took**; the same query also
surfaced two Savary/Ollyo/Monnier book chapters PubMed has never held.

What was verified: title, all four authors, journal, volume, pages and year, from the Crossref
record the DOI resolves to. What was not: the body. SAGE answers a script with 403, so this
spec does **not** claim the paper defines the five grades — it claims it is the paper the tile's
own citation names, which the previous link was not by any measure.

## The list is empty

| | |
| --- | --- |
| spec-v945 | 12 |
| spec-v946 | 5 |
| spec-v950 | 4 |
| spec-v961 | 3 |
| spec-v968 | 1 |
| **here** | **0** |

`KNOWN_DISAGREEMENTS` is now an empty set with a note saying to keep it that way: a new entry
means a tile is shipping a link to the wrong paper, which is the one thing the gate exists to
prevent.

## Proof

| Check | Result |
| --- | --- |
| `check-citation-agreement.mjs` | clean — **1,508 links checked, 0 known disagreements** |
| `citation-agreement.test.js` | 11 pass; the empty set and the new link are pinned |
| `npm run lint` | clean |

No computed answer changed.
