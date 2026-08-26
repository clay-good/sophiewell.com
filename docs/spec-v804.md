# spec-v804.md — Rome proposal (COPD exacerbation severity)

> Status: **SHIPPED (2026-08-26).** Builds the `rome-ecopd` tile. Catalog **1595 → 1596**,
> group G.

## Why

The catalog had `decaf-score` and `bap-65`, which **predict outcomes** in an acute COPD
exacerbation, and `gold-abe` / `gold-spirometry`, which grade the underlying disease. Nothing
graded **the episode itself**. The Rome proposal is the 2021 answer to exactly that, and it
replaced a definition that graded severity by the treatment given — which is circular.

## What it does

**Five variables, each with a cutoff:**

| Variable | Cutoff |
| --- | --- |
| Dyspnea, 0–10 visual analog scale | ≥ 5 |
| Respiratory rate | ≥ 24 /min |
| Heart rate | ≥ 95 /min |
| Oxygen saturation | < 92%, **or** a fall > 3% from the usual value |
| C-reactive protein | ≥ 10 mg/L |

**At least three of the five above cutoff is moderate. Fewer is mild.** That counting rule is
what the tile is for — a single alarming number does not make an exacerbation moderate, and a
test pins that two above cutoff is still mild.

**Severe is a separate gate on a sixth variable, the arterial blood gas**, and needs **both**
hypercapnia (PaCO₂ > 45 mmHg) **and** respiratory acidosis (pH < 7.35). Tests pin that
hypercapnia alone is not severe and acidosis alone is not severe — and that the gas gate can
make an otherwise **mild** episode severe, which is why it is drawn as a gate rather than a
sixth counter.

The saturation variable is read as a **pair**: absolute value or fall from baseline, either
route counts, and both together still count **once**. A test asserts it does not double-count.

**Worked example:** dyspnea 6, RR 26, HR 100, saturation 95%, CRP 5 → three above cutoff →
**moderate**.

## Posture (spec-v97)

Grades an episode from measurements already taken. It decides nothing about steroids,
antibiotics, ventilation or admission.

## Files

- `lib/rome-ecopd-v804.js` — `romeEcopd()`, `ROME_NOTE`.
- `views/group-v804.js` (RV804) — the five counted variables under one heading, the blood gas under another, so the gate is visually separate from the count; a11y-checked.
- `mcp/adapters/rome-ecopd-v804.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, all cutoffs, the three-of-five rule, the blood gas gate, related (decaf-score, bap-65, gold-abe).
- `test/unit/rome-ecopd.test.js` — 7 tests (nothing above cutoff, the two-vs-three boundary, all five cutoffs exactly, the saturation pair including no double-counting, severe needing both gas criteria, the gas gate overriding a mild count, invalid input).
- `docs/spec-v804.md` (this file).

## Sourcing (spec-v97)

Celli BR, Fabbri LM, Aaron SD, et al. *Am J Respir Crit Care Med.* 2021;204(11):1251-1258
(PMID 34570991). All five cutoffs, the at-least-three rule and both blood gas criteria were
confirmed against two independent sources, which agreed on every number and both stated the
severe gate as requiring hypercapnia **and** acidosis together.
