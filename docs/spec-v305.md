# spec-v305.md — Cytokine release syndrome grade (ASTCT) tile

> Status: **SHIPPED (2026-07-14).** Builds the `crs-grade` tile — a catalog gap surfaced by the
> SESSION-40 third fresh-domain search sweep ("car t cytokine release grade" had no tile). Catalog
> **1156 → 1157**, group G.

## Why

The third sweep found "car t cytokine release grade" routed only to unrelated tiles — no CRS-grading
tile existed. The ASTCT consensus grade is the standard bedside tool a hematology / oncology /
critical-care team uses on a cellular-therapy unit to grade CRS after CAR-T and other
immune-effector-cell therapies.

## What it does

The clinician marks the fever and picks the hypotension and hypoxia levels; the tile reports the
ASTCT CRS grade (1–4) as the more severe of the hypotension-driven and hypoxia-driven grades, and
flags grades ≥3 as severe. It reports the ASTCT grade, not a treatment order ([spec-v11](spec-v11.md)
§5.3).

- `lib/crs-v305.js` — pure fever / hypotension / hypoxia → grade (the max of the two organ axes; 0 if
  no fever/hypotension/hypoxia).
- `views/group-v305.js` (RV305) — a fever checkbox + hypotension and hypoxia `<select>`s, real
  `<label for>`, no innerHTML.
- `lib/meta.js` — citation + accessed date + per-grade interpretation bands.
- 8 worked-example unit tests + fuzz registration; synonym entry (v26 → v27); corpus → 1157.

## Sourcing (spec-v97)

The four grades, the oxygen thresholds (low-flow ≤6 L/min vs high-flow >6 L/min / mask vs positive
pressure) and the vasopressor counts were re-fetched and cross-verified at build against two
independent sources that agree:

- **Citation:** Lee DW, Santomasso BD, Locke FL, et al. ASTCT consensus grading for cytokine release
  syndrome and neurologic toxicity associated with immune effector cells. *Biol Blood Marrow
  Transplant.* 2019;25(4):625-638. doi:10.1016/j.bbmt.2018.12.758. Cross-checked against the NCBI/PDQ
  reproduction of the ASTCT CRS grading table. The citation carries no ISSUER_PATTERN uppercase
  acronym, so no citation-staleness ledger row is required.
- **Rule:** fever ≥38°C is the entry criterion; the grade is the more severe of the hypotension and
  hypoxia axes.

## Verification

Lint (all catalog-truth surfaces at 1157), unit suite (+8 + fuzz), build — all green. Verified in a
real browser: marking fever and picking a hypotension/hypoxia level renders the ASTCT grade and the
severe flag.

## Out of scope

The companion ICANS neurotoxicity grading (ICE score + the ASTCT ICANS table) is a separate
instrument and out of scope here (this tile is the CRS grade). The MCP adapter + golden-probe
promotion follow in a separate wave.
