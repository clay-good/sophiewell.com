# spec-v1665 — Independent review of the renal dose checks and drug switches (v1632, v1633)

> Status: **SHIPPED (2026-10-20)**: hardening, no new tool (catalog stays 2,362). Follows [spec-v1664](spec-v1664.md).

Two reviewers ran the 43 libs in `lib/*-v1632.js` and `lib/*-v1633.js` on edge inputs. Of the 15 items they reported,
13 are fixed; two were checked against the label and are not defects.

## Fixed

| Tool | Input | Was | Now |
|---|---|---|---|
| `cns-renal-dose-check` (levetiracetam) | 43 mL/min, 2.48 m² (29.996 adjusted) | rounded to 30 before banding: the 30-50 row, so 1,200 mg/day passed as "within the row's maximum, 1500" | banded unrounded: the under-30 row, above its 1,000 mg/day maximum |
| `lmwh-fondaparinux-dose-check` (dalteparin) | 49.5 kg, unstable angina | "between two rows: 5,500 or 6,500 units" | 5,500 units: Table 1 prints the row as "<50 kg" |
| `dofetilide-dose-algorithm` | QT 333 to 383 msec | "rose 15%, more than 15%" | 15.02% |
| `doac-dose-check`, `iv-antithrombotic-renal-check`, `lmwh-fondaparinux-dose-check` | CrCl 50.0004, 60.0004, 29.9996 | "CrCl 50 mL/min is above 50" | printed with the digits that agree |
| `gabapentinoid-renal-dose` | CrCl 14.96; CrCl 0 | "15 ÷ 15 = 0.997"; "0 to 0 mg/day" as a dose | 14.96; CrCl 0 refused |
| `crcl-label-weight` | Keppra with no weight | "÷ NaN m²" (library only; the form requires a weight) | refused |
| `er-opioid-label-start` (Hysingla ER) | 39.999 mg oxycodone | "gives 30 mg, rounded down to the 20 mg tablet" | 29.999 mg |
| `levothyroxine-start-dose` | 125.02 kg | "200 mcg ... (200 mcg is a tablet strength)" with the over-200 note | 200.03 mcg, between the 200 and 300 tablets |
| `hf-gdmt-target-percent` | ramipril 10.004 mg | "100% of the target ... above the target" | 100.04% |
| `anticoag-switch-clock` | dabigatran to warfarin at CrCl 50 | 3 days only | 3 or 2 days: the label prints 50 in two rows, as it does 30 |
| `taper-calendar` | 25 mg, 20% steps, 10 mg smallest | step 0 printed as 20 mg | 25 mg, the dose taken now |
| `taper-calendar` | 30 mg, 10% of remaining, 10 mg smallest | 30, 20, 20, 20, 10 with no pace warning | when the smallest dose is larger than one nominal step, the pace is checked on the rounded steps (30 to 20 mg is 33.3%) |
| `taper-calendar` | a pause dated 2020-01-01 | applied, moving every date | refused |

## Checked and not changed

- `lamotrigine-titration-calendar`: the reviewer read Table 3 as inclusive ranges ("14.1 to 27 kg"). The label's
  Table 3, re-read on October 20, 2026, heads every row "Greater than" and "And less than", so 14, 27 and 34 kg are in
  no row, as the tool says; the header comment that paraphrased the rows is corrected.
- `er-opioid-label-start`: Hysingla ER 120 mg. The current label (version 17, May 29, 2026) lists 20, 30, 40, 60, 80 and
  100 mg tablets; 120 mg appears only in its clinical studies.

## Proof

`test/unit/review-fixes-v1632-v1633.test.js` holds each reviewer input. Two older tests that encoded a defect (49.5 kg
in two rows; 50 mL/min in one) are updated.
