# spec-v298.md — Graduated Return-to-Sport (concussion) tile

> Status: **SHIPPED (2026-07-13).** Builds the `concussion-rts` tile — a catalog gap the
> [spec-v293](spec-v293.md) search sweep noted ("concussion return-to-play"). Catalog **1149 → 1150**,
> group G.

## Why

The v14 synonym sweep listed "concussion return-to-play" among the genuine catalog gaps (no tile
existed). The graduated return-to-sport strategy is the bedside ladder a sports-medicine, neurology,
or emergency clinician follows to bring an athlete back after a sport-related concussion.

## What it does

The clinician selects the return-to-sport step (1–6); the tile reports the exercise strategy, the
activity at that step, the goal, and the consensus progression gates — that Steps 4–6 begin only
after full resolution of symptoms (including with and after exertion), and that a written HCP
determination of readiness is required before unrestricted return to sport. It reports the consensus
strategy descriptor, not a clearance decision ([spec-v11](spec-v11.md) §5.3).

- `lib/concussion-rts-v298.js` — pure step→(strategy, activity, goal) lookup with the
  symptom-resolution (Steps 4–6) and HCP-clearance (Steps 5–6) gate flags.
- `views/group-v298.js` (RV298) — a single step `<select>`, real `<label for>`, no innerHTML.
- `lib/meta.js` — citation + accessed date + per-step interpretation bands.
- 7 worked-example unit tests + fuzz registration; synonym entry (v18 → v19); corpus → 1150.

## Sourcing (spec-v97)

The six-step ladder was transcribed verbatim from Table 2 of the primary consensus statement (read
directly from the fetched PDF, never recalled) and cross-verified against independent reproductions
(Cleveland Clinic; Parachute/Coach.ca return-to-sport-strategy handouts) that agree on the six steps
and the ≥24 h-per-step / drop-back-if-symptoms rule.

- **Citation:** Patricios JS, Schneider KJ, Dvorak J, et al. Consensus statement on concussion in
  sport: the 6th International Conference on Concussion in Sport–Amsterdam, October 2022. *Br J
  Sports Med.* 2023;57(11):695-711. doi:10.1136/bjsports-2023-106898. The citation carries no
  ISSUER_PATTERN uppercase acronym (BJSM is a journal, not a listed issuer), so no
  citation-staleness ledger row is required.
- **Progression rule:** each step typically takes a minimum of 24 h; the full strategy takes at
  least ~1 week and typical unrestricted RTS up to ~1 month. Symptom exacerbation (>2 points on a
  0–10 scale) during Steps 1–3 → stop and retry the next day; during Steps 4–6 → return to Step 3.

## Verification

Lint (all catalog-truth surfaces at 1150), unit suite (+7 + fuzz), build — all green. Verified in a
real browser: the step select renders the strategy, activity, goal, and the resolution/clearance
gate warning.

## Out of scope

The Amsterdam 2022 2A/2B light-vs-moderate sub-split is surfaced inside the Step 2 label rather than
as separate selectable steps (the strategy is a six-step ladder). The MCP adapter + golden-probe
promotion follow in a separate wave.
