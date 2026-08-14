# spec-v733.md — Chalder Fatigue Scale (CFQ-11)

> Status: **SHIPPED (2026-08-13).** Builds the `chalder-fatigue` tile. Catalog **1563 → 1564**, group G.

## Why

Companion to the new `fss` (spec-v732): the **CFQ-11** is the other widely used fatigue
self-report, adding a distinct **bimodal caseness** scoring method and a physical/mental split.

## What it does

Eleven items (physical: items 1–7, mental: items 8–11), each rated **0–3** relative to
feeling well. Two scoring methods are reported:

- **Likert** — each item 0–1–2–3, summed to **0–33**.
- **Bimodal** — each item mapped 0/1 → 0 and 2/3 → 1, summed to **0–11**.

Higher = more fatigue. A **bimodal total of 4 or more** indicates fatigue "caseness". Only
neutral item-topic labels are used (item wording is copyrighted).

## Posture (spec-v97)

A self-report screen of fatigue to support evaluation, not a diagnosis. Only neutral item
labels are used. It supports rather than replaces the clinical evaluation.

## Files

- `lib/chalder-fatigue-v733.js` — `chalderFatigue()`, `CHALDER_NOTE`.
- `views/group-v733.js` (RV733) — eleven 0–3 selects; a11y-checked, no innerHTML.
- `mcp/adapters/chalder-fatigue-v733.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, items + bands, related (fss, epworth).
- `test/unit/chalder-fatigue.test.js` — 6 tests (max, worked example, bimodal mapping,
  the caseness cut, all-zero, validation).
- `docs/spec-v733.md` (this file).

## Sourcing (spec-v97)

Chalder T, Berelowitz G, Pawlikowska T, et al. Development of a fatigue scale. *J Psychosom
Res.* 1993;37(2):147-153 (PMID 8463991). The 11 items, 7-physical/4-mental split, the Likert
(0–33) and bimodal (0–11) scoring methods, and the bimodal ≥ 4 caseness threshold were
confirmed against the scale-development paper and standard secondary sources; only the scoring
method is implemented, with neutral labels.
