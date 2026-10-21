# Change: Laboratory quality control and proficiency-testing arithmetic

**Status:** Built October 19, 2026: five tools shipped, recorded in [docs/spec-v1658.md](../../../docs/spec-v1658.md).
Tool 1 (`westgard-multirule`) stays gated on the 1981 paper; tool 4 was dropped earlier as an overlap.
**Audience:** the bench technologist, the laboratory quality manager, the point-of-care
coordinator on a nursing unit, and the CLIA laboratory director.
**Program index:** [docs/spec-v1654.md](../../../docs/spec-v1654.md).

## Why

The catalog already has the tools a laboratorian reaches for after the result is out:
`reference-change-value`, `delta-check`, `sigma-metric` and `biological-variation-goals`, plus
`bland-altman` for method agreement. It has nothing for the work before the result is released: deciding whether a
quality-control run is in control (the Westgard multirule), setting control limits from a run
series (Levey-Jennings statistics), checking a result against the CLIA proficiency-testing
acceptance limit, scoring a proficiency-testing event, verifying a
calibration, or reporting turnaround time as the percentile a laboratory reports it.

A name search of the live catalog on October 19, 2026 for "Westgard", "Levey", "CLIA",
"proficiency", "total error", "calibration verification", "linearity", "carryover" and
"turnaround" found nothing.

The CLIA acceptance limits are a federal regulation (42 CFR 493 Subpart I, as amended at
87 FR 41238, July 11, 2022) and were read in full for routine chemistry (§493.931) and
hematology (§493.941) on the eCFR on October 19, 2026. The multirule is Westgard, Barry, Hunt
and Groth, *Clin Chem* 1981;27:493, with the rule set as the author restates it on his own
teaching page.

## What changes

Six new tools, group E (Clinical Math & Conversions), beside the live laboratory tools. Tool 4
was dropped as an overlap (see below):

| # | id | Name | Source |
|---|---|---|---|
| 1 | `westgard-multirule` | Westgard Multirule QC Evaluation (Two Levels, Across Runs) | Westgard et al. 1981 (abstract not opened; rules read on the author's page; build gate on the paper) |
| 2 | `levey-jennings-limits` | Levey-Jennings Mean, SD, CV and Control Limits From a Run Series | arithmetic identity (Levey and Jennings 1950 cited, not opened) |
| 3 | `clia-pt-acceptance` | CLIA Proficiency-Testing Acceptance Check (42 CFR 493.931 and 493.941) | eCFR, read |
| 4 | ~~`total-error-vs-clia`~~ | dropped: overlaps `sigma-metric` and `biological-variation-goals` | |
| 5 | `pt-event-score` | Proficiency-Testing Event Score and Passing | 42 CFR 493.931(c)(4)-(5) structure read; §493.803 passing rule (build gate) |
| 6 | `calibration-verification` | Calibration Verification: Recovery and Reportable Range Check | arithmetic identity; 42 CFR 493.1255 (build gate on its wording) |
| 7 | `turnaround-time-percentile` | Turnaround Time: Median and 90th Percentile From a List | arithmetic identity |

## Why this passes the admission rule

Each takes the reader's control values, target values or times and returns a decision or a
figure with its rule shown. The CLIA limits are a CFR table applied to the reader's result and
target, not a reprint. No tool ships a laboratory's own mean or SD; those are computed from the
reader's data or entered.

## What this does not do

- It does not evaluate the other CLIA specialties (endocrinology, toxicology, immunology,
  blood gas beyond the three analytes in §493.931) until their sections are read; the picker
  lists only read analytes and says so.
- It does not compute measurement uncertainty (CLSI documents are licensed) or biological
  variation targets (the EFLM database is a dataset with its own terms; `reference-change-value`
  already takes the reader's CVs).
- It does not store QC history; a run series is pasted or dropped and read in the browser.

## Impact

- New capability `laboratory-quality-control`.
- Dropped on October 19, 2026: the live `sigma-metric` takes the same three inputs (allowable error, bias, imprecision) and judges the method against the goal, and the live `biological-variation-goals` already computes total error as 1.65 times imprecision plus bias. What this tool added was the CLIA limit as the goal; `clia-pt-acceptance` now prints that limit as a percent at a decision level and hands it to `sigma-metric`.
- `sigma-metric` gains a backfill: its allowable total error field can be filled from
  `clia-pt-acceptance` for a read analyte (a `META.related` link and a prefill, not a new
  compute).
