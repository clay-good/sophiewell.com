# Spec Delta — unit-operations-metrics

## ADDED Requirements

### Requirement: Nursing hours per patient day with the definitions on screen

The catalog SHALL provide `nursing-hppd` computing total and per-category hours per patient
day and skill mix from the reader's hours and patient days, printing which definition of hours
(worked or paid) and of patient days was used, with no benchmark shipped and the state-law
minimum tiles linked.

#### Scenario: HPPD and skill mix
- **WHEN** 1,200 RN hours, 400 LPN hours and 600 aide hours are entered against 250 patient
  days
- **THEN** total HPPD prints 8.80, RN HPPD 4.80, and RN skill mix 54.5%, each labeled with the
  definitions chosen

### Requirement: Nursing home staffing by the CMS Payroll-Based Journal method

The catalog SHALL provide `pbj-hours-per-resident-day` and `pbj-case-mix-adjusted-hours`
reproducing the CMS Five-Star Technical Users' Guide's reported-hours and case-mix adjustment
formulas with the PBJ job codes named, applying the guide's exclusion thresholds and naming any
that fires, and taking the facility's case-mix hours and the national average as inputs from
the CMS staffing file rather than deriving them.

#### Scenario: Reported hours per resident day
- **WHEN** 9,000 total nursing hours (codes 5 to 12) and an aggregate census of 2,700 resident
  days are entered for a quarter
- **THEN** the tool prints 3.33 hours per resident day and the job codes used

#### Scenario: Exclusion threshold
- **WHEN** total nurse staffing computes to more than 12 hours per resident day
- **THEN** the tool names the guide's exclusion in its words

#### Scenario: Case-mix adjustment
- **WHEN** reported 3.33, case-mix 3.10 and national average case-mix 3.60 are entered
- **THEN** adjusted hours print 3.87 with the formula shown

### Requirement: Staffing rating points and star from the published cut points

The catalog SHALL provide `nursing-home-staffing-star` applying Appendix Table A2 points and
Table 3 star ranges from the pinned guide edition to the reader's adjusted hours, turnover and
administrator departures, including the rescaling rule for a missing turnover measure, the
minimum-points rule for missing data, and the one-star exceptions; the edition SHALL be printed
and the tool SHALL stop answering when the watched guide changes.

#### Scenario: Points at a boundary
- **WHEN** adjusted RN hours are 0.934
- **THEN** that measure scores 90 points, and 0.933 scores 80

#### Scenario: Star range
- **WHEN** the total is 255 points
- **THEN** the star is 4, and 254 is 3

#### Scenario: Rescaling for a missing measure
- **WHEN** administrator turnover is missing and the other five measures total 300 of 350
- **THEN** the rescaled total is 300 × (380 ÷ 350) = 326, rounded, and the star is 5

#### Scenario: Missing data minimum
- **WHEN** RN turnover is marked missing or erroneous data
- **THEN** that measure scores 5 points and no rescaling applies to it

#### Scenario: Guide changed
- **WHEN** the weekly watch finds the guide's content hash changed
- **THEN** the tool stops answering and names the edition it last matched

### Requirement: Turnover, vacancy, FTE, occupancy and length of stay as defined arithmetic

The catalog SHALL provide `staff-turnover-rate`, `fte-from-hours`, `bed-occupancy-alos`,
`overtime-agency-share`, `unit-budget-variance` and `staffing-grid`, each printing its
definition and denominators, refusing zero denominators by name, flagging rather than hiding a
result above 100%, and quoting the CMS cost report's bed, bed-day and discharge definitions
where they apply.

#### Scenario: Average length of stay
- **WHEN** 2,400 inpatient days and 480 discharges including deaths are entered
- **THEN** ALOS prints 5.0 days and the page says newborns are excluded per the CMS definition

#### Scenario: Beds changed mid-period
- **WHEN** 20 beds for 10 days and 24 beds for 20 days are entered
- **THEN** bed days available is 680 and occupancy uses that denominator

#### Scenario: Flexible budget
- **WHEN** budgeted 1,000 patient days at 8 hours each with 400 fixed hours, and actual 1,100
  days used 9,500 hours
- **THEN** the flexible budget is 9,200 hours, the volume variance 800 unfavorable and the
  efficiency variance 300 unfavorable

#### Scenario: Staffing grid
- **WHEN** target HPPD is 8.0, shift length 12 and census 24
- **THEN** the row prints 96 staff hours per shift and 8 staff

### Requirement: Case mix index and ED throughput ship only with versioned or read sources

The catalog SHALL provide `case-mix-index` only with pasted weights or a fetched, manifested
weight file whose fiscal year is printed, and `ed-throughput-measures` only after the Hospital
OQR Specifications Manual's OP-18 and OP-22 definitions have been read and the manual version
pinned.

#### Scenario: Pasted weights
- **WHEN** weights 1.0, 1.5 and 2.0 are pasted
- **THEN** CMI prints 1.5000 over 3 discharges and no fiscal year is claimed

#### Scenario: Median, not mean
- **WHEN** arrival-to-departure minutes 100, 120 and 400 are entered
- **THEN** OP-18 prints 120 minutes
