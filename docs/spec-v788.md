# spec-v788.md — InterTAK Diagnostic Score (takotsubo vs ACS)

> Status: **SHIPPED (2026-08-26).** Builds the `intertak` tile. Catalog **1579 → 1580**,
> group G.

## Why

The chest-pain cluster was deep — `heart`, `grace`, `timi`, `timi-stemi`, `marburg-heart-score`
— and every one of them asks *how bad is this coronary syndrome*. **Takotsubo syndrome was
absent from the catalog entirely**, including under "stress cardiomyopathy" and "apical
ballooning." It is the one presentation on that list that is not a coronary syndrome at all,
and it is the reason a patient may need an echo rather than a cath.

## What it does

Seven weighted features, summing to **exactly 100**:

| Feature | Points |
| --- | --- |
| Female sex | 25 |
| Emotional trigger | 24 |
| Physical trigger | 13 |
| No ST-segment depression, other than in aVR | 12 |
| Psychiatric disorder | 11 |
| Neurologic disorder | 9 |
| QT interval prolongation | 6 |

**Expert consensus interpretation:** ~18% probability of takotsubo at 50 points, ~90% above
70. A score of **70 or more is high probability**.

The consensus attaches a *pathway* rather than a conclusion to each side, and the tile reports
it: low-to-intermediate → coronary angiography with left ventriculography; high → consider
transthoracic echocardiography.

**Worked example:** female sex + emotional trigger + no ST depression = **61 of 100**, low to
intermediate. The 70 boundary is pinned by a test from both sides (68 stays low, 70 is high).

## Posture (spec-v97)

**A high score does not exclude a coronary occlusion**, and the score decides nothing about
angiography — the pathway shown is what the consensus suggests considering.

**On the threshold:** later validation cohorts have reported lower optimal cutoffs than 70,
one as low as 36. Rather than pick a winner, the tile ships the **expert-consensus threshold**
and states the disagreement in its own note.

## Files

- `lib/intertak-v788.js` — `interTak()`, `INTERTAK_NOTE`.
- `views/group-v788.js` (RV788) — seven weighted checkboxes; a11y-checked.
- `mcp/adapters/intertak-v788.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, weights, both bands and pathways, the threshold disagreement, related (heart, grace, timi).
- `test/unit/intertak.test.js` — 6 tests (0, the weights summing to exactly 100, the 61 worked example, the 70 boundary from both sides, each individual weight, the two pathways).
- `docs/spec-v788.md` (this file).

## Sourcing (spec-v97)

Ghadri JR, Cammann VL, Jurisic S, et al. *Eur J Heart Fail.* 2017;19(8):1036-1042
(PMID 27928880); thresholds per the International Expert Consensus Document on Takotsubo
Syndrome (Part II), *Eur Heart J.* 2018;39(22):2047-2062. All seven weights were confirmed
against an independent validation study and **sum to exactly 100**, which is itself a check
that none was transcribed wrong. The ≤70 / ≥70 split and the ~18% and ~90% probability
figures come from the consensus document and are quoted from it.

## Gate note

The first draft of this tile's `META.citation` ran 376 characters against the 300-character
limit that `test/unit/meta-citation-verify.test.js` enforces. `npm run lint` does not check
that, so it was the unit suite that caught it. The citation was trimmed by dropping the
repeated registry sub-title, not by dropping either source.
