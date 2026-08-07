# spec-v653.md — WHO/ISUP nucleolar grade for renal cell carcinoma

> Status: **SHIPPED (2026-08-07).** Builds the `who-isup-renal-grade` tile. Catalog **1483 → 1484**, group G.

## Why

A companion gap in the renal-cancer and histologic-grading veins. The catalog had the Leibovich score
(`leibovich-rcc`) for clear-cell RCC progression and grading systems for prostate (`gleason-grade-group`),
breast (`nottingham-grade`), and sarcoma (`fnclcc-grade`) — but not the WHO/ISUP nucleolar grade, the standard
grade for RCC that replaced Fuhrman grading in WHO 2016.

## What it does

A decision-logic classifier returning **grade 1–4**, driven by nucleolar prominence at magnification:

| Grade | Definition |
| --- | --- |
| 1 | nucleoli absent or inconspicuous at 400× |
| 2 | nucleoli conspicuous at 400× but inconspicuous at 100× |
| 3 | nucleoli conspicuous at 100× |
| 4 | extreme nuclear pleomorphism, tumor giant cells, and/or rhabdoid and/or sarcomatoid differentiation |

Any grade-4 feature sets grade 4 regardless of the nucleoli; otherwise the nucleoli selection sets grade 1–3.
The basophilic/eosinophilic color terms are descriptive, not gating — grading keys off magnification alone.

## Scope (spec-v11 §5.3)

A pathologist's grade read with the full pathology report. Validated for **clear-cell and papillary RCC**; it
is **not applied to chromophobe RCC** (no grading system gives independent prognostic information there).

## Files

- `lib/who-isup-renal-grade-v653.js` — `whoIsupRenalGrade()`, `WHOISUP_NOTE`.
- `views/group-v653.js` (RV653) — one nucleoli select (grade 1–3 basis) + a grade-4-feature checkbox that
  overrides to grade 4; a11y-checked, no innerHTML, no network.
- `mcp/adapters/who-isup-renal-grade-v653.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, interpretation, specialties, related.
- `test/unit/who-isup-renal-grade.test.js` — 5 tests (nucleoli mapping, grade-4 override, abnormal flag,
  example, required/unknown validation).
- `docs/spec-v653.md` (this file).

## Sourcing (spec-v97)

Delahunt B, Cheville JC, Martignoni G, et al. The International Society of Urological Pathology (ISUP) grading
system for renal cell carcinoma and other prognostic parameters. *Am J Surg Pathol.* 2013;37(10):1490-1504
(PMID 24025520); adopted in the WHO 2016/2022 classification. A source-verification subagent confirmed the four
grade definitions, the 400×/100× magnification thresholds, the applicable subtypes (clear-cell and papillary,
not chromophobe), and that the system replaced Fuhrman grade in WHO 2016. Note: the grade-2 "eosinophilic"
descriptor is WHO 2016 phrasing, not the Delahunt 2013 original wording; the color terms are descriptive, not
classification gates.
