# spec-v797.md — WHO 2022 grade (neuroendocrine neoplasms)

> Status: **SHIPPED (2026-08-26).** Builds the `nen-who-grade` tile. Catalog **1588 → 1589**,
> group G.

## Why

The catalog graded prostate (`gleason-grade-group`), renal (`who-isup-renal-grade`), breast
(`nottingham-grade`), adrenal (`weiss-adrenal`) and thyroid cytology (`bethesda-thyroid`).
**Neuroendocrine neoplasms were missing** — and they are the one where the grading rule is
genuinely easy to get wrong.

## What it does

Grade comes from **two** proliferation indices, and **the higher of the two wins**:

| Grade | Mitoses per 2 mm² | Ki-67 index |
| --- | --- | --- |
| G1 | under 2 **and** | under 3% |
| G2 | 2–20 **or** | 3–20% |
| G3 | over 20 **or** | over 20% |

**A Ki-67 of 25% with a single mitosis is still G3.** That is the rule people miss when they
read only one of the two numbers off a report, and the tile says explicitly *which* index
drove the grade up. Tests pin it in both directions, plus every boundary — 2.9 vs 3, 20 vs
20.1 on Ki-67; 1 vs 2, 20 vs 21 on mitoses. Exactly 20 stays G2 on both.

**Differentiation is a separate axis** and decides the *entity*, not the grade:

- **well differentiated** → neuroendocrine **tumor** (NET), graded G1/G2/G3
- **poorly differentiated** → neuroendocrine **carcinoma** (NEC), high grade by definition

NEC is deliberately **not** graded by these thresholds; it is typed small-cell or large-cell
on morphology. The tile returns `grade: null` for NEC and says so on screen, rather than
inventing a G-number for it.

**Worked example:** well differentiated, Ki-67 25%, 1 mitosis → **NET G3**, driven by Ki-67.

## Posture (spec-v97)

Reads numbers a pathologist has already reported. It does not examine tissue and it does not
decide treatment.

## Files

- `lib/nen-who-grade-v797.js` — `nenWhoGrade()`, `NEN_NOTE`.
- `views/group-v797.js` (RV797) — a differentiation select and the two indices; the result shows the grade each index would give on its own; a11y-checked.
- `mcp/adapters/nen-who-grade-v797.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, all three grades, the higher-wins rule, the differentiation axis, related (gleason-grade-group, bethesda-thyroid).
- `test/unit/nen-who-grade.test.js` — 8 tests (G1, higher-wins in both directions, both Ki-67 boundaries, both mitotic boundaries, NEC, either index alone, invalid input).
- `docs/spec-v797.md` (this file).

## Sourcing (spec-v97)

Rindi G, Mete O, Uccella S, et al. *Endocr Pathol.* 2022;33(1):115-154 (PMID 35294740). Both
threshold sets, the higher-index-wins rule and the separation of differentiation from grade
were confirmed against two independent sources, which agreed on every number and both stated
the rule as "or" — either index being elevated moves the tumor to the higher grade.

## Gate notes

Two gates fired on the first draft, both because the source's own wording is British:

- `check-us-english` rejected **"tumour"** in the lib note. Also corrected: "millimetres".
  Quoting a source is not a licence to carry its spelling into reader-facing copy.
- `check-citations` rejected the citation for naming **WHO**, which is in the issuer pattern,
  without a `docs/citation-staleness.md` row. The right fix is the row, not rewording the
  citation to dodge the acronym — the ledger exists so "is this current?" has an auditable
  answer. `check-citations` now sees 61 issuer tiles across 126 rows.

