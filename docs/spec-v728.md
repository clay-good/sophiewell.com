# spec-v728.md — HHIE-S (Hearing Handicap Inventory for the Elderly, Screening)

> Status: **SHIPPED (2026-08-13).** Builds the `hhie-s` tile. Catalog **1558 → 1559**, group G.

## Why

The catalog had audiometric tools (visual-acuity converter, Ménière staging) but not the
**HHIE-S**, the standard brief screen for self-perceived hearing handicap in older adults.
Audiology gap.

## What it does

10 items, each **No (0) / Sometimes (2) / Yes (4)**, summed to **0–40** (all totals even). Only
neutral item-topic labels are used; item wording is copyrighted.

| Total | Band |
| --- | --- |
| 0–8 | no self-perceived handicap (~13% impairment) |
| 10–24 | mild-to-moderate handicap (~50%) |
| 26–40 | significant handicap (~84%) |

A score **> 8** is commonly screen-positive and prompts audiologic referral.

## Posture (spec-v97)

Screens self-perceived handicap; it is not an audiogram or a diagnosis. It supports rather than
replaces formal hearing assessment. Only neutral item labels are used.

## Files

- `lib/hhie-s-v728.js` — `hhieS()`, `HHIE_S_NOTE`.
- `views/group-v728.js` (RV728) — ten No/Sometimes/Yes selects; a11y-checked.
- `mcp/adapters/hhie-s-v728.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, items + bands, related (meniere-aao-hns, dhi).
- `test/unit/hhie-s.test.js` — 5 tests (all-No 0, all-Yes 40, worked example 16, bands + the > 8
  screen-positive cut, validation).
- `docs/spec-v728.md` (this file).

## Sourcing (spec-v97)

Ventry IM, Weinstein BE. Identification of elderly people with hearing problems. *ASHA.*
1983;25(7):37-42. The 10-item No/Sometimes/Yes = 0/2/4 scoring, the 0–40 range, and the
0–8 / 10–24 / 26–40 bands (with the > 8 screen-positive cut) were confirmed against the HHIE-S
protocol and a UT Health validation reference; only the scoring method is implemented, with
neutral labels.
