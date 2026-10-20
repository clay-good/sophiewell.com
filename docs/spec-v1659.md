# spec-v1659 — Public health epidemiology measures

> Status: **SHIPPED (2026-10-19)**: seven tools. Four more are specified and gated (below).

The build of the [public-health-epidemiology](../openspec/changes/public-health-epidemiology/proposal.md) change
proposed in [spec-v1654](spec-v1654.md). CDC's *Principles of Epidemiology in Public Health Practice*, 3rd ed.,
Lesson 3 sections 2, 3, 5 and 6 (archive.cdc.gov) and SEER's 2000 U.S. standard population were read on
October 19, 2026.

## What shipped

| Tool | What it answers | Worked example (test) |
|---|---|---|
| `incidence-prevalence` | Incidence proportion, incidence rate per person-time, point and period prevalence | 16 ÷ 6,400 person-years = 2.5 per 1,000; 100 ÷ 189 = 52.9% |
| `mortality-measures` | Ten measures from Table 3.4, each with its numerator, denominator and usual multiplier | crude 832.1 per 100,000 (US 2003); case fatality 0.5% |
| `ypll` | YPLL to an end point from age groups (midpoint rule) or single ages, and the YPLL rate | leukemia 2002: 117,033; 0.46 per 1,000 under 65 |
| `attributable-proportion` | The attributable proportion among the exposed; the preventive fraction when the exposed risk is lower | 0.57 and 0.07 per 1,000: 87.7% |
| `vaccine-effectiveness` | VE = 1 − risk ratio, with the risk ratio's 95% interval from `two-by-two-effect` | varicella, Oregon 2002: RR 0.28, VE 72% |
| `smr` | Observed over expected, the expected count entered or summed from strata | identity |
| `direct-age-standardization` | Age-specific rates weighted by the 2000 U.S. standard (19 SEER groups) or the reader's own | Table 3.6 Florida: 787.7 |

## The gates, as read

| Gate | Answer |
|---|---|
| 1.1 Age standardization | The design pointed to §4, which is natality. Age adjustment is in §3: "a weighted average of the age-specific mortality rates", with Table 3.6 (Alaska and Florida, 2002). |
| 1.7 The 2000 standard | NCHS Statistical Notes 20 returned 403. SEER's "Standard Populations - 19 Age Groups" table was read and transcribed by script (page sha256 `4b834ce6…0d1733`); its 19 rows sum to the printed 274,633,642. |
| 1.2, 1.3, 1.4, 1.5, 1.6 | Not read. The population attributable fraction, the SMR interval, and tools 6, 9, 10 and 11 stay gated. |

## What changed from the proposal

- **CDC's standardized rates are not reproduced exactly.** Applying the 2000 standard to Table 3.6's own counts
  gives Florida 787.7 (printed 787.8) and Alaska 794.5 (printed 794.1). CDC's figures come from WISQARS, whose
  handling of unknown ages was not read; the test pins the arithmetic, and this record states the gap.
- **Two misprints on the CDC pages.** The infant mortality example prints 6.951 per 1,000; 28,025 ÷ 4,089,950 is
  6.852. The diphtheria death-to-case ratio prints 0.0783; 11,228 ÷ 143,497 is 0.0782 to four places. The tests
  use the division.
- **The YPLL rate example rounds to 0.5 on the page**; the tool prints 0.46.
- **`smr` does not share code with `nhsn-sir`.** Both are one division; changing the shipped SIR tool for that was
  not worth the churn.
- **Search phrases leave "age", "incidence" and "years" with their owners.** "years" stays with the YEARS algorithm
  for PE.

## Specified, not built

### 6. `herd-immunity-threshold` — Herd Immunity Threshold From R0 and Coverage Needed

**Build gate.** Fine 1993 (*Epidemiol Rev*) and Fine, Eames and Heymann 2011 (*Clin Infect Dis*) were not read; the
threshold and the imperfect-vaccine correction must be read there first.

### 9. `daly` — DALYs From Deaths and Prevalent Cases (YLL + YLD)

**Build gate.** The WHO global burden of disease methods paper was not read.

### 10. `sample-size-proportion` — Sample Size for a Proportion or a Mean

**Build gate.** Lwanga and Lemeshow 1991 (WHO) was not read; the WHO copy returned 403.

### 11. `sample-size-two-groups` — Sample Size to Compare Two Proportions or Two Means

**Build gate.** The same manual.

## Proof

- `test/unit/public-health-v1659.test.js`: every Lesson 3 example above, the 2000 standard's total, Florida and
  Alaska, the straddling-group and misaligned-stratum refusals.
- `test/unit/fuzz-tools.test.js` runs all seven modules; `test/mcp/mcp-search-relevance.test.js` has one probe per tool.
