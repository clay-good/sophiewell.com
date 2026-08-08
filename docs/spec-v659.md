# spec-v659.md — ISGPS delayed gastric emptying (DGE) grade

> Status: **SHIPPED (2026-08-07).** Builds the `isgps-dge` tile. Catalog **1489 → 1490**, group G.

## Why

Completes the International Study Group surgical-complication cluster: ISGPS pancreatic fistula (`isgps-popf`,
v656), ISGLS post-hepatectomy liver failure (`isgls-phlf`, v657), ISGLS bile leak (`isgls-bile-leak`, v658),
and now ISGPS delayed gastric emptying. DGE is one of the defining complications of pancreatic resection.

## What it does

DGE is the inability to return to a standard diet by the end of the first postoperative week together with a
prolonged need for a nasogastric tube. The grade is the **most severe** grade satisfied by any of three time
criteria:

| Criterion | Grade A | Grade B | Grade C |
| --- | --- | --- | --- |
| NGT required (days) | 4–7 | 8–14 | > 14 |
| *or* NGT reinsertion after POD | 3 | 7 | 14 |
| *or* unable to tolerate solids by POD | 7 | 14 | 21 |

Enter each criterion as a number (0 if it does not apply). Vomiting/gastric distension and prokinetic use are
associated features in the original table (±/+/+) but are **not grade-determining**, so they are described but
not scored.

## Scope (spec-v11 §5.3)

Grades a documented postoperative course; read with the surgical team.

## Files

- `lib/isgps-dge-v659.js` — `isgpsDge()`, `ISGPS_DGE_NOTE`.
- `views/group-v659.js` (RV659) — three time number inputs; a11y-checked, no innerHTML, no network.
- `mcp/adapters/isgps-dge-v659.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, interpretation, specialties, related.
- `test/unit/isgps-dge.test.js` — 7 tests (no DGE, each criterion's binning with exact thresholds,
  most-severe-wins, example, negative/non-numeric rejection).
- `docs/spec-v659.md` (this file).

## Sourcing (spec-v97)

Wente MN, Bassi C, Dervenis C, et al. Delayed gastric emptying (DGE) after pancreatic surgery: a suggested
definition by the International Study Group of Pancreatic Surgery (ISGPS). *Surgery.* 2007;142(5):761-768 (PMID
17981197). A source-verification subagent confirmed the three criteria and their exact thresholds, the
most-severe-grade-wins logic, and the overall gate wording; and corrected a draft error — prokinetic use is
optional (±) in Grade A, so like vomiting it is an associated feature, not a grade-driver.
