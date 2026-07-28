# spec-v538.md — NEOS score (anti-NMDAR encephalitis one-year status) tile

> Status: **SHIPPED (2026-07-28).** Builds the `neos` tile — the five-predictor prognostic score for
> anti-NMDA receptor encephalitis. Catalog **1387 → 1388**, group G.

## Why

`neos`, `nmdar`, `balu`, and `titulaer` were all zero-hit across `corpus.json`, `app.js`, and `lib/meta.js`.
The `encephalitis` hits belong to the Bickerstaff brainstem-encephalitis **diagnostic criteria** tile, which
asks whether a patient *has* a particular encephalitis. NEOS assumes the diagnosis is made and predicts the
**outcome** of a different disease.

## What it does

Five binary predictors, one point each, total **0-5**:

- Admission to an intensive care unit
- No treatment started within 4 weeks of symptom onset
- No clinical improvement 4 weeks after starting treatment (tumor removal or immunotherapy)
- Abnormal MRI
- CSF white cell count above 20 cells/µL

The outcome predicted is **poor functional status at one year**, defined as a modified Rankin Scale of ≥3.

### The tile reports only the two probability bands the source actually published

| Score | Published probability of poor one-year status |
| --- | --- |
| 0 or 1 | **3%** |
| 2 or 3 | **none published** |
| 4 or 5 | **69%** |

The derivation deliberately pooled the middle: groups of twenty patients or fewer were combined with adjacent
scores to avoid unstable estimates. Per-score probabilities for 2 and 3 exist only as points on a figure and
are printed nowhere in the paper or the validation studies. **Figures for those scores do circulate** — they
appear in no primary source. So the tile returns `probability: null` with a `probabilityPublished` flag and
states the omission. Inventing the middle of a five-point scale is exactly the kind of plausible fabrication
a calculator makes easy, and a test asserts no stray percentage appears at those scores.

**The abnormal-MRI predictor is deliberately loose in the source, and the tile does not tighten it.** The
derivation classified an MRI as abnormal on the *referring physician's opinion* — findings consistent with or
suggestive of encephalitis. Substituting a specific radiologic criterion would score a different variable
from the one validated.

**Two of the five predictors are about treatment timing, so the score is not available on day one.** Both
"no treatment within 4 weeks" and "no improvement 4 weeks after treatment" require four weeks to have passed.
This is a prognostic instrument for a patient already some way into their illness, not an early triage tool,
and the copy says so rather than letting a reader assume it applies at presentation.

- `lib/neos-v538.js` — pure predictors → total, publication flag, and probability-or-null. Exports
  `NEOS_PREDICTORS`.
- `views/group-v538.js` (RV538) — five yes/no selects (dom `neos-*`) under an **h2** heading.
- `lib/meta.js` — Balu and colleagues 2019 citation + accessed date + bands. No citation-staleness row
  (a named-author article, no guideline-issuer acronym).
- 9 worked-example unit tests + fuzz registration; synonym entry; corpus → 1388.

**HIGH-STAKES:** anti-NMDAR encephalitis is a disease in which **prolonged, severe illness is compatible with
good recovery**, and recovery often continues over 18-24 months. A high NEOS score identifies a group with
worse *average* one-year outcomes; it is **not** a prediction for the patient in front of you and it is
emphatically **not a basis for withdrawing or limiting treatment** — the decision it would most damagingly be
misused to support ([spec-v11](spec-v11.md) §5.3). A test asserts every score from 0 to 5 carries that
refusal. It does not diagnose anti-NMDAR encephalitis, which requires the clinical syndrome plus antibody
testing, and it does not select or sequence immunotherapy.

## Duplicate check

Per the procedure in [spec-v508](spec-v508.md): the acronym (`neos`), the receptor (`nmdar`), the disease
(`encephalitis`), and both key authors (`balu`, `titulaer`) — each against **both** `corpus.json` and
`app.js` (and `lib/meta.js`), plus a `test/unit/` scan. Only `encephalitis` is non-zero, and it belongs to
the Bickerstaff diagnostic tile as described above.

## Sourcing (spec-v97)

- **Citation:** Balu R, McCracken L, Lancaster E, Graus F, Dalmau J, Titulaer MJ. A score that predicts
  1-year functional status in patients with anti-NMDA receptor encephalitis. *Neurology.*
  2019;92(3):e244-e252.
- The five predictors and the outcome definition were confirmed against the derivation paper and an
  independent validation cohort. The **absence** of published probabilities for scores 2 and 3 was verified
  in both, and is the reason the tile returns null there rather than an interpolated figure.

## Verification

Lint (all catalog-truth surfaces at 1388), unit suite (+9 + fuzz), a11y, build, and the chromium
heading-level check — all green.

## Out of scope

The tile does not diagnose anti-NMDAR encephalitis, screen for an underlying teratoma, select or sequence
immunotherapy, compute a probability for scores of 2 or 3 (deliberately), or predict outcome beyond one year.
The MCP adapter + golden-probe promotion ship in the same wave (363).
