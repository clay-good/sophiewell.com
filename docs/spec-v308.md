# spec-v308.md — Graduated Return-to-Learn (concussion) tile

> Status: **SHIPPED (2026-07-14).** Builds the `concussion-rtl` tile — the school companion to the
> spec-v298 return-to-sport tile (a student-athlete follows both; RTL had no tile and "return to
> learn" routed only to the sport ladder). Catalog **1159 → 1160**, group G.

## Why

Shipping the return-to-sport (RTS) tile (spec-v298) left its companion — the return-to-learn (RTL)
strategy from the same Amsterdam 2022 paper — unbuilt. A student-athlete completes a full RTL before
unrestricted RTS, so the two are used together.

## What it does

The clinician selects the RTL step (1–4); the tile reports the mental activity, the activity at that
step, and the goal. It reports the consensus strategy descriptor, not a clearance decision
([spec-v11](spec-v11.md) §5.3).

- `lib/concussion-rtl-v308.js` — pure step → (mental activity, activity, goal) lookup with the
  final-step (before-RTS) note. Descriptors are summarised in the tile's own words, not reproduced.
- `views/group-v308.js` (RV308) — a single step `<select>`, real `<label for>`, no innerHTML.
- `lib/meta.js` — citation + accessed date + per-step interpretation bands.
- 6 worked-example unit tests + fuzz registration; synonym entry (v29 → v30); corpus → 1160.

## Sourcing (spec-v97)

The four-step ladder was re-fetched from Table 1 of the primary consensus statement (read directly
from the fetched PDF) and cross-verified against the return-to-sport strategy (Table 2) shipped in
spec-v298.

- **Citation:** Patricios JS, Schneider KJ, Dvorak J, et al. Consensus statement on concussion in
  sport: the 6th International Conference on Concussion in Sport–Amsterdam, October 2022. *Br J Sports
  Med.* 2023;57(11):695-711. doi:10.1136/bjsports-2023-106898. The citation carries no ISSUER_PATTERN
  uppercase acronym (BJSM is a journal), so no citation-staleness ledger row is required.
- **Rule:** progression is symptom-limited — slow down or drop back whenever an activity causes more
  than a mild and brief symptom worsening. A full RTL is completed before unrestricted RTS.

## Verification

Lint (all catalog-truth surfaces at 1160), unit suite (+6 + fuzz), build — all green. Verified in a
real browser: the step select renders the mental activity, the activity, and the goal.

## Out of scope

The parallel return-to-sport ladder is the separate `concussion-rts` tile (spec-v298). The MCP
adapter + golden-probe promotion follow in a separate wave.
