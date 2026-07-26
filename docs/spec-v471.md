# spec-v471.md — Gass staging (macular hole) tile

> Status: **SHIPPED (2026-07-19).** Builds the `gass-macular-hole` tile — the Gass classification of the stages
> of development of an idiopathic macular hole, stages 1-4. Catalog **1321 → 1322**, group G.

## Why

The retinal / macular tiles (ICDR diabetic retinopathy, diabetic macular edema) had no macular-hole staging.
`gass` / `macular hole stage` routed to nothing. This fills that retina gap.

## What it does

The clinician picks the stage; the tile reports the stage and its biomicroscopic / OCT description.

- `lib/gass-macular-hole-v471.js` — pure stage → description, the four Gass stages. **1:** impending (foveal
  detachment, no full-thickness defect). **2:** small full-thickness hole (less than 400 micrometers). **3:**
  larger full-thickness hole (400 micrometers or more) without a complete posterior vitreous detachment. **4:**
  full-thickness hole with a complete posterior vitreous detachment (Weiss ring). Accepts 1-4 and I-IV.
- `views/group-v471.js` (RV471) — one select (dom `gass-stage`), real `<label for>`.
- `lib/meta.js` — Gass 1995 (Am J Ophthalmol) citation + accessed date + grouped bands. No citation-staleness
  row (the citation carries no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v191 → v192); corpus → 1322.

**HIGH-STAKES:** it reports the stage the clinician has determined on examination / imaging, never a diagnosis,
a treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); the management decision stays with the
ophthalmology team.

## Sourcing (spec-v97)

- **Citation:** Gass JD. Reappraisal of biomicroscopic classification of stages of development of a macular
  hole. *Am J Ophthalmol.* 1995;119(6):752-759. The citation URL is a PubMed term search for the classic paper.
- Cross-verified against retina references reproducing the same impending (1) / small-full-thickness (2) /
  larger-full-thickness-without-PVD (3) / full-thickness-with-complete-PVD (4) staging.

## Verification

Lint (all catalog-truth surfaces at 1322), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: stage 2 renders "a small full-thickness macular hole (less than 400 micrometers)," the other stages
flip to their descriptions; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the stage the clinician selects; it does not read the OCT, measure the hole, or recommend
management (observation vs vitrectomy). The MCP adapter + golden-probe promotion follow in the next wave (296).
