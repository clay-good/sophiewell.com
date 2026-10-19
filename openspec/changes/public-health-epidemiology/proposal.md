# Change: Public health epidemiology and biostatistics measures

**Status:** Proposed, October 19, 2026. Specs only; nothing here is built.
**Audience:** the health department epidemiologist, the public health nurse, the MPH student,
the quality analyst who has to turn counts into rates, and the clinician reading a paper.
**Program index:** [docs/spec-v1654.md](../../../docs/spec-v1654.md).

## Why

The catalog answers the bedside and the billing office. It has a small biostatistics corner
(`diagnostic-2x2`, `two-by-two-effect`, `nnt-arr`, `or-rr-to-nnt`, `proportion-ci`,
`cohens-kappa`, `bland-altman`, `icer-dominance`) and nothing for the measures every public
health program reports: incidence and prevalence, the mortality family (crude, cause-specific,
infant, maternal, case fatality, proportionate mortality), years of potential life lost,
attributable proportion, vaccine effectiveness, herd immunity threshold, standardized mortality
ratios, age standardization, DALYs, and sample size.

A name search of the live catalog on October 19, 2026 for "incidence", "prevalence",
"attack rate", "case fatality", "mortality rate", "YPLL", "years of", "DALY", "vaccine
effic", "herd", "sample size", "standardized mortality", "age-adjust" and "attributable"
found nothing for any of them.

These are formulas, not tables. CDC's *Principles of Epidemiology in Public Health Practice*
(3rd edition, a public-domain US government textbook) defines most of them with worked
examples, and those examples become the tools' tests. The rest come from WHO and the original
papers, each named with what was and was not read.

## What changes

Eleven new tools in group E (Clinical Math & Conversions), the group that already holds the
biostatistics corner:

| # | id | Name | Source |
|---|---|---|---|
| 1 | `incidence-prevalence` | Incidence Proportion, Incidence Rate and Prevalence | CDC *Principles*, Lesson 3 §2 (read) |
| 2 | `mortality-measures` | Mortality Measures: Crude, Cause-Specific, Infant, Maternal, Case Fatality | Lesson 3 §3 (read) |
| 3 | `ypll` | Years of Potential Life Lost (YPLL) and YPLL Rate | Lesson 3 §3 (read) |
| 4 | `attributable-proportion` | Attributable Proportion and Population Attributable Fraction | Lesson 3 §6 (read); Levin 1953 (build gate) |
| 5 | `vaccine-effectiveness` | Vaccine Efficacy or Effectiveness From Attack Rates | Lesson 3 §6 (read) |
| 6 | `herd-immunity-threshold` | Herd Immunity Threshold From R0 and Coverage Needed | Fine 1993 (build gate) |
| 7 | `smr` | Standardized Mortality or Incidence Ratio (Observed Over Expected) | Lesson 3 §3 and Breslow and Day 1987 (build gate on the interval) |
| 8 | `direct-age-standardization` | Directly Age-Standardized Rate | Lesson 3 §4 (build gate: not opened) |
| 9 | `daly` | DALYs From Deaths and Prevalent Cases (YLL + YLD) | WHO GHE methods 2000-2021 (build gate: not opened) |
| 10 | `sample-size-proportion` | Sample Size for a Proportion or a Mean | WHO, Lwanga and Lemeshow 1991 (build gate: not opened) |
| 11 | `sample-size-two-groups` | Sample Size to Compare Two Proportions or Two Means | same (build gate) |

Five of the eleven are build-gated on a source not yet opened; their arithmetic is standard and
written out in `design.md`, but no number or formula ships until it is read on the page.

## Why this passes the admission rule

Each tool has inputs and a computed output with its multiplier named (per 1,000, per 100,000).
Each is deterministic and sourced. None is a reference table of rates: the tools compute the
reader's rates from the reader's counts. The standard populations and life tables that some
of these need (the 2000 US standard million, the WHO standard life table) are **reader input or
a cited, versioned data file**, never a hand-typed constant (the spec-v141 and spec-v1614 rules).

## What this does not do

- No modeling: no regression, no R0 estimation from a curve, no forecasting.
- No ranking of jurisdictions, no benchmark.
- No clinical reading: a case-fatality figure is a proportion, and the page says what it is and
  is not (the CDC text itself distinguishes rate from ratio from proportion; the tools keep the
  distinction).

## Impact

- New capability `public-health-epidemiology` (this change's `specs/` folder).
- At build: eleven lib functions in one or two modules, renderers, META with the CDC worked
  examples, MCP adapters, synonyms, count surfaces.
- `two-by-two-effect` supplies the risk-ratio interval that `vaccine-effectiveness` and
  `attributable-proportion` reuse; no formula is written twice (`docs/product-decisions.md`,
  one rule written twice drifts).
