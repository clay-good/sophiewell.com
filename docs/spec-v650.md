# spec-v650.md — Masaoka-Koga staging of thymoma

> Status: **SHIPPED (2026-08-04).** Builds the `masaoka-koga` tile. Catalog **1480 → 1481**, group G.

## Why

A gap in thymic-tumor staging. The catalog had other oncologic staging systems (Bismuth-Corlette, Enneking,
melanoma, myeloma), but not the Masaoka-Koga system — the standard staging for thymic epithelial tumors
(thymoma), and the language of the thymoma literature.

## What it does

A **decision-logic classifier**: the most advanced invasion/spread finding sets the stage.

| Stage | Finding |
| --- | --- |
| I | Completely encapsulated (invasion *into but not through* the capsule is still I) |
| IIa | Microscopic transcapsular invasion |
| IIb | Macroscopic invasion into fat, or gross adherence to (not through) pleura/pericardium |
| III | Macroscopic invasion into a neighboring organ (pericardium, great vessel, lung) |
| IVa | Pleural or pericardial dissemination (separate implant nodules) |
| IVb | Lymphogenous or hematogenous (nodal/distant) metastasis |

Nothing checked is Stage I. When several findings are present, the highest applies — a test asserts that
microscopic invasion + organ invasion + metastasis yields IVb.

## Two source-verification points

1. **Standard = Masaoka-*Koga*, ITMIG-clarified.** The 1981 Masaoka is the original; the Koga (1994)
   modification, with terms clarified by the ITMIG consensus (Detterbeck 2011, from ITMIG Table 2), is the
   commonly used version and the one implemented.
2. **Stage III is NOT subdivided.** A IIIA/IIIB split by great-vessel involvement appears in some secondary
   references but is not part of the consensus definition, so the tile keeps Stage III as a single category.

## Scope (spec-v11 §5.3)

A pathologic staging applied to a resected specimen, read with the full pathology report and WHO histologic
type. The staging and treatment decisions stay with the pathologist and multidisciplinary team.

## Files

- `lib/masaoka-v650.js` — `masaokaKoga()`, `MASAOKA_NOTE`.
- `views/group-v650.js` (RV650) — five invasion/spread checkboxes; a11y-checked, no innerHTML, no network.
- `mcp/adapters/masaoka-v650.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, interpretation, specialties, related.
- `test/unit/masaoka.test.js` — 5 tests (Stage I default, each finding, most-advanced-wins, abnormal flag, code).
- `docs/spec-v650.md` (this file).

## Sourcing (spec-v97)

Koga K, Matsuno Y, Noguchi M, et al. A review of 79 thymomas: modification of staging system... *Pathol Int.*
1994;44(5):359-367 (PMID 8044305); terms clarified by Detterbeck FC, et al. The Masaoka-Koga stage
classification for thymic malignancies: clarification and definition of terms. *J Thorac Oncol.* 2011;6(7 Suppl
3):S1710-S1716 (PMID 21847052). The six stage definitions were transcribed from the ITMIG table (via the ICCR
thymic-staging dataset) and confirmed consistent across authoritative sources; the only inconsistency (a
non-standard IIIA/IIIB split) was excluded.
