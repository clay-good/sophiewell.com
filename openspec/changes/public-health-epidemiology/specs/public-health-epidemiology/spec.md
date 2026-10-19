# Spec Delta — public-health-epidemiology

## ADDED Requirements

### Requirement: Morbidity frequency measures with named multipliers

The catalog SHALL provide `incidence-prevalence`, computing incidence proportion, incidence rate
(person-time) and point or period prevalence from the reader's counts, with the multiplier a
visible control and the measure's nature (proportion, rate with a time unit) stated in the
result.

#### Scenario: Person-time rate
- **WHEN** 16 new cases are observed over 6,400 person-years with multiplier 1,000
- **THEN** the tool prints 2.5 per 1,000 person-years

#### Scenario: Cases exceed the population
- **WHEN** new cases are 20 and the population at start is 18
- **THEN** the tool refuses and names both fields

### Requirement: Mortality measures as the CDC defines them

The catalog SHALL provide `mortality-measures` with a measure picker that relabels the
numerator and denominator to the chosen measure's own terms, applies the CDC definition and
usual multiplier, and states whether the result is a rate, a ratio or a proportion.

#### Scenario: Case fatality
- **WHEN** 3 deaths occur among 555 incident cases
- **THEN** the tool prints 0.5% and calls it a proportion

#### Scenario: Death-to-case ratio
- **WHEN** 11,228 deaths and 143,497 new cases are entered with multiplier 100
- **THEN** the tool prints 7.82 per 100 and says deaths may come from earlier cases

#### Scenario: A source misprint is not reproduced
- **WHEN** the infant mortality example 28,025 deaths and 4,089,950 live births is entered
- **THEN** the tool prints 6.85 per 1,000 and its page notes the CDC example's own figure differs

### Requirement: Years of potential life lost from a line list or grouped data

The catalog SHALL provide `ypll` computing YPLL to a chosen end point from ages at death or from
age groups using the CDC midpoint rule, and the YPLL rate when a population under the end point
is given; a group straddling the end point SHALL be refused.

#### Scenario: Grouped data
- **WHEN** the CDC leukemia 2002 age-group table is entered with end point 65
- **THEN** the total is 117,033 and the rate against 252,755,000 is 0.5 per 1,000

#### Scenario: Straddling group
- **WHEN** a group 60-69 is entered with end point 65
- **THEN** the tool refuses that row and asks for it to be split

### Requirement: Attributable proportion, vaccine effectiveness and herd immunity threshold

The catalog SHALL provide `attributable-proportion` (exposed-group proportion now; the
population fraction only once Levin's formula has been read), `vaccine-effectiveness` (1 − RR
with the interval from `two-by-two-effect`), and `herd-immunity-threshold` (1 − 1/R0 and the
coverage needed for an imperfect vaccine, only once Fine's statement has been read), each with
its assumption printed and no R0 or benchmark table shipped.

#### Scenario: Vaccine effectiveness
- **WHEN** 18 of 152 vaccinated and 3 of 7 unvaccinated persons were cases
- **THEN** VE prints 72% with the risk ratio 0.28 and an interval

#### Scenario: Protective exposure
- **WHEN** the exposed risk is lower than the unexposed risk
- **THEN** the tool reports the preventive fraction, labeled, instead of a negative attributable
  proportion

#### Scenario: R0 at or below one
- **WHEN** R0 is 1
- **THEN** no threshold prints and the tool says the infection does not sustain itself

### Requirement: Observed-over-expected ratios share one function

The catalog SHALL provide `smr` computing observed ÷ expected, optionally deriving the expected
count from stratum person-time and reference rates, using the same function as `nhsn-sir`, and
SHALL print an interval only after the exact Poisson limits have been read in a source.

#### Scenario: Expected from strata
- **WHEN** three strata with person-years and reference rates are entered with 12 observed
- **THEN** the expected count is the sum of rate × person-years per stratum and the SMR is 12
  over that sum, with each stratum's contribution shown

### Requirement: Standardized rates, DALYs and sample sizes ship only from read sources with data as input

The catalog SHALL provide `direct-age-standardization`, `daly`, `sample-size-proportion` and
`sample-size-two-groups` only after their gated sources are read; standard populations, life
tables and disability weights SHALL be reader input or cited versioned files with the vintage
printed, never typed constants.

#### Scenario: Standard population mismatch
- **WHEN** the data strata and the standard population strata differ
- **THEN** the tool refuses and names the stratum that does not match

#### Scenario: Disability weight is the reader's
- **WHEN** a prevalent-case row has no disability weight
- **THEN** the row's YLD is not computed and the field is named; no default weight is used

#### Scenario: Sample size rounds up
- **WHEN** the proportion formula gives 384.16
- **THEN** the tool prints 385 and shows the z value it used
