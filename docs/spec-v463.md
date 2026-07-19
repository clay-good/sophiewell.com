# spec-v463.md — Waldenstrom staging (Legg-Calve-Perthes) tile

> Status: **SHIPPED (2026-07-19).** Builds the `waldenstrom-perthes` tile — the Waldenstrom radiographic
> staging of active Legg-Calve-Perthes disease, stages I/II/III/IV. Catalog **1313 → 1314**, group G.

## Why

The Perthes set carried the extent-of-necrosis (Catterall) and residual-outcome (Stulberg) classifications but
had no Waldenstrom stage — the temporal radiographic sequence of the active disease. `waldenstrom` / `perthes
stage` routed to nothing. This completes the Perthes staging set (temporal stage + extent + outcome).

## What it does

The clinician picks the stage; the tile reports the stage and its temporal radiographic description.

- `lib/waldenstrom-perthes-v463.js` — pure stage → description, the four Waldenstrom stages. **I:** initial
  (sclerosis). **II:** fragmentation. **III:** reossification (healing). **IV:** healed (remodeling). Accepts
  I-IV and 1-4.
- `views/group-v463.js` (RV463) — one select (dom `wp-stage`), real `<label for>`.
- `lib/meta.js` — Waldenstrom 1938 (J Bone Joint Surg) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v183 → v184); corpus → 1314.

**HIGH-STAKES:** it reports the radiographic stage the clinician has determined, never a diagnosis, a treatment
decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); the management decision stays with the orthopedic team.

## Sourcing (spec-v97)

- **Citation:** Waldenstrom H. The first stages of coxa plana. *J Bone Joint Surg.* 1938;20:559-566. The
  citation URL is a PubMed term search for the classic paper. (Name rendered ASCII "Waldenstrom".)
- Cross-verified against orthopedic / radiology references reproducing the same initial-sclerosis (I) /
  fragmentation (II) / reossification (III) / healed-remodeling (IV) temporal sequence (the modern four-stage
  synthesis, sometimes labelled with a "reossification" vs "healing" split).

## Verification

Lint (all catalog-truth surfaces at 1314), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: stage II renders "fragmentation of the epiphysis," the other stages flip to their descriptions; the
tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the stage the clinician selects; it does not read the radiograph or recommend management. The
MCP adapter + golden-probe promotion follow in the next wave (288).
