# Design — Unit and facility operations arithmetic

Read on October 19, 2026 unless marked "not opened". Numbers below are transcription targets;
re-read at build.

## Sources

| Source | Status |
|---|---|
| CMS, *Design for Care Compare, Nursing Home Five-Star Quality Rating System: Technical Users' Guide*, September 2026: Staffing Domain (reported hours, MDS census, exclusions, case-mix adjustment formula, turnover specification, points, Table 3 star ranges, Appendix Table A2 cut points) | PDF text extracted and read |
| CMS, *Hospital Provider Cost Report Data Dictionary* (data.cms.gov, 2022 edition): Number of Beds, Total Bed Days Available, Total Discharges | PDF text extracted and read |
| CMS Hospital Outpatient Quality Reporting Specifications Manual: OP-18, OP-22 | **not opened**; build gate |
| CMS cost report Worksheet S-3 Part II FTE basis (hours per FTE) | **not opened**; build gate |
| CMS IPPS Table 5 (MS-DRG relative weights) | **not opened**; reader input or a fetched versioned file |

## Tools

### 1. `nursing-hppd` — Nursing Hours per Patient Day (HPPD) and Skill Mix

**Input.** Period; patient days (or midnight census per day, summed); productive (worked)
nursing hours by category: RN, LPN/LVN, nurse aide; optionally non-productive hours; optionally
a target HPPD the unit uses.
**Compute.** HPPD = productive nursing hours ÷ patient days, total and per category. Skill mix =
RN hours ÷ total nursing hours × 100 (and each category's share). Against a target: variance in
hours = (actual HPPD − target HPPD) × patient days.
**Output.** Total and per-category HPPD to two decimals, skill mix, and the variance in hours
and in FTE-equivalents (using tool 6's basis) when a target is given.
**Source.** Arithmetic identity. The page states the two definitions the reader must settle
before the number means anything: whether "hours" are worked or paid, and whether "patient
days" are midnight census or an adjusted count. Both are reader choices shown in the result
("productive hours over midnight-census patient days"). No benchmark ships; the page links the
state-law tiles for the legal minimum.
**Rule.** Hours and patient days must both be present; a target HPPD of 0 is refused.

### 2. `pbj-hours-per-resident-day` — Nursing Home Hours per Resident Day (CMS PBJ Method)

**Input.** For the quarter: reported hours by PBJ job code group (RN: codes 5, 6, 7; LPN: 8, 9;
nurse aide: 10, 11, 12), full quarter and weekends separately; the aggregate MDS resident
census over the same days (sum of daily census, counting only days with at least one resident).
**Compute.** Reported hours per resident day = aggregate hours ÷ aggregate census, for total
nursing (codes 5 to 12), RN (5 to 7) and weekend total nursing. Apply the guide's exclusion
checks and name any that fires:
- total nurse staffing over 12 hours per resident day, full quarter or weekend;
- nurse aide staffing over 5.25 hours per resident day, full quarter or weekend;
- four or more days in the quarter with no RN hours (codes 5 to 7) on days with residents
  (a one-star scoring exception).
**Output.** The three ratios, the job codes each used, and any exclusion or exception the
guide would apply, in the guide's words.
**Source, read.** Technical Users' Guide, September 2026, "Staffing Domain": "The quarterly
reported nurse staffing hours per resident day are then calculated by dividing the aggregate
reported hours by the aggregate resident census. Only days that have at least one resident are
included in the calculations." Job codes from the turnover specification's definitions, which
the guide says match the staffing-level measures. The 12 and 5.25 thresholds from the exclusion
list.
**Verify at build.** The full exclusion list (the extract read shows the weekend lines twice and
the full-quarter lines may differ); read the list in the current edition.

### 3. `pbj-case-mix-adjusted-hours` — Case-Mix Adjusted Staffing Hours (CMS Formula)

**Input.** The facility's reported hours per resident day (from tool 2); the facility's
case-mix hours per resident day (from the CMS downloadable staffing file for the quarter); the
national average case-mix hours for the staff type and quarter (same file).
**Compute.** Hours Adjusted = (Hours Reported ÷ Hours Case-Mix) × Hours National Average
Case-Mix, for total nursing, RN and weekend total nursing.
**Output.** The adjusted figure beside the reported one, and the sentence that the case-mix
hours are CMS's own value for the facility (PDPM nursing CMI ratio × national mean reported
hours), which the tool does not derive because it needs the facility's daily MDS distribution.
**Source, read.** Guide, "Case-Mix Adjustment": the formula verbatim, and steps 1 to 6 of how
CMS computes case-mix hours. Footnote: the term "case-mix hours" replaced "expected hours" in
April 2019.
**Rule.** A case-mix hours value of 0 is refused; the three inputs must be the same staff type
and quarter (the page asks the reader to confirm the quarter).

### 4. `nursing-home-staffing-star` — Nursing Home Staffing Rating Points and Star (CMS Cut Points)

**Input.** Adjusted RN hours per resident day; adjusted total nurse hours; adjusted weekend
total nurse hours; RN turnover (%); total nurse turnover (%); administrator departures in the
measurement period (0, 1, 2 or more); for each turnover measure, whether it is missing (so the
rescaling rule applies) or was assigned the minimum for missing or erroneous data.
**Compute.** Points per Table A2, read in the September 2026 guide (cut points changed July 2024;
the guide says they are based on data through 2024 Q1):

| Measure | Points | Min | Max |
|---|---|---|---|
| Adjusted RN hours | 100 | 1.202 | or higher |
| | 90 | 0.934 | 1.201 |
| | 80 | 0.786 | 0.933 |
| | 70 | 0.678 | 0.785 |
| | 60 | 0.591 | 0.677 |
| | 50 | 0.513 | 0.590 |
| | 40 | 0.440 | 0.512 |
| | 30 | 0.368 | 0.439 |
| | 20 | 0.275 | 0.367 |
| | 10 | 0.000 | 0.274 |
| Adjusted total nurse hours | 100 | 5.070 | or higher |
| | 90 | 4.499 | 5.069 |
| | 80 | 4.151 | 4.498 |
| | 70 | 3.910 | 4.150 |
| | 60 | 3.692 | 3.909 |
| | 50 | 3.493 | 3.691 |
| | 40 | 3.293 | 3.492 |
| | 30 | 3.051 | 3.292 |
| | 20 | 2.722 | 3.050 |
| | 10 | 0.000 | 2.721 |
| Adjusted weekend total nurse hours | 50 | 4.464 | or higher |
| | 45 | 3.958 | 4.463 |
| | 40 | 3.668 | 3.957 |
| | 35 | 3.429 | 3.667 |
| | 30 | 3.233 | 3.428 |
| | 25 | 3.044 | 3.232 |
| | 20 | 2.862 | 3.043 |
| | 15 | 2.637 | 2.861 |
| | 10 | 2.354 | 2.636 |
| | 5 | 0.000 | 2.353 |
| RN turnover (%) | 50 | 0.000 | 20.000 |
| | 45 | 20.001 | 28.571 |
| | 40 | 28.572 | 35.714 |
| | 35 | 35.715 | 41.667 |
| | 30 | 41.668 | 44.444 |
| | 25 | 44.445 | 52.941 |
| | 20 | 52.942 | 60.000 |
| | 15 | 60.001 | 66.667 |
| | 10 | 66.668 | 80.000 |
| | 5 | 80.001 | 100.000 |
| Total nurse turnover (%) | 50 | 0.000 | 31.126 |
| | 45 | 31.127 | 37.500 |
| | 40 | 37.501 | 41.739 |
| | 35 | 41.740 | 45.679 |
| | 30 | 45.680 | 49.254 |
| | 25 | 49.255 | 53.425 |
| | 20 | 53.426 | 57.692 |
| | 15 | 57.693 | 62.791 |
| | 10 | 62.792 | 69.792 |
| | 5 | 69.793 | 100.000 |
| Administrator departures | 30 | 0 | 0 |
| | 25 | 1 | 1 |
| | 10 | 2 | or more |

Sum to a maximum of 380. When a turnover measure is missing (not assigned the minimum), rescale:
total points for available measures × (380 ÷ maximum possible points for those measures),
rounded to the nearest integer. Missing or erroneous staffing data on a turnover measure gives
the minimum (5 for the two nurse turnovers, 10 for administrator) with no rescaling. Star from
Table 3: under 155 is 1 star; 155 to 204 is 2; 205 to 254 is 3; 255 to 319 is 4; 320 to 380 is
5. Scoring exceptions that force 1 star: no staffing data submitted; four or more days with no
RN hours on days with residents; a failed or unanswered audit (reader-ticked).
**Output.** Points per measure, the total (and rescaled total when it applies), the star, the
guide edition and the sentence that cut points change by edition.
**Source, read.** Guide, "Staffing Domain" points paragraphs, "Rating Methodology", Table 3,
Appendix Table A2 and footnote 1 (July 2024 cut-point change).
**Watch.** The guide is reissued each quarter (January, April, July, September 2026 revision
notes are in the edition read). The tool pins the edition; the weekly refresh compares the
guide URL's content hash and the tool stops answering when it changes until the table is re-read
(spec-v1501 §2). Cut points are a dated constant with the edition on screen.
**Rule.** A value between two rows (for example RN hours 1.2015) cannot happen at three decimals
as the table is written; the tool rounds input to three decimals as CMS reports it and says so.

### 5. `staff-turnover-rate` — Staff Turnover and Vacancy Rate

**Input.** Separations in the period; average headcount (or start and end headcount); budgeted
positions; filled positions; optionally, for the CMS method, eligible employees and those with a
90-day gap.
**Compute.** Turnover = separations ÷ average headcount × 100 (average headcount = (start +
end) ÷ 2 when given that way). Vacancy rate = (budgeted − filled) ÷ budgeted × 100. CMS PBJ
turnover, when the reader has its inputs: employees with a 90-day gap that started in the period
÷ eligible employees (those who worked at least 120 hours in the 90 days from their first observed
workday) × 100.
**Output.** The rates with their definitions; for the CMS method, the sentence that it counts
agency staff and treats a returning employee as a new spell.
**Source.** Arithmetic identity for the general rates; the CMS definition read in the guide's
"Specifications for Staff Turnover Measures" (denominator: at least 120 hours in a 90-day period;
numerator: a gap of at least 90 consecutive days with no work; turnover date = last workday
before the gap; nursing homes with fewer than five eligible nurses excluded).
**Rule.** Separations above average headcount is allowed (turnover over 100% happens) but
flagged; vacancy with 0 budgeted positions is refused.

### 6. `fte-from-hours` — FTEs From Paid or Worked Hours

**Input.** Hours in the period (paid or worked, the reader's choice); the period (a pay period
of 80 hours, a month, a quarter, a year); the FTE basis (hours per FTE per year; the control
offers 2,080 as the common basis and lets the reader change it).
**Compute.** FTE = hours ÷ (basis × period fraction of a year). Reverse: hours needed for a
given FTE. From a target HPPD: FTEs needed = target HPPD × patient days ÷ period hours per FTE,
then ÷ productive share when a non-productive percentage is given.
**Output.** FTEs to two decimals with the basis printed.
**Build gate.** The CMS cost report's FTE basis (Worksheet S-3 Part II instructions) was not
opened; the page cites it only once read. Until then the basis is reader input with 2,080
offered as a convention, not a sourced figure.

### 7. `bed-occupancy-alos` — Occupancy, Average Daily Census, Average Length of Stay and Bed Turnover

**Input.** Beds available (or bed days available directly, for a period with a bed change);
days in the period; inpatient days; discharges including deaths; optionally newborn figures,
excluded by the CMS definition.
**Compute.** Bed days available = beds × days (or the sum over sub-periods when beds changed).
Occupancy = inpatient days ÷ bed days available × 100. Average daily census = inpatient days ÷
days. Average length of stay = inpatient days ÷ discharges. Bed turnover = discharges ÷ beds.
**Output.** The four figures with the definitions they used.
**Source, read.** CMS *Hospital Provider Cost Report Data Dictionary*: "Number of Beds" (an
adult, pediatric, birthing-room or newborn ICU bed maintained for lodging inpatients; labor
room, PACU, ED, outpatient and similar beds are not beds); "Total Bed Days Available" (beds ×
days in the period, summed across sub-periods when the count changed); "Total Discharges"
(including deaths, excluding newborns and DOAs; a discharge is a formal release). The page
quotes these so the reader counts beds the way the cost report does.
**Rule.** Inpatient days above bed days available is flagged as over 100% occupancy (it can
happen with observation or overflow beds) with the dictionary's bed definition shown.

### 8. `overtime-agency-share` — Overtime and Agency Share of Hours

**Input.** Regular hours; overtime hours; agency hours; optionally dollar rates per hour for
each.
**Compute.** Overtime share = overtime ÷ (regular + overtime) × 100; agency share = agency ÷ all
worked hours × 100; premium cost = Σ hours × (rate − regular rate) when rates are given.
**Output.** The shares and the premium, with the denominators shown.
**Source.** Arithmetic identity; no benchmark ships.

### 9. `unit-budget-variance` — Volume-Adjusted Budget Variance (Flexible Budget)

**Input.** Budgeted volume (patient days or visits); actual volume; budgeted hours (or dollars);
actual hours (or dollars); optionally the fixed portion of the budget.
**Compute.** Flexible budget = fixed + (variable budget per unit × actual volume). Volume
variance = flexible − static budget. Efficiency (rate) variance = actual − flexible. Total
variance = actual − static. Per-unit figures (hours per patient day budgeted vs actual).
**Output.** The three variances, each signed and labeled favorable or unfavorable for a cost,
and the per-unit comparison.
**Source.** Arithmetic identity (the standard flexible-budget decomposition). No source number
ships.
**Rule.** Actual volume of 0 gives no per-unit figure and says so.

### 10. `case-mix-index` — Case Mix Index From a Discharge List of DRG Weights

**Input.** A pasted list of MS-DRG relative weights, one per discharge (or DRG code with a count,
resolved against a versioned weight file when one is bundled); optionally a payment rate to show
the weighted sum.
**Compute.** CMI = Σ weights ÷ number of discharges. With a rate: expected payment = CMI × rate ×
discharges (operating component only; the page says what it leaves out).
**Output.** CMI to four decimals, the discharge count, and the weight file's fiscal year when one
was used.
**Build gate.** CMS IPPS Table 5 (the weights) is reissued every fiscal year. It ships only as a
fetched, hashed, manifested file with its fiscal year on screen (spec-v1614), or the reader pastes
weights. Not opened for this spec.

### 11. `ed-throughput-measures` — ED Throughput: Median Arrival-to-Departure and Left Without Being Seen (CMS OP-18, OP-22)

**Input.** A pasted list of arrival-to-departure minutes for discharged ED patients (OP-18), or
the file from the department's system with the two time columns mapped; for OP-22, the count of
patients who left without being seen by a physician, APN or PA and the ED volume.
**Compute.** OP-18 = the median of the minutes (the measure is a median, not a mean; strata as
the manual defines them). OP-22 = left without being seen ÷ ED volume × 100.
**Output.** The median in minutes with the count behind it, and the OP-22 percentage.
**Build gate.** The Hospital OQR Specifications Manual (current version) was not opened; read
the OP-18 population, strata (OP-18a, b, c, d), arrival-time definition and OP-22 numerator and
denominator before building, and pin the manual version with its encounter-date range.

### 12. `staffing-grid` — Shift Staffing Grid From Census and Target HPPD

**Input.** Target HPPD (the unit's own, or the legal minimum from the linked state tiles);
shift length (8 or 12 hours); the census bands to show (for example 10 to 30 in steps of 2); the
RN share of the target when a skill mix is wanted.
**Compute.** For each census: staff hours needed per shift = target HPPD × census × (shift ÷ 24);
staff per shift = hours ÷ shift length, shown unrounded and rounded up; RN count = staff × RN
share, rounded up.
**Output.** A grid, one row per census value, printable, with the formula on the page.
**Source.** Arithmetic identity. The page says a legal minimum ratio, where one applies, is the
floor regardless of the grid, and links `nurse-staffing-ratio-check`.
**Rule.** A target HPPD of 0 or a shift length outside 1 to 24 hours is refused.

## Decisions

**D1 — the CMS method is transcribed exactly and dated.** Tools 2 to 4 are the published method
with its edition on screen and a watch on the guide. They never estimate a value CMS computes
from data the facility cannot see (the national averages, the facility's case-mix hours): those
are inputs from the CMS files, named by file.

**D2 — no benchmarks.** No HPPD target, turnover norm or occupancy goal ships. Legal minimums
live in the state tiles and are linked.

**D3 — definitions are on screen.** Every ratio prints which definition of "hours" and "days" it
used, because the same word means three things across facilities.

**D4 — build-gated items ship last.** Tools 6, 10 and 11 wait for their documents.

## Risks

- **Cut-point drift.** The Five-Star guide changes quarterly. The watch and the printed edition
  cover it; a stale table fails closed.
- **A star read as a prediction.** The page says the tool applies published cut points to the
  reader's numbers and that CMS's own inputs (census, case-mix hours) may differ from what the
  reader entered.
