# spec-v1657 — Unit and facility operations arithmetic

> Status: **SHIPPED (2026-10-19)**: eleven tools. One more is specified and gated (below).

The build of the [unit-operations-metrics](../openspec/changes/unit-operations-metrics/proposal.md) change
proposed in [spec-v1654](spec-v1654.md). The CMS numbers were read on October 19, 2026 in the *Nursing Home
Five-Star Quality Rating System: Technical Users' Guide*, September 2026 (PDF sha256 `5b071101…a41239c`), and
the *Hospital Provider Cost Report Data Dictionary* (updated March 2024).

## What shipped

| Tool | What it answers | Source |
|---|---|---|
| `nursing-hppd` | Nursing hours per patient day, by category, skill mix, hours over or under a target | identity |
| `pbj-hours-per-resident-day` | Reported hours per resident day by the PBJ method, the six exclusions, the four-day RN exception | Five-Star guide, Staffing Domain |
| `pbj-case-mix-adjusted-hours` | Reported ÷ case-mix × national average | Five-Star guide, Case-Mix Adjustment |
| `nursing-home-staffing-star` | Points for the six measures, rescaling, the star, the one-star exceptions | Five-Star guide, Table 3 and Table A2 |
| `staff-turnover-rate` | Turnover, vacancy, and CMS's spells-ended-in-a-90-day-gap measure | identity; Five-Star guide |
| `fte-from-hours` | FTEs from period hours, or by the cost report's sample weeks ÷ 160 or ÷ 80 | cost report data dictionary |
| `bed-occupancy-alos` | Occupancy, average daily census, length of stay, bed turnover, with a bed change | cost report data dictionary |
| `overtime-agency-share` | Overtime and agency shares, and the premium over regular pay | identity |
| `unit-budget-variance` | Flexible budget, spending, volume and total variances | identity |
| `case-mix-index` | CMI from pasted MS-DRG weights | identity |
| `staffing-grid` | Staff per shift for each census at a target HPPD | identity |

## The gates, as read

| Gate | Answer |
|---|---|
| 1.1 The Five-Star guide | Still the September 2026 edition. Table A2 and Table 3 match the design row for row. The exclusion list has **six** criteria: the design had four and missed "total nurse staffing ... is zero", over all days and over weekends. |
| 1.2 The FTE basis | The cost report data dictionary defines "FTE - Employees on Payroll" by sample weeks: hours in the first week of each quarter ÷ 160, or of the first and seventh months ÷ 80. That method ships beside the period method. |
| 1.3 IPPS Table 5 | Not bundled. The design allowed pasted weights, so `case-mix-index` takes them and says which table they come from. |
| 1.4 OQR manual (OP-18, OP-22) | Not read: QualityNet's manual page is a script-rendered shell with no document text. Tool 11 stays gated. |

## What changed from the proposal

- **The six exclusions, not four**, as above.
- **The star asks why a turnover measure is missing.** A blank turnover is not assumed: "not reported" (fewer
  than five eligible nurses, no eligible administrator) rescales, "missing or erroneous data" gets the lowest
  points, as the guide separates them.
- **The case-mix tool takes one staff type at a time**, chosen on the page, rather than three at once.
- **The budget tool has no search phrases.** Every phrase tried took the word "budget" or "flexible" from an older
  tool; it is found by its name.

## Specified, not built

### 11. `ed-throughput-measures` — ED Throughput: Median Arrival-to-Departure and Left Without Being Seen (CMS OP-18, OP-22)

**Build gate.** The Hospital OQR Specifications Manual was not read: QualityNet's manual page returned a
script-rendered shell with no document text on October 19, 2026. The OP-18 population, its strata and arrival
time, and the OP-22 numerator and denominator have to be read there before the tool states them.

## Proof

- `test/unit/unit-operations-v1657.test.js`: every Table A2 boundary row, every Table 3 star boundary, the
  rescaling arithmetic (260 × 380 ÷ 330 = 299), lowest points not rescaled, all six exclusions, the four-day RN
  exception, the 160 and 80 divisors, a mid-period bed change, and the flexible budget split.
- `test/unit/fuzz-tools.test.js` runs all eleven modules; `test/mcp/mcp-search-relevance.test.js` has one probe per tool.
