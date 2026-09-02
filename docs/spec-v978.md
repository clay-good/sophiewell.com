# spec-v978 — Two tiles credited one paper with two different tables

## The finding

`ebv-mabl` and `max-allowable-blood-loss` are the same instrument built twice — spec-v972 ruled
them a duplicate and left them alone, because their **blood-volume factor tables disagree**:

| | `ebv-mabl` | `max-allowable-blood-loss` |
| --- | --- | --- |
| premature neonate | 100 mL/kg | — |
| term neonate | **90** | **85** |
| infant | 80 | 80 |
| child | **75** | **70** |
| adult male | 75 | 75 |
| adult female | 65 | 65 |

For a 3 kg term neonate that is an estimated blood volume of 270 mL on one tile and 255 mL on the
other, and a different allowable loss to match.

Both tiles credited the whole thing — formula *and* table — to **Gross JB, Anesthesiology
1983;58(3):277-280**. That paper is the dilution correction to the allowable-loss formula, and it
takes the estimated blood volume as an **input**; the per-kilogram bands are not in it. The
internal comment in `lib/nephro-fluids-v204.js` said so all along ("cross-verified across MDCalc,
the Iowa Head & Neck protocols, and OpenAnesthesia") — the string the reader saw did not.

**Two tiles attributing two different tables to one paper is proof on its own that at least one
attribution is wrong**, without needing to read the paper. Which is the same shape as the
spec-v963–v970 threshold program: does a tile state a number its source does not?

## What this changes, and what it does not

It does **not** change a number. No source that publishes the bands has been located — Gross 1983
is paywalled, and Linderkamp 1977 (Eur J Pediatr, PMID 891567), the primary study for paediatric
blood volume, gives regression equations and nomograms rather than a banded mL/kg table. Under
spec-v97 a disagreement is a reason to skip, not to pick a side.

So the divergence is **disclosed rather than resolved**:

- Gross is credited with the formula he published, and nothing else. The `Formula` interpretation
  band — which claims by `sourceQuoted` to be the source's own words — no longer carries the
  factor list.
- Both tools now say in their note that the per-kilogram factor is a **conventional reference
  value**, that references differ, and to check it against the reader's own institution's table.
- The two tiles are cross-linked, so a reader on one can see the other.

## Proof

`test/unit/blood-volume-attribution.test.js` pins both halves: the 3 kg neonate still returns 270
against 255 (the disagreement is real and deliberate), and **no sentence naming Gross may also
carry a `mL/kg` figure** — in either tool note, the citation, or the interpretation source line.
Negative-tested: putting the factor back into the sentence that names him fails.

## Left open

Retiring one of the pair still needs a source that publishes the bands. Anyone with library access
to Gross 1983 or to a paediatric anaesthesia reference that cites its own table can close this: pick
one table, cite it, and retire the other tile through `data/id-aliases.json` the way spec-v973 did.
