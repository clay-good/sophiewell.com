# Spec Delta — occupational-employee-health

## ADDED Requirements

### Requirement: OSHA noise dose and TWA from exposure segments

The catalog SHALL provide `osha-noise-dose` computing per-segment reference durations, the
dose and the TWA by the 29 CFR 1910.95 Appendix A formulas, and stating whether the action
level (TWA 85 dBA or 50% dose), the PEL (100% dose) and the Table G-16 ceiling are reached,
citing each paragraph.

#### Scenario: Two segments
- **WHEN** 4 hours at 95 dBA and 4 hours at 85 dBA are entered
- **THEN** the dose prints 125% (4/4 + 4/16) and the TWA 91.6 dBA, with the PEL exceeded

#### Scenario: Action level only
- **WHEN** a dosimeter dose of 50% is entered
- **THEN** the TWA prints 85.0 dBA and the action level is marked reached, the PEL not

### Requirement: Standard threshold shift with the regulation's age correction

The catalog SHALL provide `osha-standard-threshold-shift` testing the average shift at 2000,
3000 and 4000 Hz against 10 dB in either ear, with and without the Appendix F age correction
from Tables F-1 and F-2 reproduced in full, printing the per-frequency corrections and the
(g)(8) follow-up sentences, and leaving the test blank when one of the three frequencies is
missing.

#### Scenario: Appendix F worked example
- **WHEN** the appendix's 32-year-old male audiograms (baseline at 27) are entered
- **THEN** the 4000 Hz shift prints 20 dB uncorrected and 17 dB corrected (corrections 10 and
  7)

#### Scenario: Threshold on the average
- **WHEN** shifts of 15, 10 and 5 dB at 2000, 3000 and 4000 Hz are entered in one ear
- **THEN** the average 10 dB meets the STS definition and the 21-day notice sentence prints

#### Scenario: Missing frequency
- **WHEN** 3000 Hz is blank
- **THEN** no STS result prints and the frequency is named

### Requirement: Lead standard monitoring and medical removal

The catalog SHALL provide `osha-lead-medical-removal` applying 29 CFR 1910.1025(j)(2) and (k)(1)
as read (2-month monitoring at or above 40 µg/100 g; removal at two results at or above 60;
return on two consecutive below 40), declining to evaluate the 50 µg/100 g average rule until
its exact window has been read, and `osha-lead-airborne-pel-shift` computing 400 ÷ hours.

#### Scenario: Monitoring frequency
- **WHEN** the last result is 42 µg/100 g
- **THEN** the next sample is due within 2 months and the rule is quoted

#### Scenario: Removal on confirmed sixty
- **WHEN** a periodic result of 61 and a follow-up of 60 are entered
- **THEN** removal is required under (k)(1)(i)(A)

#### Scenario: Shift-adjusted PEL
- **WHEN** a 10-hour shift is entered
- **THEN** the allowable TWA prints 40 µg/m³

### Requirement: Commercial driver blood pressure and hearing criteria

The catalog SHALL provide `fmcsa-bp-certification` applying the 49 CFR Part 391 Appendix A
stages and intervals with "and/or" staging and the advisory-criteria sentence on screen, and
`fmcsa-hearing-standard` applying the 5-foot whisper rule and the ISO-to-ANSI conversion,
stating the audiometric limit only after §391.41(b)(11) has been read.

#### Scenario: Stage by the higher value
- **WHEN** 150/105 is entered
- **THEN** the stage is 2 and a one-time 3-month certificate is the interval given

#### Scenario: Stage 3 after treatment
- **WHEN** a driver previously at 185/112 now reads 138/88 on tolerated treatment
- **THEN** the interval prints 6 months with recheck every 6 months

#### Scenario: ISO conversion
- **WHEN** ISO thresholds 50, 45 and 40 dB at 500, 1000 and 2000 Hz are entered
- **THEN** the ANSI values print 36, 35 and 31.5 and their average 34.2
