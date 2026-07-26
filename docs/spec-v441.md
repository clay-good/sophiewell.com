# spec-v441.md — Borden classification (dural AV fistula) tile

> Status: **SHIPPED (2026-07-19).** Builds the `borden-davf` tile — the Borden classification of a dural
> arteriovenous fistula, types I/II/III. Catalog **1292 → 1293**, group G.

## Why

The catalog gained the Barrow CCF classification ([spec-v440](spec-v440.md)) but had no Borden grade — the
standard classification of a dural arteriovenous fistula by venous drainage. `borden` / `dural av fistula
type` routed to nothing. This continues the neurovascular cluster.

## What it does

The clinician picks the type; the tile reports the type and its venous-drainage description.

- `lib/borden-davf-v441.js` — pure type → description, the three Borden types by venous drainage. **I:** dural
  sinus / meningeal vein, antegrade flow, no cortical venous drainage (benign). **II:** dural sinus with
  retrograde cortical venous reflux. **III:** cortical venous drainage only (aggressive). The key
  discriminator is cortical venous drainage (II/III). Accepts I-III and 1-3.
- `views/group-v441.js` (RV441) — one select (dom `borden-type`), real `<label for>`.
- `lib/meta.js` — Borden 1995 (J Neurosurg) citation + accessed date + grouped bands. No citation-staleness
  row (the citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v162 → v163); corpus → 1293.

**HIGH-STAKES:** it reports the angiographic type the clinician has determined, never a diagnosis, a treatment
decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); the management decision stays with the neurosurgery /
neurointervention team.

## Sourcing (spec-v97)

- **Citation:** Borden JA, Wu JK, Shucart WA. A proposed classification for spinal and cranial dural
  arteriovenous fistulous malformations and implications for treatment. *J Neurosurg.* 1995;82(2):166-179.
- Cross-verified against neuroradiology / neurosurgery references reproducing the same sinus-antegrade (I) /
  sinus-with-cortical-reflux (II) / cortical-only (III) drainage grouping.

## Verification

Lint (all catalog-truth surfaces at 1293), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: type II renders "retrograde flow into cortical veins," the other types flip to their descriptions;
the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the type the clinician selects; it does not read the angiogram, apply the Cognard subtypes, or
choose therapy. The MCP adapter + golden-probe promotion follow in a separate wave.
