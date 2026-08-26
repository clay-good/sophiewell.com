# spec-v801.md — Hodapp-Parrish-Anderson glaucoma staging

> Status: **SHIPPED (2026-08-26).** Builds the `hpa-glaucoma` tile. Catalog **1592 → 1593**,
> group G.

## Why

The catalog had `icdr-retinopathy`, `areds`, `amsler-krumeich`, `osdi`,
`visual-acuity-converter`, `ocular-trauma-score` — and **not one glaucoma tile**. Glaucoma is
the leading cause of irreversible blindness worldwide, and Hodapp-Parrish-Anderson is how its
severity is staged.

## What it does

Four readings come off **one** visual field. Each gives its own grade, and **the most severe
of them is the overall grade.**

| Criterion | early | moderate | severe |
| --- | --- | --- | --- |
| Mean deviation | better than −6 dB | −6 to −12 | worse than −12 |
| Points below the 5% level | up to 25% | up to 50% | over 50% |
| Points below the 1% level (of 76) | under 10 | 10 to 20 | over 20 |
| Central 5° | — | depressed, not both hemifields | both hemifields, **or any point at 0 dB** |

**The most-severe rule is the whole point of the tile**, and the tile names *which* criterion
set the grade. The headline test: a field with mean deviation −4, 10% of points below the 5%
level and 5 below the 1% level stages **early** — add a central 5° depression in both
hemifields and the same field is **severe**. A clinician reading only the mean deviation off
the printout would call that field early.

Every boundary on all three numeric criteria is pinned by a test, from both sides.

**Worked example:** MD −4, 10%, 5 points, central depression in both hemifields → **severe**,
set by the central 5°.

## Posture (spec-v97)

Stages a field the clinician has **already reviewed for reliability and artefact**. It does
not read the printout, it says nothing about intraocular pressure or the optic nerve, and it
sets no treatment target.

## Files

- `lib/hpa-glaucoma-v801.js` — `hpaGlaucoma()`, `HPA_NOTE`.
- `views/group-v801.js` (RV801) — three numbers and one central-5° select; the result lists the grade each criterion gave; a11y-checked.
- `mcp/adapters/hpa-glaucoma-v801.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, the most-severe rule and all four criteria, related (icdr-retinopathy, areds).
- `test/unit/hpa-glaucoma.test.js` — 8 tests (a clean field, every boundary on all three numeric criteria, the most-severe rule, the central-5° mapping, the driver list, invalid input).
- `docs/spec-v801.md` (this file).

## Gate note

`check-page-copy` holds a **ratchet** on hub and topic rows that end in a cut mark: at most
775 catalog-wide. My first summary pushed it to 777 — one long opening sentence produces two
cut rows, one on a hub page and one on a topic page. Shortening the summary was not enough
on its own; what fixed it was making the **first sentence short and self-contained**
("Stages a glaucomatous visual field defect (Hodapp-Parrish-Anderson)."), because the row is
cut at the first sentence boundary. Back to 775.

## Sourcing (spec-v97)

Hodapp E, Parrish RK, Anderson DR. *Clinical Decisions in Glaucoma.* Mosby; 1993:52-61.
All four criteria and every threshold were confirmed against two sources: a clinical
rendering of the classic table, and the operational thresholds implemented in the **validated
GFDC classifier** (*npj Digit Med.* 2024;7:126, PMC11102533), which was built specifically to
apply these criteria automatically. The GFDC paper is also the source of the explicit
tie-break rule shipped here: when criteria disagree, the most severe result is the overall
grade.
