# spec-v782.md — FABQ (Fear-Avoidance Beliefs Questionnaire)

> Status: **SHIPPED (2026-08-26).** Builds the `fabq` tile. Catalog **1573 → 1574**, group G.

## Why

spec-v781 shipped STarT Back, which *stratifies* low back pain by psychosocial risk. FABQ is
the instrument that says *what the belief actually is* — and its work subscale is the one that
predicts return to work. Together they make the psychosocial axis usable instead of just
visible.

## What it does

Sixteen statements, each rated 0 (completely disagree) to 6 (completely agree). **Only eleven
are scored.**

| Subscale | Items | Range |
| --- | --- | --- |
| Physical activity (FABQ-PA) | 2, 3, 4, 5 | 0–24 |
| Work (FABQ-W) | 6, 7, 9, 10, 11, 12, 15 | 0–42 |
| *Not scored* | 1, 8, 13, 14, 16 | — |

The five unscored items are still **asked** — they are part of the administered form — so the
tile shows all sixteen and labels the unscored ones on their own label rather than hiding
them. A test pins that setting all five to 6 moves neither subscale.

**The two subscales are never added together.** Several published calculators quote a combined
FABQ range of 0–96, which is arithmetically impossible when the parts are 24 and 42; this tile
returns two numbers and no total.

**Worked example:** all four activity items at 4 and all seven work items at 5 → physical
activity **16 of 24**, work **35 of 42**.

## Posture (spec-v97)

Measures **beliefs**, not physical capacity or tissue damage. **No cutoff is asserted** — the
1993 source publishes none, the same ruling as spec-v775, v776 and v780.

## Files

- `lib/fabq-v782.js` — `fabq()`, `FABQ_NOTE`, `UNSCORED_ITEMS`.
- `views/group-v782.js` (RV782) — sixteen 0–6 selects, each labeled with its subscale or as unscored; a11y-checked.
- `mcp/adapters/fabq-v782.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, both subscales, the unscored list, related (startback, oswestry-odi, roland-morris-disability).
- `test/unit/fabq.test.js` — 8 tests (floor, both ceilings, unscored items are inert, worked example, item 11 in / item 8 out, independence with no total, unanswered subscale, invalid input).
- `docs/spec-v782.md` (this file).

## Sourcing (spec-v97)

Waddell G, Newton M, Henderson I, Somerville D, Main CJ. *Pain.* 1993;52(2):157-168
(PMID 8455963). The 0–6 anchors, both scored item sets, both ranges and the unscored list were
confirmed against two independent measure registries, which agreed item-number for
item-number. The 4 + 7 = 11 scored items also reconcile exactly with the 24 and 42 ranges both
sources give, which is what rules out the 0–96 figure other calculators publish.
