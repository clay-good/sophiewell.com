# spec-v403.md — Berndt-Harty classification (osteochondral lesion of the talus) tile

> Status: **SHIPPED (2026-07-17).** Builds the `berndt-harty` tile — the Berndt-Harty classification of an
> osteochondral lesion of the talus (stages I/II/III/IV). Catalog **1254 → 1255**, group G.

## Why

The ankle/foot orthopedic cluster (Danis-Weber, Lauge-Hansen) had no tile for the osteochondral lesion of
the talus a surgeon stages from imaging. The Berndt-Harty radiographic staging is the classic. `berndt
harty` / `osteochondral lesion of the talus` / `talus OCD stage` routed to nothing.

## What it does

The clinician picks the stage; the tile reports the stage and its radiographic description.

- `lib/berndt-harty-v403.js` — pure stage → description. **I:** subchondral compression, cartilage intact.
  **II:** partial detachment. **III:** complete detachment, non-displaced (in situ). **IV:** displaced
  fragment / loose body. Accepts I/II/III/IV and 1-4.
- `views/group-v403.js` (RV403) — one select (dom `bh-stage`), real `<label for>`.
- `lib/meta.js` — Berndt-Harty 1959 (J Bone Joint Surg Am) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v124 → v125); corpus → 1255.

**HIGH-STAKES:** it reports the radiographic stage the clinician has determined, never a diagnosis, a
treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). The stage informs whether the fragment
is stable or displaced, but the management decision stays with the orthopedic / foot-and-ankle team.

## Sourcing (spec-v97)

- **Citation:** Berndt AL, Harty M. Transchondral fractures (osteochondritis dissecans) of the talus. *J
  Bone Joint Surg Am.* 1959;41-A:988-1020.
- Cross-verified against orthopedic / radiology references reproducing the same subchondral-compression (I)
  / partial-detachment (II) / detached-non-displaced (III) / displaced (IV) staging.

## Verification

Lint (all catalog-truth surfaces at 1255), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: stage III renders "completely detached ... without displacement," I / II / IV flip to their
radiographic descriptions; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the stage the clinician selects; it does not read the imaging, apply the MRI (Hepple /
Anderson) staging variants, or recommend fixation. The MCP adapter + golden-probe promotion follow in a
separate wave.
