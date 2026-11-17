# spec-v1756 — Out-of-range whole values that were clamped

> Status: **SHIPPED (2026-11-16)**: 6 tools. The catalog stays 2,387.

spec-v1755 refused fractions and, where a function clamped an out-of-range WHOLE value and a test pinned it, left
the clamp alone. Six of those tools declare no range in their agent adapter, so agents and the page could reach the
clamp:

| Tool | Before | Range now |
|---|---|---|
| `berg-balance` | a task score of 99 or -1 clamped and read "Walking independently" | 0-4 per task |
| `west-haven-he` | grade 9 read as grade 4; grade -1 as grade 0, "minimal" | 0-4 |
| `poem` | an item of 99 or -1 counted as 0 | 0-4 per item |
| `atlas-cdi` | a points item of 99 or -1 counted as 0 | 0-2 per item |
| `aast-organ-injury` | a finding grade of 99 clamped to grade V | 0-5 |
| `mangled-extremity` | a shock or age grade of 99 or -1 scored | 0-2 each (skeletal and ischemia already refused) |

Each is spec-v1755's `wholeFault` widened to `gradeFault` with the item's own range. Aldrete, PADSS, PASS and the
pediatric GCS keep their clamps: their adapters declare the range and the page uses range sliders, so no reader
reaches it.

Tests: the West Haven clamp test now expects the refusal; a new Berg case.
