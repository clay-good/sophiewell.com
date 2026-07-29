# spec-v603 — Bauer and modified Bauer score (skeletal metastases)

## What this gives you

Both Bauer versions from the same inputs, with the two situations where they disagree computed and flagged.

## Why it exists

A **cluster-completion gap**: `tokuhashi-revised` and `tomita-score` are in the catalog and this third widely
compared member was not.

## A higher score means a *better* prognosis

Every item scores 1 for the **favorable** state. The bands prove the direction:

| Original (0–5) | Modified (0–4) | Survival | Strategy in the derivation cohort |
|---|---|---|---|
| 0–1 | 0–1 | < 6 months | conservative |
| 2–3 | 2 | > 6 months | palliative surgery |
| 4–5 | 3–4 | > 12 months | excisional surgery |

Reading this as a severity scale inverts the answer. Scores in this family do **not** share a direction.

## The items

- No visceral metastases
- A solitary skeletal metastasis
- The primary is **not** lung cancer
- The primary is breast, kidney, lymphoma or myeloma
- No pathological fracture — **original only**

## The versions disagree in exactly two situations — opposite ways

Enumerating all 32 combinations gives precisely two:

| Situation | Original | Modified | More optimistic |
|---|---|---|---|
| No fracture + 1 other favorable factor | 2 → palliative | 1 → conservative | **original** |
| Fracture present + 3 favorable factors | 3 → palliative | 3 → **excisional** | **modification** |

**Neither version is systematically more optimistic**, and both disagreements change management. A test
asserts there are exactly two disagreement shapes and that they point opposite ways.

## Two more things

- **Histology carries up to two points through two overlapping items.** Breast scores both "not lung" and
  "favorable primary"; colon scores one; lung scores neither — **half the modified scale**.
- **The dropped item was dropped for a reason.** Pathological fracture predicted worse survival in the
  *extremity* group only, not the spine. The original is not simply the fuller score — the two are tuned to
  different anatomy.

## Scope (spec-v11 §5.3)

A group-level **survival** estimate. It does not decide whether to operate, and **the strategies attached to
the bands describe what was done in the derivation cohorts, not what should be done**. It does not account
for modern systemic therapy, which has changed survival in several of the very histologies it rewards. A low
score is not a reason to withhold an operation that would relieve pain or restore stability.

## Sources

- Bauer HC, Wedin R. *Acta Orthop Scand.* 1995;66(2):143-146.
- Leithner A, Radl R, Gruber G, et al. *Eur Spine J.* 2008;17(11):1488-1495.

## Files

`lib/bauer-score-v603.js`, `views/group-v603.js`, `mcp/adapters/bauer-score-v603.js` (wave 428),
`test/unit/bauer-score.test.js`. Catalog 1452 → 1453; MCP 1389 → 1390.
