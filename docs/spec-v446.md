# spec-v446.md — ROP stage (retinopathy of prematurity) tile

> Status: **SHIPPED (2026-07-19).** Builds the `rop-stage` tile — the ICROP stage of retinopathy of
> prematurity, stages 1/2/3/4/5. Catalog **1297 → 1298**, group G.

## Why

The catalog gained a neonatology cluster (Sarnat HIE, Papile IVH, Bell NEC) but had no ROP stage — the
standard ICROP staging on the ROP screening exam. `rop stage` / `retinopathy of prematurity stage` routed to
nothing. This fills that ophthalmology / neonatology gap.

## What it does

The ophthalmologist picks the stage; the tile reports the stage and its retinal description.

- `lib/rop-stage-v446.js` — pure stage → description, the five ICROP stages. **1:** demarcation line. **2:**
  ridge. **3:** ridge with extraretinal fibrovascular proliferation. **4:** partial retinal detachment (4A
  extrafoveal, 4B foveal). **5:** total retinal detachment. Accepts 1-5 (4a/4b map to 4).
- `views/group-v446.js` (RV446) — one select (dom `rop-stage`), real `<label for>`.
- `lib/meta.js` — ICROP revisited 2005 (Arch Ophthalmol) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v167 → v168); corpus → 1298.

**HIGH-STAKES:** it reports the stage the ophthalmologist has determined, never a diagnosis, a treatment
decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). Zone and plus disease are separate axes that also
drive management; the decision stays with the ophthalmology / neonatology team.

## Sourcing (spec-v97)

- **Citation:** International Committee for the Classification of Retinopathy of Prematurity. The
  International Classification of Retinopathy of Prematurity revisited. *Arch Ophthalmol.*
  2005;123(7):991-999.
- Cross-verified against ophthalmology / neonatology references reproducing the same demarcation-line (1) /
  ridge (2) / ridge-with-proliferation (3) / partial-detachment (4) / total-detachment (5) staging.

## Verification

Lint (all catalog-truth surfaces at 1298), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: stage 3 renders "ridge with extraretinal fibrovascular proliferation," the other stages flip to
their descriptions; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the stage the ophthalmologist selects; it does not examine the retina, add the zone or plus
disease, or recommend treatment. The MCP adapter + golden-probe promotion follow in a separate wave.
