# spec-v656.md — ISGPS 2016 postoperative pancreatic fistula (POPF) grade

> Status: **SHIPPED (2026-08-07).** Builds the `isgps-popf` tile. Catalog **1486 → 1487**, group G.

## Why

A surgical-complication grading gap. The catalog had general surgical-complication tools (Clavien-Dindo) but
not the organ-specific International Study Group definitions. The ISGPS POPF grade is the standard grading of
pancreatic leak after pancreatic resection.

## What it does

A decision-logic classifier.

**Defining gate:** a POPF requires drain fluid amylase **> 3× the upper limit of the institutional normal
serum amylase**, in any measurable drain volume, **on or after postoperative day 3**. If the gate is not met,
there is no POPF.

Given the gate, the grade is set by clinical impact (most severe wins):

| Grade | Definition |
| --- | --- |
| C | reoperation, single/multiple organ failure, or death attributable to the POPF |
| B | a clinically relevant change in management (drains > 3 wk or repositioned, percutaneous/endoscopic drainage, octreotide/antibiotics, angiographic procedures for POPF-related bleeding, or infection without organ failure) |
| Biochemical leak (BL) | gate met, no change in management (the former "Grade A", which the 2016 update no longer calls a true fistula) |

## Scope (spec-v11 §5.3)

Grades a documented drain-amylase result and the postoperative course; read with the surgical team.

## Files

- `lib/isgps-popf-v656.js` — `isgpsPopf()`, `ISGPS_POPF_NOTE`.
- `views/group-v656.js` (RV656) — an amylase-gate checkbox + grade-C and grade-B checkboxes; a11y-checked, no
  innerHTML, no network.
- `mcp/adapters/isgps-popf-v656.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, interpretation, specialties, related.
- `test/unit/isgps-popf.test.js` — 7 tests (gate not met, biochemical leak, grade B, most-severe-wins, grade C
  alone, feature-without-gate, required gate).
- `docs/spec-v656.md` (this file).

## Sourcing (spec-v97)

Bassi C, Marchegiani G, Dervenis C, et al; International Study Group on Pancreatic Surgery (ISGPS). The 2016
update of the International Study Group (ISGPS) definition and grading of postoperative pancreatic fistula: 11
Years After. *Surgery.* 2017;161(3):584-591 (PMID 28040257). A source-verification subagent confirmed the
defining gate (drain amylase > 3× ULN serum, on/after POD 3), the BL/B/C definitions and feature placement (the
angiographic-bleeding item sits in B; readmission was dropped as a determinant), and that the former Grade A is
now the biochemical leak and is no longer a true fistula.
