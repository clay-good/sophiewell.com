# spec-v691.md — POSAS Observer Scale (scar assessment)

> Status: **SHIPPED (2026-08-10).** Builds the `posas-observer-scar` tile. Catalog **1521 → 1522**, group G.

## Why

The catalog had the Vancouver Scar Scale but not the **POSAS**, its modern companion and the
current standard for standardized scar assessment. This ships the **Observer** (clinician)
component. Companion gap.

## What it does

The observer rates six scar characteristics, each **1** (like normal skin) to **10** (worst scar
imaginable):

- vascularity, pigmentation, thickness, relief (surface roughness), pliability, surface area.

The total is the **sum of the six items, range 6–60** (6 = normal skin, higher = worse). A
separate **overall opinion (1–10)** is recorded but is **not** part of the six-item total.

There are no fixed severity cut-points — the scale describes a scar and is most useful for
tracking change over time, paired with the patient-rated component.

## Posture (spec-v97)

A descriptive measurement scale, not a verdict. It supports rather than replaces clinical
judgment. Only the neutral characteristic names are used; no copyrighted anchor wording is
reproduced.

## Files

- `lib/posas-observer-scar-v691.js` — `posasObserverScar()`, `POSAS_NOTE`.
- `views/group-v691.js` (RV691) — six 1–10 number inputs + an optional overall-opinion input.
- `mcp/adapters/posas-observer-scar-v691.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, items + use note, related (vancouver-scar-scale,
  glogau-photoaging).
- `test/unit/posas-observer-scar.test.js` — 5 tests (normal-skin 6, worst 60, worked example 27,
  overall-opinion-not-in-total invariance, validation).
- `docs/spec-v691.md` (this file).

## Sourcing (spec-v97)

Draaijers LJ, Tempelman FR, Botman YA, et al. The Patient and Observer Scar Assessment Scale: a
reliable and feasible tool for scar evaluation. *Plast Reconstr Surg.* 2004;113(7):1960-1965
(PMID 15253184). The six-item 1–10 structure, the 6–60 total, and the separate (excluded)
overall opinion were confirmed across the original and a reliability-study reproduction; only the
computation (public) is implemented, not the proprietary anchor descriptors.
