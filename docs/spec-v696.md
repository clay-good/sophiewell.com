# spec-v696.md — Framingham criteria for heart failure

> Status: **SHIPPED (2026-08-10).** Builds the `framingham-hf-criteria` tile. Catalog **1526 → 1527**, group G.

## Why

The catalog had heart-failure prognosis (MAGGIC) and functional class (NYHA) but not the
**Framingham diagnostic criteria** — the classic bedside rule for *diagnosing* heart failure.
Axis gap (diagnosis vs prognosis/class).

## What it does

Heart failure is diagnosed when either **≥ 2 major** criteria, or **1 major + ≥ 2 minor**
criteria, are present.

**Major (8):** acute pulmonary edema; cardiomegaly; hepatojugular reflux; neck-vein distention
(raised JVP); PND or orthopnea; pulmonary rales; S3 gallop; weight loss > 4.5 kg in 5 days on
HF treatment.

**Minor (6):** ankle edema; dyspnea on exertion; hepatomegaly; nocturnal cough; pleural
effusion; tachycardia (HR > 120). A minor criterion counts only if not attributable to another
condition.

## Posture (spec-v97)

A clinical rule; confirm with objective testing (natriuretic peptides, echocardiography). It
supports rather than replaces clinical judgment.

## Files

- `lib/framingham-hf-criteria-v696.js` — `framinghamHfCriteria()`, `FRAMINGHAM_HF_NOTE`.
- `views/group-v696.js` (RV696) — 14 checkboxes (8 major + 6 minor); a11y-checked.
- `mcp/adapters/framingham-hf-criteria-v696.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, rule + major/minor lists, related (maggic, nyha-class).
- `test/unit/framingham-hf-criteria.test.js` — 6 tests (not met, 2 major, 1 major alone,
  1 major + 2 minor, 1 major + 1 minor, minors-only).
- `docs/spec-v696.md` (this file).

## Sourcing (spec-v97)

McKee PA, Castelli WP, McNamara PM, Kannel WB. The natural history of congestive heart failure:
the Framingham study. *N Engl J Med.* 1971;285(26):1441-1446 (PMID 5122894). The 8 major / 6
minor criteria and the "≥ 2 major, or 1 major + ≥ 2 minor" rule were confirmed against the
original and an independent calculator reproduction, which list the same criteria and rule.
