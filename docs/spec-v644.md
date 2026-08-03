# spec-v644.md — SLUMS (St. Louis University Mental Status) examination

> Status: **SHIPPED (2026-08-03).** Builds the `slums` tile. Catalog **1474 → 1475**, group G.

## Why

A gap in scored cognitive screening. The catalog had a brief screen (`mini-cog`) and dementia-staging tools
(`cdr-sob`, `fast-dementia`, `global-deterioration-scale`) but no scored MMSE-style examination — the MMSE
itself is copyrighted (PAR, Inc.) and MoCA requires training/permission. **SLUMS** was built by Saint Louis
University with the VA specifically as a *free* MMSE alternative and may be reproduced without a license,
which is exactly what makes it the right one to add.

## What it does

Ten scored items sum to **0–30** (the five-object registration is setup, not scored). The interpretation
bands are **education-adjusted** — the cut points are one band higher for patients with less than a
high-school education.

| Item | Max | Item | Max |
| --- | --: | --- | --: |
| Day of week | 1 | Delayed recall (5 objects) | 5 |
| Year | 1 | Backward digit span | 2 |
| State | 1 | Clock drawing | 4 |
| Money problem | 3 | Figure task | 2 |
| Animal naming (1 min) | 3 | Story recall (4 × 2) | 8 |

| Education | Normal | Mild neurocognitive disorder | Dementia |
| --- | --- | --- | --- |
| High-school or above | 27–30 | 21–26 | ≤ 20 |
| Less than high-school | 25–30 | 20–24 | ≤ 19 |

## Two implementation decisions

1. **Education changes the answer, so it is required.** A score of **20** is *dementia* for a high-school-
   educated patient but *mild neurocognitive disorder* for one with less than high school. A test asserts both
   readings of the same total.
2. **The tile scores, it does not reproduce the test.** It takes the earned points per item (the clinician
   administers and scores the actual SLUMS form); the item topics are factual labels. Absent item inputs count
   as 0 points.

## Scope (spec-v11 §5.3)

A **screen**, not a diagnosis; a positive screen calls for fuller assessment, and the result is read alongside
history, function, and reversible contributors. The clinical decision stays with the clinician.

## Files

- `lib/slums-v644.js` — `slums()`, `SLUMS_ITEMS`, `SLUMS_NOTE`.
- `views/group-v644.js` (RV644) — an education select plus ten 0–max point inputs; a11y-checked, no innerHTML.
- `mcp/adapters/slums-v644.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, interpretation, specialties, related.
- `test/unit/slums.test.js` — 7 tests (sum to 30, example, education-adjusted 20, boundary, required education,
  out-of-range, absent-as-0).
- `docs/spec-v644.md` (this file).

## Sourcing (spec-v97)

Tariq SH, Tumosa N, Chibnall JT, Perry MH 3rd, Morley JE. The Saint Louis University Mental Status (SLUMS)
examination … *Am J Geriatr Psychiatry.* 2006;14(11):900-910 (PMID 17068312). Every per-item point value was
read off the official SLU/VAMC form (the items sum to 30), and both education-adjusted band sets were confirmed
identical across the official form and multiple clinical references. SLUMS is freely available for clinical use.
