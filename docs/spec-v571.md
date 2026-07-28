# spec-v571.md — E-FACED score tile

> Status: **SHIPPED (2026-07-28).** Builds the `e-faced` tile. Catalog **1420 → 1421**, group G.

## Why

A **revised-successor gap**. `faced-bronchiectasis` and `bronchiectasis-bsi` are both in the catalog;
E-FACED — the exacerbation-augmented successor to FACED by the same authors — was zero-hit.

## What it does

| Item | Points |
| --- | --- |
| **E** — at least one severe exacerbation in the previous year | 2 |
| **F** — FEV₁ <50% predicted | 2 |
| **A** — age ≥70 | 2 |
| **C** — chronic *Pseudomonas aeruginosa* colonization | 1 |
| **E** — extension >2 lobes | 1 |
| **D** — dyspnea, mMRC 3-4 | 1 |

**0-3 mild · 4-6 moderate · 7-9 severe.**

## The four rules a plausible implementation breaks

**1. The successor answers a different question.** FACED predicts **mortality**; E-FACED predicts
**exacerbations**, with essentially unchanged mortality performance. Choosing between them is choosing the
outcome — not taking the newer score.

**2. The paper's own abstract contradicts its own results section.** The abstract says the best cut point
was at least **two exacerbations** in the previous year; the results section says at least **one
hospitalization** and builds the model and Table 3 around it. Those are different questions — a count of
any-severity exacerbations against a single severe one. The **body** describes the actual model
construction, so it governs, and the discrepancy is stated in every result rather than hidden: someone who
has read only the abstract will otherwise think this tile has the wrong item. The paper's methods define a
severe exacerbation as one the physician considered to require hospitalization.

**3. The bands do not carry over from FACED — and a widely copied source gets this wrong.** FACED is 0-7
with bands 0-2 / 3-4 / 5-7. E-FACED is 0-9 with bands 0-3 / 4-6 / 7-9. At least one widely reproduced
secondary source lists the E-FACED **components** under the FACED **bands**, which calls a score of 5
"severe" when E-FACED calls it moderate. A test constructs exactly that score and asserts the result names
the discrepancy. This live error is much of the reason the tile exists.

**4. The weighting is uneven: six items but nine points.** Exacerbation, FEV₁ and age carry 2 each;
Pseudomonas, extension and dyspnea carry 1 each.

## Scope (spec-v11 §5.3)

Predicts exacerbation risk at a **group** level. It does **not** diagnose bronchiectasis, which is a
radiological diagnosis, and does **not** identify its cause — which matters, because cystic fibrosis,
immunodeficiency, allergic bronchopulmonary aspergillosis and nontuberculous mycobacterial disease all
require specific treatment this score knows nothing about. It does not select antibiotics, airway clearance
or long-term suppressive therapy, and a high score is not by itself an indication for any of them.

## Files

- `lib/e-faced-v571.js` — `eFaced()`, `E_FACED_ITEMS`, `E_FACED_MAX`, `FACED_MAX`.
- `views/group-v571.js` (RV571) — items under an **h2**, each label showing its own point value.
- `mcp/adapters/e-faced-v571.js` — wave 396.
- `test/unit/e-faced.test.js` — 12 tests.
- `docs/spec-v571.md` (this file).

## Sourcing (spec-v97)

Transcribed from the primary full text and an independent reproduction of the component table, with the
predecessor's bands checked separately so the difference could be stated.

- Martinez-Garcia MA, Athanazio RA, Girón R, et al. Predicting high risk of exacerbations in bronchiectasis:
  the E-FACED score. *Int J Chron Obstruct Pulmon Dis.* 2017;12:275-284.
