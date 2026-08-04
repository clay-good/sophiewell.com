# spec-v646.md — McCormack Load-Sharing Classification of spine fractures

> Status: **SHIPPED (2026-08-03).** Builds the `mccormack-lsc` tile. Catalog **1476 → 1477**, group G.

## Why

A **companion gap**. The catalog had the TLICS score (`tlics-score`) for the operative-vs-nonoperative
thoracolumbar decision, but not the Load-Sharing Classification, which answers a *different* question: given
that surgery is happening, **will short-segment posterior fixation hold, or does the fracture need anterior
column support?**

## What it does

Three CT/radiographic components, each scored **1–3**, summed to **3–9**.

| Component | 1 | 2 | 3 |
| --- | --- | --- | --- |
| Comminution of the body | ≤ 30% | 30–60% | > 60% |
| Fragment apposition / spread | minimal (< 2 mm) | ≥ 2 mm over ≥ half the surface | wide spread |
| Kyphosis to be corrected | ≤ 3° | 4–9° | ≥ 10° |

**Interpretation (cutoff 6/7):**

- **≤ 6** — short-segment posterior fixation is likely to suffice.
- **≥ 7** — predicts failure (screw breakage, kyphosis) of short-segment instrumentation; anterior column
  support (corpectomy + strut graft) or a longer construct is advised.

## Two notes

1. **The threshold is a 6/7 boundary, verified.** A test asserts 6 (short-segment adequate) versus 7
   (predicts failure) across the exact boundary.
2. **The apposition wording is the primary source's, not the shorthand.** Some calculators reduce the middle
   level to "2 mm"; the original criterion is ≥ 2 mm displacement *over at least half the fracture surface*,
   which the tile carries. The 2 mm pivot itself is consistent across sources.

## Scope (spec-v11 §5.3)

A surgical-planning score, not the operative decision itself. It complements TLICS and the surgeon's
judgment; the tile frames a computed prediction, not an order.

## Files

- `lib/mccormack-v646.js` — `mccormackLsc()`, `MCCORMACK_COMPONENTS`, `MCCORMACK_NOTE`.
- `views/group-v646.js` (RV646) — three 1–3 component selects; a11y-checked, no innerHTML, no network.
- `mcp/adapters/mccormack-v646.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, interpretation, specialties, related.
- `test/unit/mccormack.test.js` — 6 tests (range, example, 6/7 threshold, per-component, required, out-of-range).
- `docs/spec-v646.md` (this file).

## Sourcing (spec-v97)

McCormack T, Karaikovic E, Gaines RW. The load sharing classification of spine fractures. *Spine (Phila Pa
1976).* 1994;19(15):1741-1744 (PMID 7973969). All three component definitions, the 3–9 range, and the 6/7
cutoff were confirmed consistent across the primary paper and multiple spine references (Orthobullets,
Radiopaedia, Scientific Spine, and a 2020 systematic review); the only variation is shorthand wording of the
apposition middle level, resolved to the primary source.
