# spec-v565.md — Modified NIH lupus nephritis activity and chronicity indices tile

> Status: **SHIPPED (2026-07-28).** Builds the `lupus-nephritis-indices` tile. Catalog **1414 → 1415**,
> group G.

## Why

A **revised-successor gap**. `grep -in "nephritis" app.js` returned nothing. The 2018 ISN/RPS revision
introduced these indices specifically **to replace** the A / A-C / C subscripts the 2003 scheme appended to
classes III and IV — a report reading "Class IV-G (A/C)" is using the superseded scheme.

## What it does

**Activity index (0-24)** — six components, each 0-3:

| Component | Weight | Rubric |
| --- | --- | --- |
| Endocapillary hypercellularity | ×1 | % glomeruli |
| Neutrophils and/or karyorrhexis | ×1 | % glomeruli |
| **Fibrinoid necrosis** | **×2** | % glomeruli |
| Hyaline deposits (wire loops / hyaline thrombi) | ×1 | % glomeruli |
| **Cellular / fibrocellular crescents** | **×2** | % glomeruli |
| Interstitial inflammation | ×1 | mild/moderate/severe |

**Chronicity index (0-12)** — four components, each 0-3, **all unweighted**: total glomerulosclerosis
(global **and** segmental), fibrous crescents, tubular atrophy, interstitial fibrosis.

## The five rules a plausible implementation breaks

**1. The two indices are never added together.** They measure opposite things — what may still respond to
treatment against what is already scarred. A combined "36" is meaningless. The lib emits no total, and a
test asserts none exists.

**2. Only two components are weighted, and only in the activity index.** Six components each 0-3 would cap
at **18**; the published maximum is **24**. The extra 6 is entirely fibrinoid necrosis and crescents — a
test asserts that arithmetic. The chronicity index is wholly unweighted.

**3. Two different 0-3 rubrics coexist inside the same total, and they are incommensurable.** Glomerular
components are scored by **percentage of glomeruli** (1 = <25%, 2 = 25-50%, 3 = >50%); tubulointerstitial
components by **mild / moderate / severe**. Identical numeric range, different question. Each field carries
its own rubric rather than sharing one option list.

**4. The denominator is the glomeruli the biopsy core actually captured.** An inadequate sample can only
**lower** the glomerular scores, so a low activity index on a sparse core may reflect sampling rather than
disease. The result says so, because this failure mode is silent.

**5. The 2018 and 1984 indices are not interconvertible.** Karyorrhexis was **separated** from fibrinoid
necrosis and **merged** with neutrophil infiltration (the original's "leukocyte exudation") — one original
component was split and re-glued to another. A score copied from an older report is not comparable.

## A wording point that changes what is counted

The chronicity component is **total** glomerulosclerosis — global **and** segmental. One secondary source
writes "global glomerulosclerosis", which would omit segmental lesions and undercount chronicity. The
revision's own wording is followed (spec-v97).

## Scope (spec-v11 §5.3)

**Histologic** indices scored by a renal pathologist on a biopsy. They do **not** diagnose lupus or lupus
nephritis, do **not** assign the ISN/RPS class (a separate classification this does not compute), and do
**not** measure kidney function — they say nothing about proteinuria or eGFR. They are not by themselves an
indication to start, escalate or withdraw immunosuppression, and **a high chronicity index in particular is
not a reason to withhold treatment**, since activity and chronicity coexist and the activity is what may
still respond.

## Files

- `lib/lupus-nephritis-indices-v565.js` — `lupusNephritisIndices()`, `ACTIVITY_COMPONENTS`,
  `CHRONICITY_COMPONENTS`, `GLOMERULAR_RUBRIC`, `SEVERITY_RUBRIC`, `rubricFor()`.
- `views/group-v565.js` (RV565) — one **h2** per index; each select is built from its component's own rubric.
- `mcp/adapters/lupus-nephritis-indices-v565.js` — wave 390.
- `test/unit/lupus-nephritis-indices.test.js` — 17 tests.
- `docs/spec-v565.md` (this file).

## Sourcing (spec-v97)

Two independent reproductions of the revision's own table agree on every component, every weight and both
maxima.

- Bajema IM, Wilhelmus S, Alpers CE, et al. Revision of the ISN/RPS classification for lupus nephritis…
  *Kidney Int.* 2018;93(4):789-796.
