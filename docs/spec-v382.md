# spec-v382.md — Eichenholtz classification (Charcot neuroarthropathy) tile

> Status: **SHIPPED (2026-07-17).** Builds the `eichenholtz-charcot` tile — the (modified) Eichenholtz
> classification of Charcot neuroarthropathy (stages 0-3). Catalog **1233 → 1234**, group G.

## Why

The catalog carries the diabetic-foot **ulcer** grade (Wagner-Meggitt, `wagner-dfu`) but not the
Eichenholtz staging — the standard temporal/radiographic framework that tracks a Charcot joint from the
acute, inflamed, at-risk phase through coalescence to a consolidated, stable deformity. `eichenholtz` /
`charcot foot staging` routed to nothing. This is the ulcer-grade↔Charcot-stage companion within the
diabetic-foot domain.

## What it does

The clinician picks the stage; the tile reports the stage, its temporal/radiographic description, and
whether it is one of the acutely-active (stage 0-1) phases.

- `lib/eichenholtz-charcot-v382.js` — pure stage → description. **0:** prodromal / pre-radiographic
  (warm, swollen; normal radiographs) — flagged (active). **1:** development / fragmentation
  (inflammation + fragmentation, subluxation) — flagged (active). **2:** coalescence (debris absorption,
  sclerosis). **3:** reconstruction / consolidation (remodeling, stable deformity). Accepts 0-3 (and
  roman I-III for 1-3).
- `views/group-v382.js` (RV382) — one select (dom `eich-stage`), real `<label for>`.
- `lib/meta.js` — Eichenholtz 1966 (+ CORR 2015 modified review) citation + accessed date + grouped
  bands. No citation-staleness row (the citation carries no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v103 → v104); corpus → 1234.

**HIGH-STAKES:** it reports the Eichenholtz stage the clinician has determined, never a diagnosis, a
treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). The active-vs-quiescent grouping is
the classically taught pattern, not an order; the management (offloading / immobilization /
reconstruction) decision stays with the treating team (surfaced in the tile note).

## Sourcing (spec-v97)

- **Citation:** Eichenholtz SN. *Charcot Joints.* Springfield, IL: Charles C. Thomas; 1966 (stages 1-3).
  Modified staging (incl. the pre-radiographic Stage 0): Rosenbaum AJ, DiPreta JA. Classifications in
  Brief: Eichenholtz classification of Charcot arthropathy. *Clin Orthop Relat Res.*
  2015;473(3):1168-1171.
- Cross-verified against podiatric / orthopedic references reproducing the same
  development → coalescence → reconstruction staging and the added Stage 0.

## Verification

Lint (all catalog-truth surfaces at 1234), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: stage 1 renders the flagged "development / fragmentation" description, stage 3 flips to the
stable "reconstruction / consolidation" description, and the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the stage the clinician selects; it does not read imaging, localize the Charcot joint
(the Brodsky anatomic pattern is a separate axis), or recommend offloading. The MCP adapter + golden-probe
promotion follow in a separate wave.
