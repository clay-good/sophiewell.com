# spec-v607 — Modified Sartorius score (hidradenitis suppurativa)

**Status:** shipped. Catalog 1456 -> 1457. MCP wave 432, 1393 -> 1394 adapters.

## Why this tile

A **cluster-completion gap**. `hurley-stage` (spec-v148) and `ihs4` (spec-v148) are both in the catalog;
the third member of the hidradenitis-severity trio was not. Every slug spelling (`sartorius`,
`modified-sartorius`, `sartorius-hs`), every prose search, and every filename search returned zero.

## What it does for the reader

Enter the nodule and draining-fistula counts **for one region**, the longest distance between lesions, and
whether the lesions are separated by normal skin. The tile returns that region's score, the per-item
breakdown, and — in plain language — the four things about this score that are easy to get wrong.

## The findings the tile is built around

| Finding | Consequence |
|---|---|
| **The unit is one anatomical region.** The patient's total is the SUM of the regional scores. | A regional score presented as the total is wrong. The source gives no aggregation rule beyond the sum, so this tile invents none. |
| **There is no maximum.** Lesions are counted individually and regions summed. | The score is unbounded and can reach the hundreds. No "x of y" reading; no normalizing. |
| **A draining fistula is worth exactly six nodules** (6 against 1). | Lesion TYPE dominates lesion COUNT: six nodules and one fistula score the same. Counting "lesions" without separating the two is wrong by a factor of six on the heaviest item. |
| **The distance term triples at each step** (1 / 3 / 9). | A single span over 10 cm is worth NINE nodules. It is not a linear measure of size. |
| **The separation item is the Hurley question in disguise.** | "Lesions not separated by normal skin" is the defining feature of Hurley stage III; one reproduction states the item directly as 9 points for a Hurley stage III area. `hurley-stage` is **not independent** of this score. |
| **Superseded for being time-consuming.** | The IHS4, also in this catalog, was produced by a Delphi process explicitly to give an easy-to-use formula. This score uses examination findings only, with no patient-reported component. |

## Sourcing (spec-v97)

Weights and terms were re-fetched and double-confirmed across two independent reproductions, never recalled.
The two agree on every weight: region 3, nodule 1, draining fistula 6, distance 1 / 3 / 9, final item 9.

**The two describe the final item differently and both assign it 9 points** — one as "not separated by normal
skin", the other as "a Hurley stage III area". These are the same criterion stated two ways, since
confluence without intervening normal skin is what defines Hurley stage III. The tile says so rather than
picking one wording.

**The severity bands are withheld.** One reproduction gives activity as high above 60 and moderate between
20 and 60. A comparative review of hidradenitis scoring systems states that **no severity bands are provided**
for this system. That is a single-sourced band table, so under the gate it is **reported, not applied**:
`band` is always `null`, and a test asserts this across the range. Same treatment as the `ffs-1996` mortality
figures and the Amsterdam II accuracy figures.

Source: Sartorius K, Emtestam L, Jemec GBE, Lapins J. Objective scoring of hidradenitis suppurativa
reflecting the role of tobacco smoking and obesity. Br J Dermatol. 2009;161(4):831-839.

## Posture (spec-v11 §5.3)

Measures disease **extent** at one point in time, mainly for trials and follow-up. It does not diagnose
hidradenitis suppurativa, does not select medical or surgical treatment, and does not measure pain,
drainage, odor or quality of life — which are what patients most often report as the burden. **A falling
score does not by itself mean the patient feels better**, and the tile says so in every result.

## Files

`lib/sartorius-hs-v607.js`, `views/group-v607.js`, `mcp/adapters/sartorius-hs-v607.js`,
`test/unit/sartorius-hs.test.js`. Registered in `app.js` (tile + RV607), `mcp/catalog.js`,
`test/unit/fuzz-tools.test.js`, `test/mcp/mcp-search-relevance.test.js`, `data/synonyms.json`,
`lib/meta.js`, `docs/mcp-coverage.md`.
