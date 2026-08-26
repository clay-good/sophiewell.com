# spec-v787.md — ECG atrial enlargement criteria

> Status: **SHIPPED (2026-08-26).** Builds the `atrial-enlargement` tile. Catalog
> **1578 → 1579**, group G.

## Why

The catalog could grade **ventricular** hypertrophy from the ECG — `lvh-criteria`,
`romhilt-estes` — and had nothing for the **atria**. The P wave is the first thing you read
on a tracing and the last thing the catalog covered.

## What it does

Enter whichever P wave measurements you have; each criterion is judged only from the
measurements supplied.

**Left atrial enlargement** — any one of:

| Criterion | Threshold |
| --- | --- |
| P wave duration, lead II | ≥ 120 ms |
| Notched limb-lead P, inter-peak | ≥ 40 ms |
| V1 terminal negative deflection | ≥ 40 ms long **and** ≥ 1 mm deep |

**Right atrial enlargement** — either:

| Criterion | Threshold |
| --- | --- |
| P amplitude, lead II | > 2.5 mm |
| P amplitude, V1 | > 1.5 mm |

Two things this tile is careful about, both pinned by tests:

- **The thresholds are not symmetric.** Left-sided criteria are *or more*; right-sided are
  *strictly greater*. A P of exactly 2.5 mm in lead II does **not** meet the right criterion,
  while a P of exactly 120 ms in lead II **does** meet the left one.
- **The Morris index needs both halves.** Duration alone or depth alone can neither meet nor
  exclude the terminal-force criterion, so the index is reported only when both were measured.
  The tile does the multiplication: 60 ms × 1.5 mm = **0.09 mm·s**.

**Worked example:** a 130 ms P in lead II with a 2 mm P in V1 → criteria met for **both** left
and right atrial enlargement.

## Posture (spec-v97)

These criteria infer chamber size from the P wave at roughly **50% sensitivity** against about
90% specificity. A normal P wave does not rule enlargement out, and an echocardiogram measures
the chamber this only infers.

## Files

- `lib/atrial-enlargement-v787.js` — `atrialEnlargement()`, `ATRIAL_NOTE`.
- `views/group-v787.js` (RV787) — six optional measurements under two h2 sections; a11y-checked.
- `mcp/adapters/atrial-enlargement-v787.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, both criterion sets, the asymmetry warning, related (lvh-criteria, romhilt-estes, ecg-axis).
- `test/unit/atrial-enlargement.test.js` — 7 tests (normal P, the or-more boundaries, the strictly-greater boundaries, both halves of the terminal force, Morris index reporting, the worked example, invalid input).
- `docs/spec-v787.md` (this file).

## Sourcing (spec-v97)

P terminal force: Morris JJ, Estes EH, Whalen RE, Thompson HK, McIntosh HD. *Circulation.*
1964;29:242-252 (PMID 14118501). Every threshold — 120 ms, 40 ms, 40 ms × 1 mm, 2.5 mm,
1.5 mm — was confirmed against two independent references, which agreed on all five including
the direction of each comparison. That direction is the part most worth checking, and the
sources are explicit: the left-sided criteria read "≥" and the right-sided ones read ">".
