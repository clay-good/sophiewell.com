# spec-v330.md — Nottingham Prognostic Index (breast cancer) tile

> Status: **SHIPPED (2026-07-15).** Builds the `nottingham-prognostic-index` tile — the Nottingham
> Prognostic Index (NPI) for early invasive breast cancer. Catalog **1181 → 1182**, group G.

## Why

The catalog carries many prognostic indices (CLL-IPI, FLIPI-2, MIPI, PPI, …) and the `gleason-grade-group`
tile but had no Nottingham Prognostic Index (the only "NPI" tile is the billing National-Provider-Identifier
validator). NPI is the standard clinicopathologic prognostic score for early breast cancer. `nottingham
prognostic index` / `breast cancer prognosis` routed to nothing.

> Note: `silverman-andersen` was scoped as a candidate this session but is **already in the catalog**
> (group N, `lib/scoring-v6.js`) — a fresh-sweep grep missed the hyphenated form; that build was reverted
> before commit, and NPI was built in its place (reusing spec number v330).

## What it does

The clinician enters the tumor size and selects the node stage and grade; the tile computes the NPI and its
prognostic group.

- `lib/nottingham-npi-v330.js` — pure inputs → score. **NPI = (0.2 × tumor size in cm) + node stage +
  grade.** Node stage 1 (0 nodes) / 2 (1–3) / 3 (≥ 4); grade 1/2/3 (Nottingham/Elston-Ellis). Prognostic
  groups: **excellent** ≤ 2.4 (~93% 5-yr survival), **good** > 2.4 to ≤ 3.4 (~85%), **moderate** > 3.4 to
  ≤ 5.4 (~70%), **poor** > 5.4 (~50%). Moderate/poor are flagged.
- `views/group-v330.js` (RV330) — a size number input plus the node-stage and grade selects, real
  `<label for>`.
- `lib/meta.js` — Galea 1992 / Haybittle 1982 citation + accessed date + bands. No citation-staleness row
  (the citation carries no guideline-issuer acronym).
- 4 worked-example unit tests + fuzz registration; synonym entry (v51 → v52); corpus → 1182.

**HIGH-STAKES:** it reports the cited prognostic score and group from the pathology entered, never a
diagnosis or a treatment order ([spec-v11](spec-v11.md) §5.3); the adjuvant-therapy decision stays with the
multidisciplinary team.

## Sourcing (spec-v97)

- **Citation:** Galea MH, Blamey RW, Elston CE, Ellis IO. The Nottingham Prognostic Index in primary breast
  cancer. *Breast Cancer Res Treat.* 1992;22(3):207-219 (original: Haybittle JL, et al. *Br J Cancer.*
  1982;45(3):361-366). Cross-verified against secondary reproductions of the formula and the group cut-offs.
- The 0.2 size weight, the 1/2/3 node-stage and grade encodings, and the 2.4 / 3.4 / 5.4 group boundaries
  are as published.

## Verification

Lint (all catalog-truth surfaces at 1182), unit suite (+4 + fuzz), build — all green. Verified in a real
browser: the example (2.5 cm, node stage 2, grade 2) computes NPI 4.5 (moderate), and the tile does not
scroll horizontally at 320px.

## Out of scope

The tile computes the classic NPI; it does not implement NPI+ (the biomarker-augmented version), assign the
histologic grade, or estimate individualized survival. The MCP adapter + golden-probe promotion follow in a
separate wave.
