# spec-v701.md — SAD PERSONS scale (suicide risk)

> Status: **SHIPPED (2026-08-10).** Builds the `sad-persons` tile. Catalog **1531 → 1532**, group G.

## Why

The catalog had the C-SSRS suicide screener but not the mnemonic **SAD PERSONS** scale — a
widely taught, distinct 10-item screen. Companion in the suicide-risk cluster.

## What it does

Ten items, one point each (0–10):

**S**ex (male) · **A**ge < 19 or > 45 · **D**epression · **P**revious attempt · **E**thanol /
substance use · **R**ational-thinking loss · **S**ocial supports lacking · **O**rganized plan ·
**N**o spouse/partner · **S**ickness.

Numeric bands: **0–4 lower, 5–6 moderate, 7–10 high**. Original action guide: 0–2 home with
follow-up; 3–4 close follow-up, consider admission; 5–6 strongly consider admission; 7–10
hospitalize.

## Posture (spec-v97) — a screen, not a rule-out

SAD PERSONS has **low sensitivity**. The tile states, in the note, result detail, and posture
line, that it is a screen to prompt a **full clinical suicide-risk assessment**, never a way to
rule out risk or justify discharge, and that any acute concern warrants urgent psychiatric
evaluation regardless of the score. It supports rather than replaces clinical judgment.

## Files

- `lib/sad-persons-v701.js` — `sadPersons()`, `SAD_PERSONS_NOTE`.
- `views/group-v701.js` (RV701) — ten checkboxes; a11y-checked, no innerHTML.
- `mcp/adapters/sad-persons-v701.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, items + bands + low-sensitivity caution, related (cssrs,
  phq9, gad7).
- `test/unit/sad-persons.test.js` — 4 tests (0 lower, 10 high, band boundaries, worked example 5).
- `docs/spec-v701.md` (this file).

## Sourcing (spec-v97)

Patterson WM, Dohn HH, Bird J, Patterson GA. Evaluation of suicidal patients: the SAD PERSONS
scale. *Psychosomatics.* 1983;24(4):343-345,348-349 (PMID 6867245). The ten items, the 0–10
scoring, and the numeric bands / action guide were confirmed against the original and an
independent reproduction (the original scale, not the later Modified SAD PERSONS, which uses
different weights). The low-sensitivity caveat is well documented and surfaced prominently.
