# spec-v964 — The 638 tiles the last threshold audit never looked at

## Why

spec-v963 audited every threshold it could read and found one defect. Its funnel started at
**tiles linking a PubMed record** — 389 of 1,708. That starting point quietly excluded the
larger group: a tile that cites its source by **DOI**.

Counting again from the whole catalog:

| | |
| --- | --- |
| Tiles | **1,708** |
| …stating a numeric cutoff in their bands | **881** |
| …of those, linking a PubMed record (v963's funnel) | 172 |
| …of those, citing a DOI instead — never audited | **638** |
| …whose paper has open-access full text | **51** |
| Tiles compared against their source this round | **52** |

Three times as many readable papers as v963 reached, from the same catalog.

## Two measurement traps, both the same shape as v963's

v963 recorded that `elink` given a batch of ids merges them into one empty linkset, so
everything reads as closed. The same family of error bit twice more here:

1. **A Europe PMC `OR` query without parentheses binds a trailing `AND` to the last clause
   only.** `EXT_ID:a OR EXT_ID:b AND SRC:MED` resolved **9 of 171** pmids. Wrapping the `OR`
   list in parentheses resolved **all 171**. The first number was not an answer, it was a
   syntax error wearing one.
2. **`inEPMC: Y` is not "readable."** 29 records said `Y`; 19 of them returned 404 from the
   full-text endpoint. `isOpenAccess: Y` is the gate that predicts a body you can actually
   read.

## What it found

Every tile's stated cutoff was placed beside every cutoff sentence in its paper. Thirteen
disagreed on first pass; nine were the comparison being too narrow (the number was in a table
or a figure caption). Three survived.

### `cdai-ra` — bands credited to a paper that says it does not have them

The tile states remission ≤ 2.8, low ≤ 10, moderate ≤ 22, high > 22, and cites Aletaha 2005,
the paper that introduced the index. That paper's discussion ends:

> "In addition, **cutoffs for disease activity categories, including remission**, as well as
> changes that reflect important responses **must be determined. Such analyses are currently
> underway.**"
> — Aletaha 2005, *Arthritis Res Ther* 7:R796-R806 (PMC1175030)

The numbers are right and in routine use — remission at ≤ 2.8 is the ACR/EULAR criterion
(Studenic 2023, PMC9811102: "remission is fulfilled at a score of ≤2.8"), and the full set
appears verbatim in later work. They are simply not from the cited paper. The tile now carries
both links and names which paper gave the index and which gave the cut-offs, the way `das28`
already separates the Prevoo formula from the EULAR bands.

### `plr` — a cut-off that appears in no source, inside the healthy range

The tile split at 180: at or below it, "within the commonly cited range"; above it,
"elevated." **The cited review does not contain the number 180.** What it does contain is the
opposite advice:

> "Are there validated cut-offs one could rely on …? **Cut-offs derived from a single study are
> not generalizable.**"
> — Gasparyan 2019, *Ann Lab Med* 39:345-357 (PMC6400713)

and study-specific PLR cut-offs that scatter — 124.63 in Behçet disease, 183.39 in Takayasu
arteritis, 272 in ANCA-associated vasculitis.

The largest healthy-population measurement, reached through that review's own reference list,
puts the interval elsewhere:

> "the mean reference value for PLR … **132.40 (46.794–218.006)**"
> — Lee 2018, *Medicine* 97:e11138 (PMC6039688), 12,160 adults, mean ± 1.96 SD

**180 sits inside the healthy interval.** Every ratio from 180 to 218 was reported as elevated
when the reference data say it is normal — including the tile's own worked example, a PLR of
200. The tile now reports against 46.8–218.0, says in as many words that this is a reference
interval and not a diagnostic threshold, and gives the three disease-specific cut-offs rather
than inventing a fourth. This is the treatment its sibling `sii` already had.

### `4peps` — a threshold with no unit

The low tier read "D-dimer < 1000". The paper says "less than 1.0 μg/mL". 1000 of what was left
to the reader; it now says `< 1000 ng/mL, i.e. 1.0 μg/mL`.

## Proof

| Check | Result |
| --- | --- |
| tiles compared against an open-access source | **52** |
| tiles whose stated cutoff appears nowhere in their source | 2 — `cdai-ra`, `plr` |
| `plr` computation | **changed**: `abnormal` is now outside 46.8–218.0, not above 180 |
| `cdai-ra` computation | unchanged; the attribution and the second link are new |
| `hematology-v229.test.js` | 15 pass, 4 new, including the 200-is-not-elevated case |
| `npm run lint`, `npm run build` | clean |
