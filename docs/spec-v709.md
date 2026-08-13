# spec-v709.md — Opioid Risk Tool (ORT)

> Status: **SHIPPED (2026-08-10).** Builds the `opioid-risk-tool` tile. Catalog **1539 → 1540**, group G.

## Why

The catalog had opioid conversion (MME) and withdrawal (COWS) tools but no **pre-prescription
risk screen**. The ORT is the classic brief, sex-specific screen for aberrant drug-related
behavior before starting long-term opioid therapy. Axis gap.

## What it does

Sex-specific point sum (Female / Male):

| Item | F | M |
| --- | --- | --- |
| Family hx alcohol abuse | 1 | 3 |
| Family hx illegal drug use | 2 | 3 |
| Family hx prescription drug abuse | 4 | 4 |
| Personal hx alcohol abuse | 3 | 3 |
| Personal hx illegal drug use | 4 | 4 |
| Personal hx prescription drug abuse | 5 | 5 |
| Age 16–45 | 1 | 1 |
| Preadolescent sexual abuse | 3 | 0 |
| ADD/OCD/bipolar/schizophrenia | 2 | 2 |
| Depression | 1 | 1 |

**Risk:** 0–3 low, 4–7 moderate, ≥ 8 high.

## Posture (spec-v97)

A screening aid to guide **monitoring intensity**, not a reason to withhold appropriate pain
treatment. It supports rather than replaces clinical judgment.

## Files

- `lib/opioid-risk-tool-v709.js` — `opioidRiskTool()`, `ORT_NOTE`.
- `views/group-v709.js` (RV709) — a sex select + ten checkboxes; a11y-checked.
- `mcp/adapters/opioid-risk-tool-v709.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, sex-specific points + risk bands, related (cows, opioid-mme).
- `test/unit/opioid-risk-tool.test.js` — 6 tests (0 low, sex-specific weights ×2, worked example 8,
  bands, required sex).
- `docs/spec-v709.md` (this file).

## Sourcing (spec-v97)

Webster LR, Webster RM. Predicting aberrant behaviors in opioid-treated patients: preliminary
validation of the Opioid Risk Tool. *Pain Med.* 2005;6(6):432-442 (PMID 16336480). The
sex-specific item weights and the 0–3 / 4–7 / ≥ 8 risk bands were confirmed against the NIDA ORT
form and StatPearls, which report the same table (the original ORT, not the later ORT-OUD revision).
