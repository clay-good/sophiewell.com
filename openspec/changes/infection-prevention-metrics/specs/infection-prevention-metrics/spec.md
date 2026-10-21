# Spec Delta — infection-prevention-metrics

## ADDED Requirements

### Requirement: Standardized infection ratio with the NHSN minimum-precision rule

The catalog SHALL provide an `nhsn-sir` tool that divides observed infections by a predicted
count the reader enters from their NHSN report, and SHALL refuse to print a ratio when the
predicted count is below 1.0, in the NHSN SIR Guide's words. With a goal entered it SHALL report
the cumulative attributable difference, observed − (predicted × goal).

#### Scenario: A ratio above one
- **WHEN** observed is 5 and predicted is 2.365
- **THEN** the tool prints 2.114 and reads it as more infections observed than predicted

#### Scenario: Predicted below the minimum
- **WHEN** predicted is 0.8
- **THEN** no ratio is printed, the minimum-precision rule is quoted, and the three NHSN
  alternatives are listed

#### Scenario: The interval is not invented
- **WHEN** the exact interval formula has not been read in a source at build
- **THEN** the tool prints no interval and says the interval is on the NHSN report

### Requirement: Device utilization ratio and device-associated infection rate

The catalog SHALL provide `device-utilization-ratio` (device days ÷ patient days) and
`device-infection-rate` (infections ÷ device days × 1,000) for central lines, urinary catheters
and ventilators, each naming its denominator in the result and each refusing a numerator larger
than its denominator.

#### Scenario: Utilization ratio
- **WHEN** 310 central line days and 1,000 patient days are entered
- **THEN** the tool prints 0.31 and says it is for internal trending, not between-facility
  comparison

#### Scenario: Device days exceed patient days
- **WHEN** device days is 1,200 and patient days is 1,000
- **THEN** the tool refuses and names the two fields

### Requirement: Antimicrobial days per 1,000 days present

The catalog SHALL provide `antimicrobial-days-rate` using days present, not patient days, as
the denominator, with both definitions on screen, and SHALL NOT ship until the NHSN AU Option
chapter's definitions have been read and cited.

#### Scenario: Days present denominator
- **WHEN** 420 antimicrobial days and 3,000 days present are entered
- **THEN** the tool prints 140.0 per 1,000 days present and links the WHO DDD tile as a
  different metric

### Requirement: Hand hygiene compliance from observed opportunities

The catalog SHALL provide `hand-hygiene-compliance` computing actions ÷ opportunities × 100
overall and per WHO moment or role, showing the opportunity count beside every percentage, with
no target rate shipped, and SHALL NOT ship until the WHO manual's formula has been read.

#### Scenario: Small denominators are visible
- **WHEN** a role row has 2 opportunities and 2 actions
- **THEN** the row prints 100% with "2 of 2 opportunities" beside it

### Requirement: Outbreak attack-rate table from a line list

The catalog SHALL provide `outbreak-attack-rate-table` that reads a line list in the browser (or
typed 2×2 counts) and prints, per exposure, the attack rate among exposed and unexposed, the
risk ratio with the interval the live risk-ratio lib computes, and the overall and secondary
attack rates, with no value from the file entering a link.

#### Scenario: Food-specific attack rate
- **WHEN** 99 people ate the potato salad and 30 of them were ill
- **THEN** the exposed attack rate prints 30.3%

#### Scenario: Secondary attack rate
- **WHEN** 86 household members include 18 primary cases and 17 secondary cases
- **THEN** the secondary attack rate prints 25.0% with the denominator 68 shown

#### Scenario: A row with no unexposed persons
- **WHEN** every person was exposed to an item
- **THEN** the row prints its attack rate and leaves the ratio blank with the reason

### Requirement: Healthcare personnel exposure and return-to-work dates from the current CDC summary

The catalog SHALL provide `hcp-exposure-clock` and `hcp-illness-return-date`, computing calendar
dates from the windows in CDC's *Infection Control in Healthcare Personnel* summary
(updated 2026), citing that document and never the 1998 guideline, printing the page's updated
date, and failing closed when the weekly watch finds the page changed.

#### Scenario: Non-immune measles exposure
- **WHEN** a non-immune worker's first exposure is March 1 and last exposure March 3
- **THEN** exclusion runs from March 6 through March 24 (day 5 after first exposure through
  day 21 after last exposure, exposure day as day 0), and the "regardless of prophylaxis"
  sentence is shown

#### Scenario: Varicella with immune globulin
- **WHEN** VariZIG was given after a single exposure on a date
- **THEN** the exclusion ends on day 28, not day 21, and says why

#### Scenario: Pertussis, whichever comes first
- **WHEN** cough onset is day 0 and effective therapy started day 10
- **THEN** the return date is day 15 (5 days after therapy), earlier than day 21

#### Scenario: A condition that is not a date
- **WHEN** the condition is varicella and the lesions have not been marked dried and crusted
- **THEN** no return date prints and the unmet condition is named

#### Scenario: Immunity unknown
- **WHEN** immunity status is unknown
- **THEN** both windows print with the instruction to establish immunity first

#### Scenario: Source changed
- **WHEN** the weekly refresh finds the CDC page's updated date changed
- **THEN** both tools stop answering and say the source changed on that date
