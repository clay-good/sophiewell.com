# spec-v1709 — NHSN SIR p-value and 95% interval

> Status: **SHIPPED (2026-11-07)**: an enhancement to `nhsn-sir`; the catalog stays 2,386. Closes task 1.4 of the
> [infection-prevention-metrics](../openspec/changes/infection-prevention-metrics/) change.

## Why

`nhsn-sir` shipped in spec-v1655 without a p-value or interval, because the method was not read in a source. The
public-health change later shipped a plain exact Poisson interval for the SMR (spec-v1663), but NHSN does not use that
method. A different interval beside the facility's own report could disagree with it, so `nhsn-sir` waited.

## Source, as read November 7, 2026

NHSN publishes its statistics as SAS macros at cdc.gov/nhsn/sas/, linked from its Analysis Resources page:

| Macro | What it computes |
|---|---|
| `p-value-of-sir-compared-to-nominal.sas` | Two-sided p-value. Mid-P exact Poisson test when 100 or fewer infections were observed; otherwise Byar's approximation (Rothman and Boice 1979). Each one-tailed value is doubled and capped at 1. No value when fewer than 1 is predicted. |
| `rateCIcomp.sas` | The mid-P exact 95% interval for a Poisson count, found by bisection on z = (1 + n)v / (1 − v), halving v until the step is 1e-5. NHSN's macro guide (May 2021) says it serves "a single incidence density rate (such as a CLABSI rate, SIR)". |

The interval is a literal port of that bisection, not an exact root. The coarse bisection moves the third decimal in
some cases: an exact root gives 582.882 on the macro guide's example, while the macro prints 582.877.

## Checked against what NHSN prints

| Printed in | Input | NHSN | This tool |
|---|---|---|---|
| SIR guide, March 2024, p. 13 | 5 observed / 2.365 predicted | p 0.1251; 0.775, 4.686 | the same |
| Statistics Calculator guide, p. 4 | 1 / 1.05 | p 1.0000; 0.048, 4.697 | the same |
| Macro guide, May 2021, p. 7 | 12 / 35 (×1,000) | 185.767, 582.877 | the same |

When 0 infections are observed there is no lower limit, as the SIR guide says. The significance sentence is the
guide's own reading: p ≤ 0.05, or an interval that excludes 1, means the observed count differs significantly from
the predicted count.

## Surfaces

- `lib/nhsn-sir-v1655.js`: `nhsnMidP` and `nhsnMidPLimits` are exported. The result gains `pValue`, `lower` and
  `upper`, and two notes. The band and the worked example are unchanged.
- META cites both macros (`citationUrls`). Also updated: the staleness row, the adapter summary, and the unit tests,
  which cover all three printed figures, 0 observed, the Byar branch and the refusals.
