# spec-v655.md — Completeness of Cytoreduction (CC) score

> Status: **SHIPPED (2026-08-07).** Builds the `completeness-cytoreduction` tile. Catalog **1485 → 1486**, group G.

## Why

The natural companion to the Peritoneal Cancer Index (`peritoneal-cancer-index`, spec-v654). The two Sugarbaker
metrics together drive CRS/HIPEC decisions: PCI quantifies the tumor burden before surgery, and the CC score
grades the residual disease after it. They come from the same 1996 chapter.

## What it does

A decision-logic classifier from the largest residual tumor nodule after cytoreductive surgery:

| Grade | Largest residual nodule |
| --- | --- |
| CC-0 | no macroscopic residual tumor |
| CC-1 | < 2.5 mm |
| CC-2 | 2.5 mm to 2.5 cm |
| CC-3 | > 2.5 cm, or confluence of unresectable disease |

**CC-0 and CC-1 are a complete cytoreduction** (nodules < 2.5 mm are within the penetration depth of
intraperitoneal chemotherapy); CC-2 and CC-3 are incomplete. Note the boundary: **2.5 mm itself falls into
CC-2**, not CC-1 (CC-1 is strictly < 2.5 mm). A confluence checkbox forces CC-3 regardless of size.

## Scope (spec-v11 §5.3)

The grade is read alongside the Peritoneal Cancer Index and the operative findings; the decision stays with the
surgical team.

## Files

- `lib/completeness-cytoreduction-v655.js` — `completenessCytoreduction()`, `CC_NOTE`.
- `views/group-v655.js` (RV655) — one residual-nodule-size number input + a confluence checkbox; a11y-checked,
  no innerHTML, no network.
- `mcp/adapters/completeness-cytoreduction-v655.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, interpretation, specialties, related.
- `test/unit/completeness-cytoreduction.test.js` — 6 tests (size binning, exact 2.5 mm / 25 mm boundaries,
  complete-vs-incomplete, confluence override, example, required/negative validation).
- `docs/spec-v655.md` (this file).

## Sourcing (spec-v97)

Jacquet P, Sugarbaker PH. Clinical research methodologies in diagnosis and staging of patients with peritoneal
carcinomatosis. *Cancer Treat Res.* 1996;82:359-374 (PMID 8849962). A source-verification subagent confirmed
the two size cutoffs (2.5 mm and 2.5 cm) and corrected the boundary inequality — CC-1 is **< 2.5 mm** and the
2.5 mm value belongs to CC-2 — and confirmed CC-0/CC-1 as the "complete" cytoreduction grades. Same chapter as
the PCI.
