# spec-v353.md — Crowe classification (hip dysplasia) tile

> Status: **SHIPPED (2026-07-16).** Builds the `crowe-ddh` tile — the Crowe classification of adult
> developmental dysplasia of the hip (grades I–IV) by femoral-head subluxation. Catalog **1204 →
> 1205**, group G.

## Why

The catalog carries the fracture classifications (`garden-classification`, `weber-ankle`,
`schatzker-classification`, …) but had no adult hip-dysplasia grade. The Crowe classification is the most
commonly used adult-DDH grade for total-hip-arthroplasty planning. `crowe classification` / `hip dysplasia
grade` / `ddh grade` routed to nothing.

## What it does

The clinician picks the proximal femoral-head subluxation grade; the tile reports the grade, its
description, and whether it is a higher-grade (III–IV) hip.

- `lib/crowe-ddh-v353.js` — pure grade → description. **I:** < 50% subluxation. **II:** 50–75%. **III:**
  75–100% — flagged. **IV:** > 100% (high / complete dislocation) — flagged. Accepts I/II/III/IV or 1–4,
  case-insensitive.
- `views/group-v353.js` (RV353) — one select (dom `crowe-grade`), real `<label for>`.
- `lib/meta.js` — Crowe, Mani & Ranawat 1979 (JBJS) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v74 → v75); corpus → 1205.

**HIGH-STAKES:** it reports the Crowe grade the clinician has determined from the radiograph, never a
diagnosis, a treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). The
arthroplasty-complexity association (higher grades = greater reconstruction difficulty) is the classically
taught pattern, not an order; the surgical decision stays with the orthopedic surgeon (surfaced in the
tile note).

## Sourcing (spec-v97)

- **Citation:** Crowe JF, Mani VJ, Ranawat CS. Total hip replacement in congenital dislocation and
  dysplasia of the hip. *J Bone Joint Surg Am.* 1979;61(1):15-23 (the original grade I–IV subluxation
  bands).
- Cross-verified against orthopedic references (CORR "In Brief" / Radiopaedia / Wheeless) reproducing the
  same < 50% / 50–75% / 75–100% / > 100% femoral-head subluxation definitions.

## Verification

Lint (all catalog-truth surfaces at 1205), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: the example (grade III) renders the "75–100% subluxation" warn description, grade I flips to the
"< 50%" description, and the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the grade the clinician selects; it does not read imaging, measure subluxation, or
recommend a reconstruction. The MCP adapter + golden-probe promotion follow in a separate wave.
