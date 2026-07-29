# spec-v606 — New Katagiri score (skeletal metastasis survival)

## What this gives you

The 2014 Katagiri prognostic score, with the two items that are routinely implemented wrong made explicit.

## Why it exists

A **cluster-completion gap**: `tokuhashi-revised`, `tomita-score` and `bauer-score` are in the catalog. This
fourth member is the only one derived in a cohort treated **mostly non-surgically**.

## The score (0–10)

| Factor | Points |
|---|---|
| Primary site — slow / moderate / rapid growth | 0 / 2 / 3 |
| Visceral or cerebral metastases — none / nodular / disseminated | 0 / 1 / 2 |
| Laboratory — normal / abnormal / critical | 0 / 1 / 2 |
| ECOG performance status 3–4 | 1 |
| Previous chemotherapy | 1 |
| Multiple skeletal metastases | 1 |

## Primary site is graded by treatability, not by organ

| | Slow (0) | Moderate (2) | Rapid (3) |
|---|---|---|---|
| Breast / prostate | **hormone-dependent** | **hormone-independent** | — |
| Lung | — | **molecularly targeted** | **non-targeted** |

The same organ appears in two groups. **Naming the organ does not determine the score.**

## The two laboratory tiers share no analyte

| Tier | Analytes |
|---|---|
| Abnormal (1) | CRP ≥ 0.4 mg/dL · LDH ≥ 250 IU/L · albumin < 3.7 g/dL |
| Critical (2) | platelets < 100,000/µL · calcium ≥ 10.3 mg/dL · bilirubin ≥ 1.4 |

They are **different tests**, not mild and severe versions of the same one. So:

- All **three** abnormal values together → **1 point**
- A **single** low platelet count → **2 points**

Each tier is any-of; critical outranks abnormal; the item never reaches 3.

## Bands — derivation-cohort one-year survival

| Score | Risk | 1-year survival |
|---|---|---|
| 0–3 | low | **91%** |
| 4–6 | intermediate | **49%** |
| 7–10 | high | **6%** |

Validation cohorts report different rates.

## Provenance

The 2014 score **added the laboratory item** to a 2005 predecessor — a score computed without it is the older
instrument.

## Scope (spec-v11 §5.3)

A group-level **survival** estimate. It does not decide whether to operate, does not choose between surgery,
radiotherapy and systemic treatment, and does not grade the bone — mechanical stability and fracture risk are
separate axes. Derived in a mostly non-surgical cohort, so a purely surgical series is outside its
derivation, and the primary-site groupings assume the therapies available when it was built.

## Source

- Katagiri H, Okada R, Takagi T, et al. *Cancer Med.* 2014;3(5):1359-1367.

## Files

`lib/katagiri-v606.js`, `views/group-v606.js`, `mcp/adapters/katagiri-v606.js` (wave 431),
`test/unit/katagiri.test.js`. Catalog 1455 → 1456; MCP 1392 → 1393.
