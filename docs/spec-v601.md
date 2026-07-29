# spec-v601 — Pollock-Flickinger score (AVM radiosurgery outcome)

## What this gives you

Both published versions of the radiosurgery-based AVM score from the same inputs, with the difference between
them computed and any band crossing flagged.

## Why it exists

An **axis gap**: `spetzler-ponce` grades **microsurgical** risk. This predicts the outcome of **stereotactic
radiosurgery** — a different treatment and a different answer for the same malformation. Every slug spelling
and filename search returned 0.

## The formula — identical in both versions

**0.1 × volume (cm³) + 0.02 × age (years) + 0.3 × location tier**

| Location | Original tier | Modified tier |
|---|---|---|
| Frontal, temporal | 0 | 0 |
| Parietal, occipital, corpus callosum, cerebellar | 1 | 0 |
| **Intraventricular** | 1 | **not listed** |
| Basal ganglia, thalamus, brainstem | 2 | 1 |

**The modification changed no coefficient — it halved the location variable's range** (three tiers → two).
A widely circulated rendering gives the modified coefficient as 0.5; **both primary abstracts give 0.3**.

## The consequence is exact

The modified score is **exactly 0.3 lower** for every location except frontal and temporal. Since the bands
sit at 1.00 / 1.50 / 2.00, that shift can move a patient a whole band:

| 8 cm³ basal-ganglia AVM, age 40 | Score | Band | Obliteration without deficit |
|---|---|---|---|
| Original | 2.2 | ≥ 2.00 | **46%** |
| Modified | 1.9 | 1.51–2.00 | **64%** |

## Reported outcomes by modified score

| Score | Obliteration without new deficit | mRS decline |
|---|---|---|
| ≤ 1.00 | 89% | 0% |
| 1.01–1.50 | 70% | 13% |
| 1.51–2.00 | 64% | 20% |
| ≥ 2.00 | 46% | 36% |

The published bands **overlap at exactly 2.00**; the higher band is applied and flagged.

## Two more things

- **Intraventricular has no modified tier.** `modifiedAvailable` is false and `modified` is null — the
  source's hole, not filled by analogy.
- **It is continuous, not a grade.** Volume and age are unbounded, so there is no maximum and no "x of y"
  reading — unlike the small ordinal beside it.

## Scope (spec-v11 §5.3)

Predicts a **radiosurgical** outcome at a group level, for a patient in whom radiosurgery is already being
considered. It does not choose between radiosurgery, microsurgery, embolization and **observation** — and
observation is a real option, since the ARUBA trial found medical management superior to intervention for
*unruptured* malformations over its follow-up. It does not plan a dose or target volume, does not estimate
rupture risk without treatment, and a favourable score is not by itself an indication to treat.

## Sources

- Pollock BE, Flickinger JC. *J Neurosurg.* 2002;96(1):79-85.
- Pollock BE, Flickinger JC. *Neurosurgery.* 2008;63(2):239-243.

## Files

`lib/pollock-flickinger-v601.js`, `views/group-v601.js`, `mcp/adapters/pollock-flickinger-v601.js`
(wave 426), `test/unit/pollock-flickinger.test.js`. Catalog 1450 → 1451; MCP 1387 → 1388.
