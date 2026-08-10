# spec-v702.md — Edinburgh Claudication Questionnaire

> Status: **SHIPPED (2026-08-10).** Builds the `edinburgh-claudication` tile. Catalog **1532 → 1533**, group G.

## Why

The catalog had objective peripheral-arterial-disease tools (ABI, Rutherford-Fontaine staging)
but not the **Edinburgh Claudication Questionnaire**, the validated *symptom* questionnaire that
classifies whether leg pain is claudication. Axis gap (symptom classification vs objective
severity).

## What it does

A decision rule returning a classification. Character criteria (all required for a claudication
pattern):

- pain or discomfort in the leg(s) on walking (**yes**)
- pain does **not** begin while standing still or sitting (**no**)
- pain when walking uphill or hurrying (**yes**)
- pain relieved within ~10 minutes of standing still (**yes**)

| Result | When |
| --- | --- |
| **Definite claudication** | criteria met **and** the calf is involved |
| **Atypical claudication** | criteria met but pain in the thigh/buttock only |
| **Not claudication** | any criterion fails, or pain only in a non-vascular distribution |

**Grade** of a claudication pattern: I if pain does not occur at an ordinary walking pace on the
level; II (more severe) if it does. Sensitivity ~91%, specificity ~99% vs physician diagnosis.

## Posture (spec-v97)

Classifies a symptom pattern; it does **not** measure disease severity or replace the ABI and
vascular assessment. It supports rather than replaces clinical judgment.

## Files

- `lib/edinburgh-claudication-v702.js` — `edinburghClaudication()`, `EDINBURGH_CLAUDICATION_NOTE`.
- `views/group-v702.js` (RV702) — five checkboxes + a pain-site select; a11y-checked.
- `mcp/adapters/edinburgh-claudication-v702.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, criteria + result logic, related (abi, rutherford-fontaine).
- `test/unit/edinburgh-claudication.test.js` — 6 tests (definite grade I, grade II, atypical,
  each criterion failing, non-vascular site, required site).
- `docs/spec-v702.md` (this file).

## Sourcing (spec-v97)

Leng GC, Fowkes FGR. The Edinburgh Claudication Questionnaire: an improved version of the WHO/Rose
Questionnaire for use in epidemiological surveys. *J Clin Epidemiol.* 1992;45(10):1101-1109 (PMID
1474400). The character criteria, the calf/thigh-buttock/non-vascular site logic, the definite/
atypical/not classification, and the grade I/II rule were confirmed against the original and an
independent reproduction.
