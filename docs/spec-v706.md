# spec-v706.md — Leeds Enthesitis Index (LEI)

> Status: **SHIPPED (2026-08-10).** Builds the `leeds-enthesitis-index` tile. Catalog **1536 → 1537**, group G.

## Why

The catalog had the MASES enthesitis index (13 sites) but not the **Leeds Enthesitis Index** —
a distinct 6-site count developed specifically for psoriatic arthritis. Companion gap.

## What it does

Six sites, each tender (1) or non-tender (0), summed to **0–6**:

- Left and right lateral epicondyle of the humerus
- Left and right medial femoral condyle
- Left and right Achilles tendon insertion

No formal severity bands — a count of involved entheses used to gauge burden and track change.

## Posture (spec-v97)

Assesses only these six sites (unlike broader indices such as MASES) and has no severity
cut-points. It supports rather than replaces the full rheumatologic assessment.

## Files

- `lib/leeds-enthesitis-index-v706.js` — `leedsEnthesitisIndex()`, `LEI_NOTE`.
- `views/group-v706.js` (RV706) — six checkboxes; a11y-checked, no innerHTML.
- `mcp/adapters/leeds-enthesitis-index-v706.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, sites + use note, related (mases-enthesitis, dapsa).
- `test/unit/leeds-enthesitis-index.test.js` — 4 tests (0 none, 6 all, worked example 3, single site).
- `docs/spec-v706.md` (this file).

## Sourcing (spec-v97)

Healy PJ, Helliwell PS. Measuring clinical enthesitis in psoriatic arthritis. *Arthritis Rheum.*
2008;59(5):686-691 (PMID 18438903). The six sites and the 0/1 per-site 0–6 scoring were confirmed
against the original and an independent reproduction, which agree.
