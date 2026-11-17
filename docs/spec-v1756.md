# spec-v1756 — Out-of-range whole values that were clamped

> Status: **SHIPPED (2026-11-16)**: 10 tools. The catalog stays 2,387.

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

Each is spec-v1755's `wholeFault` widened to `gradeFault` with the item's own range. The same change closes the
last four clamps -- Aldrete, PADSS and PASS (each item 0-2) and the pediatric GCS (eye 1-4, verbal 1-5, motor 1-6) --
which no reader could reach (range sliders on the page, ranges in the adapters) but which still clamped a direct
call. Their four clamp-pinning tests, and two derivation tests that compared the display on out-of-range input, now
expect the refusal and compare on in-range values.

Tests: the West Haven clamp test now expects the refusal; a new Berg case.
