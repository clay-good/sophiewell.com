# spec-v407.md — Steinberg staging (femoral head AVN) tile

> Status: **SHIPPED (2026-07-17).** Builds the `steinberg-avn` tile — the Steinberg (Penn) staging of
> femoral-head osteonecrosis (stages 0-VI). Catalog **1258 → 1259**, group G.

## Why

The catalog carries the Ficat-Arlet staging of femoral-head AVN (`ficat-arlet`) but not the more granular
Steinberg (University of Pennsylvania) system, which adds the quantitative A/B/C extent grading. `steinberg`
/ `avascular necrosis staging` routed to nothing. This is the Ficat-Arlet↔Steinberg AVN companion-gap.

## What it does

The clinician picks the stage; the tile reports the stage and its radiographic description.

- `lib/steinberg-avn-v407.js` — pure stage → description. **0:** normal imaging. **I:** normal XR, abnormal
  MRI. **II:** cystic / sclerotic. **III:** subchondral collapse (crescent) without flattening. **IV:**
  flattening. **V:** joint narrowing / acetabular changes. **VI:** degenerative. Stages I-V are quantified A
  (<15%) / B (15-30%) / C (>30%) by extent. Accepts 0-VI, 0-6, and the A/B/C subtypes → base stage.
- `views/group-v407.js` (RV407) — one select (dom `stb-stage`), real `<label for>`.
- `lib/meta.js` — Steinberg 1995 (J Bone Joint Surg Br) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v128 → v129); corpus → 1259.

**HIGH-STAKES:** it reports the radiographic stage the clinician has determined, never a diagnosis, a
treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). Subchondral collapse (III) is the classic
hip-preservation watershed, but the management decision stays with the orthopedic team.

## Sourcing (spec-v97)

- **Citation:** Steinberg ME, Hayken GD, Steinberg DR. A quantitative system for staging avascular
  necrosis. *J Bone Joint Surg Br.* 1995;77(1):34-41.
- Cross-verified against orthopedic references reproducing the same normal-imaging (0) /
  abnormal-MRI-normal-XR (I) / cystic-sclerotic (II) / subchondral-collapse-crescent (III) / flattening
  (IV) / joint-narrowing (V) / degenerative (VI) sequence, with A/B/C extent quantification for stages I-V.

## Verification

Lint (all catalog-truth surfaces at 1259), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: stage III renders "subchondral collapse ... without flattening," 0 / I / IV / VI flip to their
descriptions; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the stage the clinician selects; it does not read the imaging, compute the A/B/C extent
percentage, or recommend hip-preservation vs arthroplasty. The MCP adapter + golden-probe promotion follow
in a separate wave.
