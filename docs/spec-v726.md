# spec-v726.md — Insomnia Severity Index (ISI)

> Status: **SHIPPED (2026-08-13).** Builds the `isi` tile. Catalog **1556 → 1557**, group G.

## Why

The catalog had daytime-sleepiness and OSA tools but not the **ISI**, the standard brief
self-report of insomnia severity and treatment response. Gap in sleep-related scales.

## What it does

Seven items each rated **0–4**, summed to **0–28** (neutral item labels only; item/response
wording is copyrighted):

- difficulty falling asleep · staying asleep · waking too early · dissatisfaction with sleep ·
  how noticeable to others · worry/distress · interference with functioning.

| Total | Band |
| --- | --- |
| 0–7 | no clinically significant insomnia |
| 8–14 | subthreshold insomnia |
| 15–21 | moderate insomnia |
| 22–28 | severe insomnia |

A score **≥ 15** correlates with a clinical insomnia diagnosis.

## Posture (spec-v97)

Grades severity and tracks response to treatment; it is not a stand-alone diagnosis. It supports
rather than replaces clinical assessment. Only neutral item labels are used.

## Files

- `lib/isi-v726.js` — `isi()`, `ISI_NOTE`.
- `views/group-v726.js` (RV726) — seven 0–4 selects; a11y-checked, no innerHTML.
- `mcp/adapters/isi-v726.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, items + bands, related (phq9, gad7).
- `test/unit/isi.test.js` — 6 tests (all-zero, max 28, worked example 16, bands, the 15 cut,
  validation).
- `docs/spec-v726.md` (this file).

## Sourcing (spec-v97)

Bastien CH, Vallières A, Morin CM. Validation of the Insomnia Severity Index. *Sleep Med.*
2001;2(4):297-307 (PMID 11438246). The seven items, 0–4 scoring, 0–28 total, and the
none/subthreshold/moderate/severe bands (with the ≥ 15 clinical cut) were confirmed against a
UPenn CBT-I reference and a ScienceDirect overview, which agree; only the scoring method is
implemented, with neutral labels.
