# spec-v608 — Zulewski clinical score (hypothyroidism)

**Status:** shipped. Catalog 1457 -> 1458. MCP wave 433, 1394 -> 1395 adapters.

## Why this tile

A **predecessor/successor gap**. The items were "originally chosen by Billewicz"; Zulewski and colleagues
re-derived which of them still discriminate in the era of thyroid function testing. Every slug spelling
(`zulewski`, `billewicz`, `hypothyroid-score`, `clinical-hypothyroidism`), every prose search, and every
filename search returned zero.

## What it does for the reader

Enter the age and answer twelve yes/no items — seven symptoms, five signs. The tile returns the score, the
band, **and the uncorrected score with its band beside it**, so the one thing most reproductions get wrong is
visible rather than assumed.

## The findings the tile is built around

| Finding | Consequence |
|---|---|
| **One point is added when the patient is under 55.** | A patient under 55 with **no clinical findings at all scores 1, not 0**. The age point is worth exactly as much as a delayed ankle reflex. The true maximum is **13, not 12**. |
| **The literature splits exactly.** Reproductions that print the twelve-item table say max 12 and omit the correction; sources that state the correction omit the table. | The two halves of this instrument are published separately. The tile carries both and labels which is which. |
| **The bands are set on the corrected score.** | The age point **alone** moves the band at *both* boundaries — 2 to 3 and 5 to 6. Dropping it reads every patient under 55 one point too low. That is a scoring error, not a rounding detail. |
| **The three skin items are three different observations.** | Dry skin is a patient-reported *symptom*; coarse skin is a *sign* felt on hands, forearms and elbows; cold skin is a *sign* read against the examiner's own hands. Skin is a quarter of the instrument; collapsing the three loses two points. |
| **It does not correlate with TSH.** | It correlates with free T4 and free T3 only. A high score is a reason to **measure** TSH, never a substitute for it. |

## Sourcing (spec-v97)

Re-fetched and double-confirmed, never recalled.

- **The twelve-item table** — confirmed by two independent reproductions that give the same seven symptoms
  and five signs, one point each, and the same operational definitions (coarse skin on hands/forearms/elbows;
  periorbital puffiness obscuring the curve of the malar bone; cold skin against the examiner's hands).
- **The age correction and the bands** — confirmed by two further independent sources, both quoting the same
  wording: a correction factor of +1 when age is under 55, and a diagnostic range of 2 or below euthyroid,
  3 to 5 intermediate, above 5 overt hypothyroid. In the source the range is stated in the sentence
  immediately following the correction, which is why the tile applies the bands to the **corrected** score.

**Withheld:** predictive values (NPV/PPV) reported by a single validation cohort. Single-sourced, so not
reported — the same treatment given to the `ffs-1996` mortality figures and the Amsterdam II accuracy
figures. A test asserts no percentage appears in the result text.

## Posture (spec-v11 §5.3)

Rates **clinical suspicion**. It does not diagnose hypothyroidism, does not grade it, and does not start,
stop or dose levothyroxine. Because the score does not track TSH, the tile says in every result that a high
score is a reason to measure TSH rather than a replacement for measuring it.

## Files

`lib/zulewski-v608.js`, `views/group-v608.js`, `mcp/adapters/zulewski-v608.js`,
`test/unit/zulewski.test.js`. Registered in `app.js` (tile + RV608), `mcp/catalog.js`,
`test/unit/fuzz-tools.test.js`, `test/mcp/mcp-search-relevance.test.js`, `data/synonyms.json`,
`lib/meta.js`, `docs/mcp-coverage.md`.
