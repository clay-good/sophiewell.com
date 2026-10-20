# Spec Delta — laboratory-quality-control

## ADDED Requirements

### Requirement: Westgard multirule evaluation that names unevaluable rules

The catalog SHALL provide `westgard-multirule` evaluating 1_2s (warning), 1_3s, 2_2s, R_4s,
4_1s and 10_x across two control levels and the previous runs the reader supplies, reporting
accept or reject with the rule, the results that fired it and the error type, and reporting any
rule short of its required run count as not evaluable rather than passed; it SHALL NOT ship
until the 1981 paper's rule statements have been read.

#### Scenario: R_4s within a run
- **WHEN** level 1 is at +2.3 SD and level 2 at −2.1 SD in the same run
- **THEN** the run is rejected under R_4s with random error indicated

#### Scenario: 2_2s across runs
- **WHEN** level 1 was at +2.2 SD last run and +2.4 SD this run
- **THEN** the run is rejected under 2_2s with systematic error indicated

#### Scenario: Warning only
- **WHEN** one result is at +2.1 SD and no rejection rule fires
- **THEN** the run is accepted with the 1_2s warning shown

#### Scenario: Not enough runs
- **WHEN** only two previous runs are entered
- **THEN** 4_1s and 10_x are reported as not evaluable with the run count each needs

### Requirement: Control statistics from a series

The catalog SHALL provide `levey-jennings-limits` computing mean, sample SD, CV and ±1, ±2,
±3 SD limits from a pasted series read in the browser, noting when the count is below the
reader's minimum and naming a non-numeric row by line.

#### Scenario: Limits from twenty results
- **WHEN** twenty numeric results are pasted
- **THEN** the mean, SD, CV and six limits print with the count 20

### Requirement: CLIA proficiency-testing acceptance from the read CFR tables

The catalog SHALL provide `clia-pt-acceptance` applying the 42 CFR 493.931 and 493.941
criteria as read (the greater of percent and unit where the rule says so), quoting the CFR row,
listing only read analytes, printing the eCFR date, and stopping when the watched section
changes.

#### Scenario: Unit limit wins at a low target
- **WHEN** creatinine target is 1.0 mg/dL and the response is 1.15
- **THEN** the allowable deviation is ±0.2 mg/dL (greater than 10%) and the response is
  acceptable

#### Scenario: Percent limit wins at a high target
- **WHEN** creatinine target is 4.0 mg/dL and the response is 4.45
- **THEN** the allowable deviation is ±0.4 mg/dL (10%) and the response is not acceptable

#### Scenario: A fixed-unit analyte
- **WHEN** potassium target is 4.0 mmol/L and the response is 4.35
- **THEN** the allowable deviation is ±0.3 mmol/L and the response is not acceptable

#### Scenario: Section changed
- **WHEN** the weekly eCFR comparison finds §493.931 changed
- **THEN** the tool stops answering for chemistry analytes and says so

### Requirement: The CLIA limit as a goal for the live sigma metric

`clia-pt-acceptance` SHALL print the limit at a reader-entered decision level as a percent and link
`sigma-metric` with it as the allowable error. A separate total-error tool SHALL NOT be added:
`sigma-metric` and `biological-variation-goals` already cover it.

#### Scenario: Glucose at 100 mg/dL
- **WHEN** glucose is chosen with a decision level of 100 mg/dL
- **THEN** the limit prints 8% (the greater of 8% and 6 mg/dL at that level) and the link opens
  `sigma-metric` with 8 as the allowable error

### Requirement: Event score and calibration verification ship after their sources are read

The catalog SHALL provide `pt-event-score` and `calibration-verification` with their arithmetic as
designed, the pass/fail verdicts only after 42 CFR 493.803 and 493.1255 have been read, and the
laboratory's own acceptance criterion as reader input.

#### Scenario: Event score without a verdict
- **WHEN** 23 of 25 responses are acceptable and §493.803 has not been read
- **THEN** the event score prints 92% and no pass or fail is claimed

### Requirement: Turnaround time as a percentile

The catalog SHALL provide `turnaround-time-percentile` printing median, a chosen nearest-rank
percentile, mean, count and share within the reader's target from a pasted list, naming which
two timestamps bound the interval.

#### Scenario: Ninetieth percentile
- **WHEN** ten turnaround times are pasted and the 90th percentile is chosen
- **THEN** the ninth-ranked value prints as the 90th percentile under the nearest-rank rule
