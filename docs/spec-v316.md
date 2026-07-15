# spec-v316.md — GOLD ABE assessment tool (COPD group A/B/E) tile

> Status: **SHIPPED (2026-07-15).** Builds the `gold-abe` tile — the 2023 GOLD "ABE" grouping that
> assigns a COPD patient to group A, B, or E from symptom burden (mMRC or CAT) and exacerbation
> history. Catalog **1167 → 1168**, group G.

## Why

The catalog already carries the GOLD **spirometric** grade (`gold-spirometry`, FEV1 severity), `cat`,
and `mmrc-dyspnea` individually — and each of those tiles' notes points to the **ABE group "that drives
pharmacotherapy"** as a separate, un-built clinician tool. `gold abe` / `copd group` routed to none of
them. The 2023 report replaced the 2017-2022 ABCD grid, merging the former C and D into a single
exacerbation-prone group E; that grouping is the peer of the spirometric grade and had no tile.

## What it does

The clinician enters the symptom burden (mMRC grade and/or CAT score — either suffices) and the
past-12-month exacerbation history; the tile reports the GOLD group.

- `lib/gold-abe-v316.js` — pure inputs → group. Two independent axes:
  - **Symptoms:** "more symptoms" if `mMRC >= 2` **or** `CAT >= 10`.
  - **Exacerbations (past 12 mo):** "high risk" if `>= 2 moderate` **or** `>= 1 hospitalized`.
  - **Group:** E if high exacerbation risk (regardless of symptoms); else B if more symptoms; else A.
- `views/group-v316.js` (RV316) — two number inputs (mMRC, CAT) + a moderate-exacerbation count and a
  hospitalized-exacerbation checkbox, real `<label for>`.
- `lib/meta.js` — GOLD 2025 Report citation + accessed date + bands; a **citation-staleness ledger row**
  (maintenance-driven — GOLD is not in the check-citations issuer pattern, but the report republishes
  annually, so the row matches the `gold-spirometry` precedent).
- 11 worked-example unit tests + fuzz registration; synonym entry (v37 → v38); corpus → 1168.

**HIGH-STAKES:** it reports the group assignment (A / B / E), never a treatment order
([spec-v11](spec-v11.md) §5.3); the group informs initial pharmacotherapy, but the drug choice, the
eosinophil / comorbidity nuances, and the plan stay with the clinician.

## Sourcing (spec-v97)

- **Citation:** Global Initiative for Chronic Obstructive Lung Disease (GOLD). Global Strategy for the
  Prevention, Diagnosis and Management of COPD: 2025 Report — the ABE assessment tool (same issuer as
  the existing `gold-spirometry` tile). The ABE tool and its cut-points have been stable across the
  2023 (which introduced it), 2024, and 2025 Reports.
- **Symptom axis:** more symptoms if mMRC ≥ 2 or CAT ≥ 10.
- **Exacerbation axis:** high risk (→ group E) if ≥ 2 moderate exacerbations, or ≥ 1 leading to hospital
  admission, in the past 12 months.
- **Group:** A = low risk + less symptoms; B = low risk + more symptoms; E = high risk regardless of
  symptoms. The spirometric grade (GOLD 1-4) is reported separately and no longer sets the letter.

## Verification

Lint (all catalog-truth surfaces at 1168; citation gate + ledger row green), unit suite (+11 + fuzz),
build — all green. Verified in a real browser: the example (mMRC 2, one moderate exacerbation) renders
"Group B — more symptoms."

## Out of scope

The tile classifies from the mMRC/CAT and exacerbation history the clinician enters; it does not read
the CAT items (patient-completed, and the CAT instrument text is copyrighted — only the ≥ 10 threshold
number is used), grade spirometry, or recommend a specific drug regimen. The MCP adapter + golden-probe
promotion follow in a separate wave.
