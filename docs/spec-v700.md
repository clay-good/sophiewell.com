# spec-v700.md — MALT-IPI (MALT lymphoma prognostic index)

> Status: **SHIPPED (2026-08-10).** Builds the `malt-ipi` tile. Catalog **1530 → 1531**, group G.

## Why

The catalog had FLIPI / FLIPI-2 (follicular lymphoma) and Ann Arbor staging, but no prognostic
index for **extranodal marginal-zone (MALT) lymphoma**. The MALT-IPI fills that gap. (This is
the 1531st tile — a round-number milestone.)

## What it does

Three factors, one point each (0–3):

| Factor | Points |
| --- | --- |
| Age ≥ 70 years | 1 |
| Ann Arbor stage III or IV | 1 |
| Elevated LDH (above ULN) | 1 |

**Risk groups:** 0 low; 1 intermediate; ≥ 2 high. Approximate 5-year event-free survival:
low ~70%, intermediate ~56%, high ~29%.

## Posture (spec-v97)

A prognostic stratification derived on the IELSG-19 trial, not a treatment decision. It supports
rather than replaces clinical judgment and multidisciplinary care.

## Files

- `lib/malt-ipi-v700.js` — `maltIpi()`, `MALT_IPI_NOTE`.
- `views/group-v700.js` (RV700) — three checkboxes; a11y-checked, no innerHTML.
- `mcp/adapters/malt-ipi-v700.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, factors + groups, related (flipi, flipi-2, ann-arbor).
- `test/unit/malt-ipi.test.js` — 4 tests (0 low, 1 intermediate, 2 high worked example, 3 high).
- `docs/spec-v700.md` (this file).

## Sourcing (spec-v97)

Thieblemont C, Cascione L, Conconi A, et al. A MALT lymphoma prognostic index. *Blood.*
2017;130(12):1409-1417 (PMID 28720586). The three factors, the 0/1/≥2 risk groups, and the
~70/56/29% 5-year EFS figures were confirmed against the original and an independent calculator
reproduction (the original model, not the later revised MALT-IPI).
