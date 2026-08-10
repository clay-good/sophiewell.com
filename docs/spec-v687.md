# spec-v687.md — Elemental iron ingested (toxic-dose estimator)

> Status: **SHIPPED (2026-08-09).** Builds the `elemental-iron-ingested` tile. Catalog **1517 → 1518**, group G.

## Why

Iron overdose is triaged on **elemental** iron in mg/kg, but reported ingestions are in salt
tablets, and iron salts differ widely in elemental content — the conversion is the step people
most often get wrong. The catalog had IV-iron repletion (Ganzoni) but no ingestion/overdose
estimator. Whole-concept gap.

## What it does

```
elemental iron (mg) = tablets × mg iron salt per tablet × (percent elemental / 100)
dose (mg/kg)        = elemental iron (mg) / body weight (kg)
```

Elemental content: ferrous sulfate 20%, ferrous gluconate 12%, ferrous fumarate 33% (plus an
"elemental" option that treats the entered mg as already elemental).

| Dose (mg/kg elemental) | Toxicity |
| --- | --- |
| < 20 | minimal / nontoxic |
| 20–60 | mild to moderate |
| > 60 | severe / potentially serious |
| > 150 | potentially lethal |

## Posture (spec-v97)

An **advisory triage estimate** from a reported (often uncertain) amount. It does not replace
Poison Control or a measured serum iron level, and a reassuring estimate never rules out a
serious ingestion.

## Files

- `lib/elemental-iron-ingested-v687.js` — `elementalIronIngested()`, `IRON_NOTE`.
- `views/group-v687.js` (RV687) — three number inputs + a salt-type select; a11y-checked.
- `mcp/adapters/elemental-iron-ingested-v687.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, formula + thresholds bands, related (iron-ganzoni, anion-gap).
- `test/unit/elemental-iron-ingested.test.js` — 4 tests (worked example 1300 mg / 65 mg/kg, salt
  fractions, toxicity bands, validation).
- `docs/spec-v687.md` (this file).

## Note on numbering

Authored concurrently with spec-v686 (`ucsf-hcc`, another session), which claimed v686 first;
this tile was renumbered to v687 during rebase.

## Sourcing (spec-v97)

Elemental-content percentages and the mg/kg toxicity thresholds are per the Merck Manual
Professional (Iron Poisoning) and StatPearls Iron Toxicity (NBK459224), which agree exactly
(< 20 nontoxic, 20–60 mild-moderate, > 60 severe, > 150 potentially lethal; sulfate 20% /
gluconate 12% / fumarate 33% elemental).
