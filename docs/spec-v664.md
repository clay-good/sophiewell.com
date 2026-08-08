# spec-v664.md — ASE/EACVI 2016 LV diastolic function screen (normal EF)

> Status: **SHIPPED (2026-08-08).** Builds the `diastolic-function-ase` tile. Catalog **1494 → 1495**, group G.

## Why

A companion gap in the echo/HFpEF vein. The catalog had the HFpEF **probability** scores (`h2fpef`,
`hfa-peff`), but not the ASE/EACVI 2016 algorithm that classifies **diastolic function itself** (normal /
indeterminate / dysfunction) in patients with normal ejection fraction — a distinct, widely-used echo-lab tool.

## What it does

Four criteria, each judged abnormal or normal by **strict inequalities**:

| Criterion | Abnormal if |
| --- | --- |
| Average E/e′ | > 14 |
| Annular e′ velocity | septal e′ < 7 **or** lateral e′ < 10 cm/s |
| Peak TR velocity | > 2.8 m/s |
| LA volume index | > 34 mL/m² |

Of the criteria that were **measured** (the denominator is what was entered, not always 4): **< 50% abnormal =
normal** diastolic function, **> 50% = diastolic dysfunction**, **exactly 50% = indeterminate**. At least three
of the four should ideally be available (the tile warns when fewer than three are entered).

Grading (I/II/III) is **not computed** — it needs the mitral E/A ratio and peak E, which this screen does not
collect; the note describes it.

## Scope (spec-v97)

Takes the clinician's measured echo values and supports the reading; not a diagnosis on its own.

## Files

- `lib/diastolic-function-ase-v664.js` — `diastolicFunctionAse()`, `DIASTOLIC_NOTE`.
- `views/group-v664.js` (RV664) — five optional numeric echo inputs; a11y-checked, no innerHTML, no network.
- `mcp/adapters/diastolic-function-ase-v664.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, interpretation, specialties, related.
- `test/unit/diastolic-function-ase.test.js` — 7 tests (all-abnormal, all-normal, exactly-half indeterminate,
  strict-inequality boundaries, either-arm annular e′, available-denominator not hard-coded 4, required input).
- `docs/spec-v664.md` (this file).

## Sourcing (spec-v97)

Nagueh SF, Smiseth OA, Appleton CP, et al. Recommendations for the Evaluation of Left Ventricular Diastolic
Function by Echocardiography: An Update from the ASE and the EACVI. *J Am Soc Echocardiogr.* 2016;29(4):277-314
(PMID 27037982; co-published Eur Heart J Cardiovasc Imaging 2016, PMID 27422899). A source-verification
subagent confirmed the four variables and thresholds (**average** E/e′ > 14, not septal; strict inequalities),
the < 50% / = 50% / > 50%-of-**available** rule, and the grading pathway (mitral E/A entry variable) that this
tile deliberately does not compute.
