# spec-v675.md — Altman Self-Rating Mania Scale (ASRM)

> Status: **SHIPPED (2026-08-09).** Builds the `asrm-mania` tile. Catalog **1505 → 1506**, group G.

## Why

The catalog ships the clinician-rated Young Mania Rating Scale (`ymrs`) but not a patient self-report screen
for manic/hypomanic symptoms. ASRM is the standard brief self-report companion — quick to complete, used to
screen and to monitor response over time. (Like the built PHQ-9/GAD-7/YMRS, the tile implements the scoring
with generic domain labels and no copyrighted item text.)

## What it does

Five self-rated items, each 0–4, summed to 0–20:

| # | Domain |
| --- | --- |
| 1 | Elevated / positive mood |
| 2 | Increased self-confidence |
| 3 | Decreased need for sleep |
| 4 | Increased speech / talkativeness |
| 5 | Increased activity level |

**≥ 6 = positive screen** (the paper's cut of > 5): high probability of a manic/hypomanic condition
(sensitivity ~85%, specificity ~87% vs a clinician scale). 0–5 = negative.

## Posture (spec-v97)

Self-report, covering the past week. It is a **screen, not a diagnosis** — a positive result warrants clinical
evaluation, not a diagnosis of bipolar disorder or mania. Threshold stated as ≥ 6 (equivalent to the primary
paper's "> 5" for an integer total).

## Files

- `lib/asrm-mania-v675.js` — `asrmMania()`, `ASRM_NOTE`.
- `views/group-v675.js` (RV675) — five 0–4 item selects; a11y-checked, no innerHTML, no network.
- `mcp/adapters/asrm-mania-v675.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, interpretation bands, specialty, related (`ymrs`).
- `test/unit/asrm-mania.test.js` — 5 tests (all-zero negative, sum, exact ≥ 6 threshold, worked 8/20 example,
  input validation).
- `docs/spec-v675.md` (this file).

## Sourcing (spec-v97)

Altman EG, Hedeker D, Peterson JL, Davis JM. The Altman Self-Rating Mania Scale. *Biol Psychiatry.*
1997;42(10):948-955 (PMID 9359982). A source-verification subagent confirmed the five item domains, the 0–4
per-item scale and 0–20 total, and the cut of > 5 (≥ 6) with sensitivity 85.5% / specificity 87.3% against the
clinician-rated CARS-M; no copyrighted item statement text is reproduced (domains only).
