# spec-v648.md — Weiss system for adrenocortical carcinoma

> Status: **SHIPPED (2026-08-03).** Builds the `weiss-adrenal` tile. Catalog **1478 → 1479**, group G.

## Why

A gap in adrenal pathology. The catalog had adrenal *imaging* (`adrenal-ct-washout`) and pheochromocytoma
grading (`gapp`), but not the Weiss system — the standard histopathologic criteria that separate a malignant
adrenocortical carcinoma from a benign adenoma.

## What it does

Nine histopathologic criteria, each present = **1 point** (0–9). A total of **≥ 3 indicates adrenocortical
carcinoma** (malignant); 0–2 indicates a benign adenoma.

| # | Criterion | # | Criterion |
| --- | --- | --- | --- |
| 1 | High nuclear grade (Fuhrman III–IV) | 6 | Necrosis |
| 2 | Mitotic rate > 5 / 50 HPF | 7 | Venous invasion |
| 3 | Atypical mitoses | 8 | Sinusoidal invasion |
| 4 | Clear cells ≤ 25% of tumor | 9 | Capsular invasion |
| 5 | Diffuse architecture > 33% | | |

## Two definitions this tile is careful to get right

1. **The threshold is ≥ 3, not ≥ 4.** The original 1984 Weiss paper used ≥ 4; the 1989 modification (Weiss,
   Medeiros, Vickery) lowered it to **≥ 3**, which is the WHO-adopted modern cutoff. Older/secondary sources
   still occasionally cite 4 — the tile uses 3.
2. **The clear-cell criterion is present when clear cells are ≤ 25%, not ≥ 25%.** At least one widely-mirrored
   pathology wiki inverts this. The criterion scores when the tumor is *predominantly eosinophilic/compact*
   (clear, lipid-rich cells make up a quarter or less). And the mitotic criterion is *strictly* > 5 / 50 HPF —
   exactly 5 does not score.

The Aubert "modified Weiss" (a reproducibility-driven weighted variant that drops four criteria) is a distinct
index and is not implemented here.

## Scope (spec-v11 §5.3)

A pathologist's diagnostic aid applied to a resected specimen, not a substitute for full pathologic review,
immunohistochemistry, or clinical correlation. The diagnosis stays with the pathologist and team.

## Files

- `lib/weiss-v648.js` — `weissAdrenal()`, `WEISS_CRITERIA`, `WEISS_NOTE`.
- `views/group-v648.js` (RV648) — nine histopathologic checkboxes; a11y-checked, no innerHTML, no network.
- `mcp/adapters/weiss-v648.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, interpretation, specialties, related.
- `test/unit/weiss.test.js` — 5 tests (nine criteria / max 9, ≥ 3 threshold, example, empty, per-criterion).
- `docs/spec-v648.md` (this file).

## Sourcing (spec-v97)

Weiss LM, Medeiros LJ, Vickery AL Jr. Pathologic features of prognostic significance in adrenocortical
carcinoma. *Am J Surg Pathol.* 1989;13(3):202-206 (PMID 2646997; modified, ≥ 3 cutoff). Original: Weiss LM.
*Am J Surg Pathol.* 1984;8(3):163-169 (PMID 6703192). The nine criteria, the point rule, and the ≥ 3 threshold
were confirmed consistent across the primary papers, PathologyOutlines, the WHO-aligned 2023 review, and MDCalc;
the clear-cell wording and the 1984-vs-1989 threshold were the two flagged hazards, resolved to the primary
source.
