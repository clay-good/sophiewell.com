# spec-v654.md — Peritoneal Cancer Index (Jacquet-Sugarbaker)

> Status: **SHIPPED (2026-08-07).** Builds the `peritoneal-cancer-index` tile. Catalog **1484 → 1485**, group G.

## Why

A gap in peritoneal surface oncology. The catalog had oncologic staging systems (Enneking, Gleason, the new
grading cluster) but not the Peritoneal Cancer Index — the standard quantitative measure of peritoneal tumor
burden used to plan cytoreductive surgery (CRS) and HIPEC.

## What it does

Thirteen abdominopelvic regions, each scored **0–3** by lesion size, summed to **0–39**.

| Region group | Regions |
| --- | --- |
| Nine abdominopelvic (two transverse + two sagittal planes) | 0 Central, 1 Right upper, 2 Epigastrium, 3 Left upper, 4 Left flank, 5 Left lower, 6 Pelvis, 7 Right lower, 8 Right flank |
| Four small-bowel | 9 Upper jejunum, 10 Lower jejunum, 11 Upper ileum, 12 Lower ileum |

| Lesion size score | Meaning |
| --- | --- |
| 0 | no tumor |
| 1 | tumor up to 0.5 cm |
| 2 | tumor up to 5.0 cm |
| 3 | tumor > 5.0 cm **or confluence of tumor** |

Each region defaults to LS-0 (no tumor), so only involved regions need be entered. Confluent tumor scores
LS-3 regardless of measured size.

## Posture (spec-v97)

Selection thresholds for CRS/HIPEC candidacy (e.g. a colorectal cutoff near 20, lower for gastric, no strict
ceiling for pseudomyxoma peritonei) are **tumor-type specific and center-dependent**, and candidacy also
depends on the completeness-of-cytoreduction score and tumor biology. The tile reports the total as the primary
output and names cutoffs as advisory rather than asserting a verdict.

## Files

- `lib/peritoneal-cancer-index-v654.js` — `peritonealCancerIndex()`, `PCI_REGIONS`, `PCI_NOTE`.
- `views/group-v654.js` (RV654) — 13 region selects (each 0–3, defaulting to 0); a11y-checked, no innerHTML,
  no network.
- `mcp/adapters/peritoneal-cancer-index-v654.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, interpretation, specialties, related.
- `test/unit/peritoneal-cancer-index.test.js` — 7 tests (13 regions, range 0–39, default-to-0, region sum,
  abnormal threshold, example, out-of-range).
- `docs/spec-v654.md` (this file).

## Sourcing (spec-v97)

Jacquet P, Sugarbaker PH. Clinical research methodologies in diagnosis and staging of patients with peritoneal
carcinomatosis. *Cancer Treat Res.* 1996;82:359-374 (PMID 8849962). A source-verification subagent confirmed
the 13 regions and their grouping, the lesion-size scoring (including confluence → LS-3), the 0–39 range, and
that prognostic cutoffs are tumor-type specific and advisory rather than part of the index definition.
