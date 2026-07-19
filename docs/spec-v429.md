# spec-v429.md — Sarnat staging (neonatal HIE) tile

> Status: **SHIPPED (2026-07-18).** Builds the `sarnat-hie` tile — the Sarnat staging of neonatal
> hypoxic-ischemic encephalopathy, stages 1/2/3. Catalog **1280 → 1281**, group G.

## Why

The catalog had no staging for neonatal hypoxic-ischemic encephalopathy — the standard Sarnat bedside grading
a neonatology team assigns. `sarnat staging` / `neonatal HIE stage` routed to nothing. This fills that
neonatology gap.

## What it does

The clinician picks the stage; the tile reports the stage and its hallmark clinical features.

- `lib/sarnat-hie-v429.js` — pure stage → features, the three Sarnat stages. **1 (mild):** hyperalert, normal
  or increased tone, no seizures, resolves within 24 hours. **2 (moderate):** lethargic/obtunded, hypotonia,
  seizures common. **3 (severe):** stupor or coma, flaccid tone, suppressed or isoelectric EEG. Accepts 1-3,
  I-III, and mild/moderate/severe.
- `views/group-v429.js` (RV429) — one select (dom `sarnat-stage`), real `<label for>`.
- `lib/meta.js` — Sarnat & Sarnat 1976 (Arch Neurol) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v150 → v151); corpus → 1281.

**HIGH-STAKES:** it reports the clinical stage the clinician has assigned, never a diagnosis, a treatment
decision (e.g., therapeutic-hypothermia eligibility), or a prognosis ([spec-v11](spec-v11.md) §5.3); the
management decision stays with the neonatology team.

## Sourcing (spec-v97)

- **Citation:** Sarnat HB, Sarnat MS. Neonatal encephalopathy following fetal distress. A clinical and
  electroencephalographic study. *Arch Neurol.* 1976;33(10):696-705.
- Cross-verified against neonatology references reproducing the same mild (1) / moderate (2) / severe (3)
  grading by level of consciousness, tone, reflexes, autonomic function, and seizures.

## Verification

Lint (all catalog-truth surfaces at 1281), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: stage 2 renders "lethargic or obtunded ... seizures common," the other stages flip to their
features; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the stage the clinician selects; it does not examine the newborn, determine
therapeutic-hypothermia eligibility, or estimate outcome. The MCP adapter + golden-probe promotion follow in a
separate wave.
