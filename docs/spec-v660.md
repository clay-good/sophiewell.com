# spec-v660.md — PASS (Pheochromocytoma of the Adrenal gland Scaled Score)

> Status: **SHIPPED (2026-08-07).** Builds the `pass-pheo` tile. Catalog **1490 → 1491**, group G.

## Why

A companion gap in the adrenal/endocrine pathology vein. The catalog had the GAPP grade (`gapp`) for
pheochromocytoma/paraganglioma and the Weiss system (`weiss-adrenal`) for adrenocortical carcinoma, but not
PASS — the widely-referenced histologic score for the potential for biologically aggressive behavior of adrenal
pheochromocytoma.

## What it does

Twelve histologic features, each present/absent, weighted and summed to **0–20**.

| Points | Features |
| --- | --- |
| 2 each | large nests or diffuse growth; central or confluent tumor necrosis; high cellularity; cellular monotony; tumor cell spindling; mitoses > 3 per 10 HPF; atypical mitotic figures; extension into adipose tissue |
| 1 each | vascular invasion; capsular invasion; profound nuclear pleomorphism; nuclear hyperchromasia |

**PASS ≥ 4** indicates potential for biologically aggressive behavior; **< 4** behaves benignly.

## Posture (spec-v97)

PASS has documented significant interobserver and intraobserver variation (Wu 2009), so the tile frames it as a
risk-stratification aid — a low score is reassuring — rather than a definitive malignancy call, and notes it is
read by the reporting pathologist.

## Files

- `lib/pass-pheo-v660.js` — `passPheo()`, `PASS_FEATURES`, `PASS_NOTE`.
- `views/group-v660.js` (RV660) — 12 feature checkboxes; a11y-checked, no innerHTML, no network.
- `mcp/adapters/pass-pheo-v660.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, interpretation, specialties, related.
- `test/unit/pass-pheo.test.js` — 5 tests (12 features / max 20, empty = 0, weights, cutoff boundary at 4,
  example).
- `docs/spec-v660.md` (this file).

## Sourcing (spec-v97)

Thompson LDR. Pheochromocytoma of the Adrenal gland Scaled Score (PASS) to separate benign from malignant
neoplasms: a clinicopathologic and immunophenotypic study of 100 cases. *Am J Surg Pathol.* 2002;26(5):551-566
(PMID 11979086). A source-verification subagent confirmed all 12 features and their 2-vs-1 point weights, the
0–20 range, and the ≥ 4 cutoff; and surfaced the reproducibility caveat (Wu D, et al. Am J Surg Pathol
2009;33(4):599-608, PMID 19145205) now reflected in the tile's posture.
