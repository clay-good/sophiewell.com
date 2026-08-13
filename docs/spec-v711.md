# spec-v711.md — AUSDRISK (Australian Type 2 Diabetes Risk Assessment Tool)

> Status: **SHIPPED (2026-08-10).** Builds the `ausdrisk` tile. Catalog **1541 → 1542**, group G.

## Why

The catalog had the Finnish FINDRISC diabetes-risk tool but not **AUSDRISK**, the Australian
government type-2 diabetes risk assessment. Companion gap (a distinct, widely used national tool
with ethnicity-specific waist bands).

## What it does

Weighted sum, total **0–35**:

| Item | Points |
| --- | --- |
| Age band | 0 / 2 / 4 / 6 / 8 |
| Male sex | 3 |
| Aboriginal/TSI/Pacific/Maori descent | 2 |
| Born in Asia / Middle East / N. Africa / S. Europe | 2 |
| Family history of diabetes | 3 |
| Ever high blood glucose | 6 |
| On antihypertensive medication | 2 |
| Current daily smoker | 2 |
| Not eating vegetables/fruit every day | 1 |
| < 2.5 h physical activity/week | 2 |
| Waist circumference (ethnicity- & sex-specific) | 0 / 4 / 7 |

**Waist bands** — Asian/Aboriginal/TSI: Men < 90 / 90–100 / > 100, Women < 80 / 80–90 / > 90;
all others: Men < 102 / 102–110 / > 110, Women < 88 / 88–100 / > 100.

**Risk tiers:** ≤ 5 low; 6–14 intermediate (discuss with a doctor); ≥ 15 high (fasting blood
glucose test advised).

## Posture (spec-v97)

Estimates future risk; it is not a diagnosis of diabetes. It supports rather than replaces
clinical judgment and confirmatory testing.

## Files

- `lib/ausdrisk-v711.js` — `ausdrisk()`, `AUSDRISK_NOTE`.
- `views/group-v711.js` (RV711) — age/sex selects, waist number, waist-band-set checkbox, seven
  risk checkboxes; a11y-checked.
- `mcp/adapters/ausdrisk-v711.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, items + waist bands + tiers, related (findrisc, metabolic-syndrome).
- `test/unit/ausdrisk.test.js` — 7 tests (worked example 16, lowest 0, waist bands ×3 incl. the
  lower Asian set, risk tiers, validation).
- `docs/spec-v711.md` (this file).

## Sourcing (spec-v97)

Chen L, Magliano DJ, Balkau B, et al. AUSDRISK: an Australian Type 2 Diabetes Risk Assessment
Tool. *Med J Aust.* 2010;192(4):197-202 (PMID 20170456). The item point table, the
ethnicity/sex-specific waist bands, and the ≤ 5 / 6–14 / ≥ 15 tiers were taken verbatim from the
Australian Government Department of Health AUSDRISK handout and cross-checked against the
derivation; the fine per-band probability percentages are treated as advisory, not a second
computation.
