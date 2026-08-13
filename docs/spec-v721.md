# spec-v721.md — Plaque Control Record (O'Leary index)

> Status: **SHIPPED (2026-08-13).** Builds the `plaque-control-record` tile. Catalog **1551 → 1552**, group G.

## Why

Dentistry vein. The O'Leary Plaque Control Record is the standard measure of a patient's
oral-hygiene performance — a clean percentage. The tile slug/name are apostrophe-free
(`plaque-control-record` / "Plaque Control Record") per the tile-naming rule; O'Leary appears in
the citation and note.

## What it does

```
Plaque Control Record (%) = (plaque-positive surfaces / total surfaces) × 100
  total surfaces = 4 (mesial, distal, buccal, lingual) × teeth present
```

**Goal ≤ 10%** = good plaque control; higher indicates a need to improve oral hygiene (some
references use a 20% target).

## Posture (spec-v97)

Measures oral-hygiene performance over time; it does not diagnose periodontal disease. It supports
rather than replaces the clinical dental and periodontal examination.

## Files

- `lib/plaque-control-record-v721.js` — `plaqueControlRecord()`, `PLAQUE_CONTROL_NOTE`.
- `views/group-v721.js` (RV721) — two count inputs (teeth present, plaque-positive surfaces).
- `mcp/adapters/plaque-control-record-v721.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, formula + goal, related (bewe, dmft-caries).
- `test/unit/plaque-control-record.test.js` — 5 tests (worked example 17.9%, formula, the 10%
  goal boundary, plaque-free, validation incl. positive > 4×teeth).
- `docs/spec-v721.md` (this file).

## Sourcing (spec-v97)

O'Leary TJ, Drake RB, Naylor JE. The plaque control record. *J Periodontol.* 1972;43(1):38 (PMID
4500182). The formula (plaque-positive surfaces / [4 × teeth] × 100) and the ≤ 10% good-control
target were confirmed across periodontology references; the 20% alternative target is noted.
