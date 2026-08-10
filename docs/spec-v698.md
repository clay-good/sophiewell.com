# spec-v698.md — Quick COVID-19 Severity Index (qCSI)

> Status: **SHIPPED (2026-08-10).** Builds the `qcsi` tile. Catalog **1528 → 1529**, group G.

## Why

The catalog had COVID mortality/prognosis tools (ISARIC 4C, COVID-GRAM) but not the **qCSI**,
the bedside 3-variable index for early respiratory decompensation in admitted COVID-19 patients.
Axis gap (24-hour decompensation vs mortality).

## What it does

Three bedside measures, summed to **0–12**:

| Item | 0 | mid | high |
| --- | --- | --- | --- |
| Respiratory rate (breaths/min) | ≤ 22 | 23–28 → 1 | > 28 → 2 |
| Pulse oximetry SpO2 (%) | > 92 | 89–92 → 2 | ≤ 88 → 5 |
| O2 flow rate (L/min) | ≤ 2 | 3–4 → 4 | ≥ 5 → 5 |

Approximate 24-hour risk of respiratory decompensation: **0–3 ~4%, 4–6 ~30%, 7–9 ~44%,
10–12 ~57%.** A total **> 3** is commonly treated as elevated.

## Posture (spec-v97)

Derived on admitted patients on **low-flow** oxygen; not a substitute for continuous
monitoring. It supports rather than replaces clinical judgment.

## Files

- `lib/qcsi-v698.js` — `qcsi()`, `QCSI_NOTE`.
- `views/group-v698.js` (RV698) — three number inputs (RR, SpO2, O2 flow); a11y-checked.
- `mcp/adapters/qcsi-v698.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, item bands + risk, related (isaric-4c-mortality, news2, curb-65).
- `test/unit/qcsi.test.js` — 7 tests (healthy 0, each item's bands, worked example 7, max 12,
  validation).
- `docs/spec-v698.md` (this file).

## Sourcing (spec-v97)

Haimovich AD, Ravindra NG, Stoytchev S, et al. Development and Validation of the Quick COVID-19
Severity Index. *Ann Emerg Med.* 2020;76(4):442-453 (PMID 32447121). The three items, their
point bands, and the 24-hour risk figures were confirmed against Table 2 of the derivation and an
independent calculator, which agree exactly. Oxygen flow above 6 L/min (beyond the low-flow
derivation) sits in the top category here, which is disclosed.
