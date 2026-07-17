# spec-v363.md — Shaffer gonioscopy angle grade tile

> Status: **SHIPPED (2026-07-16).** Builds the `shaffer-angle` tile — the Shaffer gonioscopy grading of
> the anterior chamber angle (grades 0–4). Catalog **1214 → 1215**, group G.

## Why

The catalog carries other ophthalmology grades (ICDR diabetic retinopathy, KWB hypertensive retinopathy,
ACR TI-RADS) but no anterior-chamber-angle grade. The Shaffer system is the standard gonioscopy grading
of the drainage-angle width, used to gauge the risk of angle-closure glaucoma. `shaffer grade` /
`gonioscopy angle grade` / `anterior chamber angle grade` routed to nothing.

## What it does

The clinician picks the grade; the tile reports the grade, its angle-width description, and whether it is
a narrow (grade 0–2, angle-closure-risk) angle.

- `lib/shaffer-angle-v363.js` — pure grade → description. A **higher** grade is a **wider, safer** angle.
  **4:** wide open (~35–45°). **3:** open (~20–35°). **2:** moderately narrow (~20°), closure possible —
  flagged. **1:** very narrow (~10°), closure probable — flagged. **0:** closed — flagged. Accepts 0–4
  (string or number).
- `views/group-v363.js` (RV363) — one select (dom `shaffer-grade`), real `<label for>`.
- `lib/meta.js` — Shaffer 1960 citation + accessed date + grouped bands. No citation-staleness row (the
  citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v84 → v85); corpus → 1215.

**HIGH-STAKES:** it reports the Shaffer grade the clinician has determined on gonioscopy, never a
diagnosis (angle-closure glaucoma), a treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3).
A closed or very narrow angle (grade 0–1) with symptoms can be an ophthalmic emergency assessed on its
own; the management decision stays with the ophthalmologist (surfaced in the tile note).

## Sourcing (spec-v97)

- **Citation:** Shaffer RN. Primary glaucomas. Gonioscopy, ophthalmoscopy and perimetry. *Trans Am Acad
  Ophthalmol Otolaryngol.* 1960;64:112-127 (the original grades 0–4 by approximate angular width).
- Cross-verified against AAO and gonioscopy references (EyeWiki) reproducing the same
  wide-open-to-closed grading and angle-closure-risk interpretation. **The exact degree boundaries vary
  slightly by source, so the angular widths are given as approximate; the clinical interpretation (grade
  0–2 narrow / at risk, grade 3–4 open) is consistent.**

## Verification

Lint (all catalog-truth surfaces at 1215), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: the example (grade 1) renders the flagged "very narrow / closure probable" description, grade 4
flips to the un-flagged "wide open" description, and the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the grade the clinician selects; it does not perform gonioscopy, distinguish Shaffer from
the Spaeth or Scheie systems, or diagnose glaucoma. The MCP adapter + golden-probe promotion follow in a
separate wave.
