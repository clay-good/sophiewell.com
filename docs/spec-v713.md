# spec-v713.md — Edmonton Obesity Staging System (EOSS)

> Status: **SHIPPED (2026-08-10).** Builds the `eoss` tile. Catalog **1543 → 1544**, group G.

## Why

The catalog had BMI and metabolic-syndrome tools but not the **EOSS** — the standard clinical
staging of obesity by its actual health impact rather than BMI, which predicts mortality better
than BMI alone. Whole-concept gap.

## What it does

A decision rule: rate three domains 0–4, the overall stage is the **most severe**.

- **Medical** (obesity-related risk factors / comorbidities)
- **Functional** (physical symptoms / functional limitations)
- **Mental** (psychological symptoms)

| Stage | Meaning |
| --- | --- |
| 0 | no obesity-related health impact |
| 1 | subclinical risk factors or mild symptoms |
| 2 | established comorbidity requiring intervention |
| 3 | end-organ damage / significant limitation |
| 4 | severe (potentially end-stage) disability |

Higher stage = greater mortality risk and a stronger indication for aggressive treatment.

## Posture (spec-v97)

Stages by clinical judgment, not BMI; guides management intensity and is not a substitute for the
full clinical assessment. It supports rather than replaces clinical judgment.

## Files

- `lib/eoss-v713.js` — `eoss()`, `EOSS_NOTE`.
- `views/group-v713.js` (RV713) — three domain selects (0–4); a11y-checked, no innerHTML.
- `mcp/adapters/eoss-v713.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, domains + stage definitions, related (bmi, metabolic-syndrome).
- `test/unit/eoss.test.js` — 5 tests (stage 0, most-severe-domain, mental drives stage, ≥ 2 flag,
  validation).
- `docs/spec-v713.md` (this file).

## Sourcing (spec-v97)

Sharma AM, Kushner RF. A proposed clinical staging system for obesity. *Int J Obes (Lond).*
2009;33(3):289-295 (PMID 19188927). The five stage definitions (0–4) and the most-severe-domain
rule were confirmed against the original and the Obesity Canada / MDCalc EOSS reproductions,
which agree; the tile models the three-domain rating and takes the maximum as the overall stage.
