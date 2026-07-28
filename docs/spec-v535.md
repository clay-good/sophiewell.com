# spec-v535.md — CaPTHUS score (single-gland primary hyperparathyroidism) tile

> Status: **SHIPPED (2026-07-28).** Builds the `capthus` tile — the five-criterion predictor of single-gland
> disease in primary hyperparathyroidism. Catalog **1384 → 1385**, group G.

## Why

`capthus`, `kebebew`, `parathyroid`, and `sestamibi` were all zero-hit across `corpus.json`, `app.js`, and
`lib/meta.js`. The `hyperparathyroidism` hits sit inside the calcium/creatinine clearance ratio tile's
interpretation text, which answers a **diagnostic** question (distinguishing familial hypocalciuric
hypercalcemia from primary hyperparathyroidism). CaPTHUS assumes the diagnosis is already made and predicts
the **surgical anatomy** — a different axis.

## What it does

The name is the mnemonic. Five criteria, one point each, total **0-5**:

| | Criterion |
| --- | --- |
| **Ca** | Preoperative total serum calcium ≥ **12 mg/dL** (3 mmol/L) |
| **PTH** | Intact PTH ≥ **twice** the upper limit of normal |
| **U** | **Ultrasound** positive for **one** enlarged gland |
| **S** | **Sestamibi** positive for **one** enlarged gland |
| **+** | The two scans **concordant** — same single gland, same side |

**The calcium threshold is 12 mg/dL, not 3 mg/dL.** The original states both units, and the number 3 sitting
next to a score that also runs 0-5 is a standing invitation to misread the unit. A calculator applying
3 mg/dL would award the calcium point to essentially every patient with primary hyperparathyroidism and
inflate every score. The field label carries both units and says which is which.

**The fifth criterion is not redundant with the third and fourth.** Concordance is scored *separately*, so a
patient whose ultrasound and sestamibi each localize a single gland but to **different** glands scores **2**,
not 3. Implementations that treat concordance as implied by two positive scans over-score exactly the
discordant patient the criterion exists to catch. The result exposes a `discordantScans` flag, and a test
pins the 2-versus-3 distinction.

**What the threshold actually claims.** A score of **≥3** predicted single-gland disease with a positive
predictive value reported as **100% in the derivation cohort**. The tile labels it as derivation performance
rather than a general property — external validation runs lower and varies, with figures in the mid-90s more
typical and one widely cited secondary account giving 91%. Reporting a bare "100%" would be the single most
misleading thing this tile could do.

**And the asymmetry that matters more:** the **negative** predictive value is poor. A low score does **not**
predict multigland disease — it predicts little. This is a rule-**in** for a focused approach, not a
rule-out, so a score below 3 is an *absence of information* rather than evidence of four-gland disease. Both
framings are pinned by tests.

- `lib/capthus-v535.js` — pure criteria → total, met letters, prediction flag, discordance flag. Exports
  `CAPTHUS_CRITERIA`.
- `views/group-v535.js` (RV535) — five yes/no selects (dom `cap-*`) under an **h2** heading.
- `lib/meta.js` — Kebebew and colleagues 2006 citation + accessed date + bands. No citation-staleness row
  (a named-author article, no guideline-issuer acronym).
- 9 worked-example unit tests + fuzz registration; synonym entry; corpus → 1385.

**HIGH-STAKES:** this predicts **anatomy, not the need for an operation**. It does not diagnose primary
hyperparathyroidism, does not establish that surgery is indicated — that turns on the published operative
criteria, symptoms, bone density, renal involvement, and age — and is not a substitute for intraoperative PTH
monitoring or for the surgeon's judgment about converting to bilateral exploration
([spec-v11](spec-v11.md) §5.3). It says nothing about **familial hypocalciuric hypercalcemia**, which must be
excluded before any of this applies, and nothing about parathyroid carcinoma.

## Duplicate check

Per the procedure in [spec-v508](spec-v508.md): the acronym (`capthus`), the first author (`kebebew`), the
organ (`parathyroid`), the imaging (`sestamibi`), and the disease (`hyperparathyroidism`) — each against
**both** `corpus.json` and `app.js` (and `lib/meta.js`), plus a `test/unit/` scan. Only
`hyperparathyroidism` is non-zero, and it belongs to the calcium/creatinine clearance ratio tile as described
above.

## Sourcing (spec-v97)

- **Citation:** Kebebew E, Hwang J, Reiff E, Duh QY, Clark OH. Predictors of single-gland vs multigland
  parathyroid disease in primary hyperparathyroidism: a simple and accurate scoring model. *Arch Surg.*
  2006;141(8):777-782.
- Criteria, units, and the ≥3 threshold transcribed from the primary abstract and corroborated by external
  validation cohorts reproducing the same five criteria and the same threshold. The derivation PPV of 100% is
  the primary source's own wording and is shipped **labeled as derivation performance**, alongside the lower
  external figures.

## Verification

Lint (all catalog-truth surfaces at 1385), unit suite (+9 + fuzz), a11y, build, and the chromium
heading-level check — all green.

## Out of scope

The tile does not diagnose primary hyperparathyroidism, exclude familial hypocalciuric hypercalcemia, apply
the operative criteria for asymptomatic disease, interpret intraoperative PTH kinetics, or recommend a
surgical approach. The MCP adapter + golden-probe promotion ship in the same wave (360).
