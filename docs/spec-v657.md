# spec-v657.md — ISGLS post-hepatectomy liver failure (PHLF) grade

> Status: **SHIPPED (2026-08-07).** Builds the `isgls-phlf` tile. Catalog **1487 → 1488**, group G.

## Why

The liver-surgery companion to the ISGPS pancreatic-fistula grade (`isgps-popf`, spec-v656). The International
Study Group definitions form a cluster; PHLF is the standard grading of liver failure after hepatic resection.

## What it does

A decision-logic classifier.

**Defining gate:** PHLF is an increased INR (or the need for clotting factors such as FFP to maintain a normal
INR) **and** concomitant hyperbilirubinemia, both above the local laboratory normal limits, **on or after
postoperative day 5**. If INR and bilirubin were already abnormal preoperatively, the gate instead requires
both to be **increasing** (rising) on/after POD 5. If the gate is not met, there is no PHLF.

Given the gate, the grade is set by clinical management (most severe wins):

| Grade | Definition |
| --- | --- |
| C | requires invasive treatment (hemodialysis/RRT, mechanical ventilation, vasopressor/circulatory support, rescue hepatectomy or salvage liver transplant) |
| B | deviates from the regular course but manageable without invasive treatment (FFP, albumin, diuretics, non-invasive ventilation; ICU admission by itself is a Grade B example) |
| A | abnormal lab values, no change from routine management |

The B/C line is precisely non-invasive (B) vs invasive (C); ICU admission alone is B — what makes it C is the
invasive intervention, not the bed.

## Scope (spec-v11 §5.3)

Grades documented laboratory results and the postoperative course; read with the surgical team.

## Files

- `lib/isgls-phlf-v657.js` — `isglsPhlf()`, `ISGLS_PHLF_NOTE`.
- `views/group-v657.js` (RV657) — a lab-gate checkbox + invasive-treatment and management-deviation checkboxes;
  a11y-checked, no innerHTML, no network.
- `mcp/adapters/isgls-phlf-v657.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, interpretation, specialties, related.
- `test/unit/isgls-phlf.test.js` — 7 tests (gate not met, Grade A, Grade B, most-severe-wins, Grade C alone,
  feature-without-gate, required gate).
- `docs/spec-v657.md` (this file).

## Sourcing (spec-v97)

Rahbari NN, Garden OJ, Padbury R, et al. Posthepatectomy liver failure: a definition and grading by the
International Study Group of Liver Surgery (ISGLS). *Surgery.* 2011;149(5):713-724 (PMID 21236455). A
source-verification subagent confirmed the gate and the A/B/C definitions, and added three refinements now
reflected in the tile: the INR limb includes the need for FFP to maintain a normal INR; the preoperative-
abnormal caveat means both values must be **rising** (not merely exceeding preop); and this is **not** the
Balzan "50-50" criterion (a distinct fixed-cutoff definition). ICU admission alone is Grade B; the invasive act
defines Grade C.
