# spec-v1664 — Independent review of the dosing and radiation tools (v1631, v1635, v1636)

> Status: **SHIPPED (2026-10-20)**: hardening, no new tool (catalog stays 2,362).

Two reviewers ran every tool in `lib/*-v1631.js`, `lib/*-v1635.js` and `lib/*-v1636.js` (79 files) on edge inputs, the
same review that found eleven defects in the v1656 to v1662 tools. They confirmed 18 defects; 17 are fixed here.

## A printed number that contradicted its verdict (14 tools)

Each tool decided on the unrounded value and printed it rounded, so the number shown sat on the cut-off the verdict
said it missed. The shared fix is `lib/cut-display.js`: `sigSafe` and `dpSafe` give the value at the fewest digits
that fall on the same side of every cut-off as the raw value.

| Tool | Input | Was | Now |
|---|---|---|---|
| `hdmtx-leucovorin-rescue` | 22.72 mg/L at 24 h | "50 µmol/L is in no row ... under the delayed early row's 50" | 49.996 µmol/L |
| `cumulative-dose-limit` | mitoxantrone 139.96 mg/m² | "total 140 mg/m²: 100% of the label's 140", not flagged | 139.96, 99.97% |
| `nrc-medical-event-screen` | 80.04 delivered of 100 | "off by 20% (20% or more needed). Not met." | 19.96% |
| `chemo-dose-verify` | 1,100.4 mg vs 1,000, 10% tolerance | "+10%. That is outside the 10% tolerance" | +10.04% |
| `radiopharm-dispense-volume` | 24.008 mCi vs 20 | "+20% ... not acceptable" (the rule is "more than 20 percent") | +20.04% |
| `generator-breakthrough-check` | 150.4 µCi Mo-99 / 1,000 mCi | "0.15 ... over the 0.15 limit" | 0.1504 |
| `sealed-source-leak-test` | 11,090 cpm at 100% | "0.005 µCi ... below the 0.005" | 0.004995 |
| `rad-package-receipt-check` | 240.4 dpm/cm², 200.4 mrem/h | "240 ... above the 240 limit" | 240.4 |
| `esa-chemo-dose-adjust` | 9.02 to 10.06 g/dL | "rose 1 g/dL (more than 1 g/dL)" | 1.04 |
| `ids-accountability-reconcile` | 79.958% compliance | "80%, 1 outside the range of 80% to 120%" | 79.96% |
| `dantrolene-mh-vials` | 713.9 mg at 71.3 kg | "10 mg/kg, past the maximum 10 mg/kg" | 10.01 |
| `au-rate-saar` | 10,004 / 10,000 | "SAAR 1. Above 1" | 1.0004 |

Two were worse than display: `occupational-dose-limit-check` rounded the percent to four digits **before** comparing,
so 49.998 mSv (99.996%) was reported as "at or above the limit"; it now decides on the unrounded dose.
`naloxone-infusion` worked out mL/hour from the mg/hour already rounded to 0.01, so a 0.04 mg bolus gave 7.5 mL/hour
for a true 6.67; the rate now comes from the unrounded two-thirds and mg/hour is shown to three significant digits.

## Logic faults (4 tools)

- `surgical-prophylaxis-redose`: the child dose of a combination product is mg/kg of one component, but it was capped at
  the whole product's adult dose, so 60 kg got 3 g of ampicillin (the adult dose holds 2 g). The cap is now the
  component's adult amount: ampicillin 2 g of 3 g ampicillin-sulbactam, piperacillin 3 g of 3.375 g
  piperacillin-tazobactam (8:1).
- `neostigmine-reversal-dose`: with the label's two rows pointing different ways, a prior dose was not checked against
  either dose shown; it now is.
- `lithium-level-check`: a target of 1.5 mEq/L, the label's toxic level, got a proportional dose; it is now refused, and a
  target above the phase's range is noted.
- `fomepizole-schedule`: with dialysis starting 4 to 6 hours after the last dose, "the next dose during dialysis" was
  printed at a time before dialysis began. The label does not say when that first dose falls, so no time is given.

## Not changed

`nuc-med-breastfeeding-interruption` reaches different answers for 28 mCi and 1,036 MBq because the NUREG-1556 table's
mCi and MBq columns are printed values that do not convert exactly; the tool keeps them as printed, as its header says.

## Proof

`test/unit/review-fixes-v1631-v1636.test.js` holds each reviewer input; `test/unit/naloxone-infusion-v1636.test.js` now
expects the unrounded rates.
