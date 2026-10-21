# Change: Unit and facility operations arithmetic for the nurse manager

**Status:** Built October 19, 2026: eleven tools shipped, recorded in [docs/spec-v1657.md](../../../docs/spec-v1657.md),
which lists every change from this proposal. Tool 11 (`ed-throughput-measures`) stays gated on the OQR manual.
**Audience:** the charge nurse and nurse manager, the nursing home director of nursing and
administrator, the house supervisor, and the quality analyst who turns a month's census and
payroll into the numbers a budget meeting asks for.
**Program index:** [docs/spec-v1654.md](../../../docs/spec-v1654.md).

## Why

The site is nurse-first. It serves the nurse at the bedside in depth and the nurse who runs the
unit almost not at all. A name search of the live catalog on October 19, 2026 found four
state-law staffing tiles (`nurse-staffing-ratio-check`, `nursing-home-staffing-check`, the
overtime and staffing-committee tiles), one pharmacy-finance tile that happens to compute
adjusted patient days, and nothing for: nursing hours per patient day, nursing home hours per
resident day the way CMS computes them, the CMS staffing star, FTEs from hours, occupancy,
average length of stay, average daily census, bed turnover, staff turnover and vacancy rate,
skill mix, overtime and agency share, or a volume-adjusted budget variance.

Every one of these is arithmetic over counts the manager already has, and the definitions that
matter are public: CMS's nursing home staffing method (Payroll-Based Journal hours over the MDS
census, with the case-mix adjustment formula and the star cut points printed in the Technical
Users' Guide, September 2026 edition, read in full for this spec) and the hospital cost report's
definitions of beds, bed days available, patient days and discharges.

## What changes

Twelve new tools in group H (Workflow & Documentation):

| # | id | Name | Source |
|---|---|---|---|
| 1 | `nursing-hppd` | Nursing Hours per Patient Day (HPPD) and Skill Mix | arithmetic identity; definitions stated on the page |
| 2 | `pbj-hours-per-resident-day` | Nursing Home Hours per Resident Day (CMS PBJ Method) | CMS Five-Star Technical Users' Guide, September 2026 (read) |
| 3 | `pbj-case-mix-adjusted-hours` | Case-Mix Adjusted Staffing Hours (CMS Formula) | same (read) |
| 4 | `nursing-home-staffing-star` | Nursing Home Staffing Rating Points and Star (CMS Cut Points) | same, Tables 3 and A2 (read) |
| 5 | `staff-turnover-rate` | Staff Turnover and Vacancy Rate | arithmetic identity; the CMS PBJ definition quoted for nursing homes (read) |
| 6 | `fte-from-hours` | FTEs From Paid or Worked Hours | arithmetic identity; CMS cost report FTE basis (build gate) |
| 7 | `bed-occupancy-alos` | Occupancy, Average Daily Census, Average Length of Stay and Bed Turnover | CMS Hospital Cost Report Data Dictionary (read) |
| 8 | `overtime-agency-share` | Overtime and Agency Share of Hours | arithmetic identity |
| 9 | `unit-budget-variance` | Volume-Adjusted Budget Variance (Flexible Budget) | arithmetic identity |
| 10 | `case-mix-index` | Case Mix Index From a Discharge List of DRG Weights | arithmetic identity; CMS Table 5 weights are reader input or a versioned file (build gate) |
| 11 | `ed-throughput-measures` | ED Throughput: Median Arrival-to-Departure and Left Without Being Seen (CMS OP-18, OP-22) | Hospital OQR Specifications Manual (build gate: not opened) |
| 12 | `staffing-grid` | Shift Staffing Grid From Census and Target HPPD | arithmetic identity |

## Why this passes the admission rule

Each tool takes the manager's counts and returns a figure with the formula shown. The CMS
tools are the published method, including the exact star cut points, with the edition printed
and watched. No tool ships a benchmark HPPD, a target ratio or a "right" staffing level: the
state-law tiles already answer the legal minimum, and this change links them rather than
restating them.

## What this does not do

- It does not read a PBJ submission file, an MDS file or a payroll export. (A later change may
  add file intake for PBJ; the tools here take the aggregates.)
- It does not predict a star: `nursing-home-staffing-star` applies the published cut points to
  the facility's own adjusted hours and turnover, and says the national averages used in the
  adjustment are the quarter's values from the CMS Provider Data Catalog, which the reader
  enters.
- It does not store rosters or schedules; the staffing grid is computed in the page and gone on
  reload, like every other tool.

## Impact

- New capability `unit-operations-metrics`.
- At build: twelve lib functions, renderers, META, MCP adapters, synonyms, count surfaces.
- `adjusted-patient-days` (live) is the natural neighbor of tools 1 and 7; cross-link.
