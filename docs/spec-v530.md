# spec-v530.md — Vesikari clinical severity score (gastroenteritis episode) tile

> Status: **SHIPPED (2026-07-27).** Builds the `vesikari` tile — the seven-item episode-severity score for
> acute gastroenteritis, total 0-20. Catalog **1379 → 1380**, group G.

## Why

`vesikari`, `ruuska`, and `rotavirus` were all zero-hit across `corpus.json`, `app.js`, and `lib/meta.js`.

**A different axis from the existing `gorelick` and `clinical-dehydration-scale` tiles.** Those grade
**dehydration on examination at one moment** — how dry is this child right now. Vesikari grades **the
severity of the whole episode**, counted over its entire course. It was built as a **vaccine-trial
endpoint**, which is why it asks for durations and daily maxima rather than a bedside impression, and why
dehydration is only one of its seven items. A child can be profoundly dehydrated today from a short,
mild-scoring episode, and can score severely on Vesikari while looking well at the visit.

## What it does

Seven items, total **0-20**. Five score 0-3; **dehydration scores 0/2/3** and **treatment scores 0-2**.

| Item | 0 | 1 | 2 | 3 |
| --- | --- | --- | --- | --- |
| Duration of diarrhea | none | 1-4 d | 5 d | ≥6 d |
| Max stools / 24 h | none | 1-3 | 4-5 | ≥6 |
| Duration of vomiting | none | 1 d | 2 d | ≥3 d |
| Max vomits / 24 h | none | 1 | 2-4 | ≥5 |
| Max temperature (rectal-equivalent) | <37.1 °C | 37.1-38.4 | 38.5-38.9 | ≥39.0 |
| Dehydration (% body weight) | none | **—** | 1-5% | ≥6% |
| Treatment | none | rehydration | hospitalization | **—** |

Bands: **<7 mild**, **7-10 moderate**, **≥11 severe**.

### Two shapes that are easy to get wrong, both pinned by tests

1. **Dehydration has no 1-point row.** It scores 0, 2, or 3 — never 1. Most sources agree; a minority
   reproduction inserts a "little to mild" 1-point option, which would shift mid-range totals. The majority
   reading is shipped, the gap is stated rather than quietly closed, and passing `1` is a validation error.
2. **Rehydration and hospitalization are one item, not two.** Treatment is a single 0-2 item. Scoring them
   separately would push the maximum to **23** and inflate every hospitalized child by a point. A test
   asserts the ceiling is exactly 20 and explicitly not 23.

**Temperature is rectal-equivalent, and this is the most common scoring error.** The scoring manual converts
other routes first — about +1 °F for oral or tympanic, +2 °F for axillary — before banding. An axillary
38.5 °C is **not** a 2-point fever. The tile takes the rectal-equivalent reading and says so in the label.

**This is not the 24-point score.** A separate norovirus-specific instrument (Chen 2016) is also called a
"modified Vesikari" score, adds four items, compresses four others, totals 24, and uses different bands. A
third instrument, the Schnadower/Freedman "Modified Vesikari Score", also totals 20 but swaps dehydration for
a future-healthcare visit and uses different band edges. This tile is the **original Ruuska-Vesikari
20-point** score and names both alternatives so a reader holding one of them notices.

- `lib/vesikari-v530.js` — pure items → total and severity band. Exports `VESIKARI_ITEMS`, each carrying its
  own option list (which is what makes the two odd rows real rather than decorative).
- `views/group-v530.js` (RV530) — seven selects (dom `ves-*`) under two **h2** headings separating what
  happened over the episode from what was found and done.
- `lib/meta.js` — Ruuska and Vesikari 1990 citation + accessed date + bands, related to
  `clinical-dehydration-scale`. No citation-staleness row (a named-author article, no guideline-issuer
  acronym).
- 11 worked-example unit tests + fuzz registration; synonym entry; corpus → 1380.

**HIGH-STAKES:** it grades an episode's severity **in retrospect**. It is **not a triage tool**, **not a
measure of current dehydration** — the Gorelick and clinical dehydration scales answer that — and **not an
indication** to give oral or intravenous fluids, to admit, or to prescribe anything
([spec-v11](spec-v11.md) §5.3). It does not identify the pathogen, and it says nothing about the causes of
vomiting and diarrhea that are **not** gastroenteritis, which is the assessment that has to happen first.

## Duplicate check

Per the procedure in [spec-v508](spec-v508.md): the eponym (`vesikari`), the first author (`ruuska`), the
pathogen (`rotavirus`), and the neighboring instruments (`gorelick`, `clark`) — each against **both**
`corpus.json` and `app.js` (and `lib/meta.js`), plus a `test/unit/` scan
(`clinical-dehydration-scale.test.js` exists and grades the other axis). The two non-zero hits are those
neighbors, addressed above.

## Sourcing (spec-v97)

- **Citation:** Ruuska T, Vesikari T. Rotavirus disease in Finnish children: use of numerical scores for
  clinical severity of diarrhoeal episodes. *Scand J Infect Dis.* 1990;22(3):259-267.
- Transcribed from a published scoring manual for the Vesikari system plus multiple validation studies
  reproducing the same seven items, the same 0-20 range, the same absent 1-point dehydration row, and the
  same bands. The one dissenting rendering (a 1-point dehydration option) was outvoted four sources to one
  and is noted above rather than silently discarded.

## Verification

Lint (all catalog-truth surfaces at 1380), unit suite (+11 + fuzz), a11y, build, and the chromium
heading-level check — all green.

## Out of scope

The tile does not compute the 24-point norovirus modification or the Schnadower modified score (each is a
distinct instrument, not a mode of this one), convert temperatures between routes, grade current dehydration,
or identify the pathogen. The MCP adapter + golden-probe promotion follow in the next wave (355).
