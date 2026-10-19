# Spec Delta — transplant-allocation-scores

## ADDED Requirements

### Requirement: KDPI and EPTS reproduce the OPTN guides and ship only after they are read

The catalog SHALL provide `kdri-kdpi` and `epts-score` computing the OPTN formulas exactly as
the current guides print them, mapping through the year's published table loaded as versioned
data with its year on screen, reproducing each guide's worked example, and SHALL NOT ship either
tool until its guide has been read and transcribed with a recorded edition date.

#### Scenario: Guide's worked example
- **WHEN** the donor in the KDPI guide's example is entered
- **THEN** the KDRI and KDPI print the guide's own figures and the mapping year

#### Scenario: Mapping table changed
- **WHEN** the weekly watch finds the guide's hash changed
- **THEN** the tool stops answering and names the edition it last matched

#### Scenario: EPTS boundary
- **WHEN** the raw score maps to exactly 20%
- **THEN** the result prints 20% and the policy band sentence as read in policy 8

### Requirement: Ischemia intervals from labeled events

The catalog SHALL provide `ischemia-time-clock` printing the interval between each pair of
events the reader labels, in hours and minutes with both events named, refusing an end before
its start, leaving a missing interval blank, and claiming an interval is "cold ischemia time"
only under the OPTN definition once read.

#### Scenario: Interval across midnight
- **WHEN** cross-clamp is 22:40 on one day and reperfusion 06:10 the next
- **THEN** the interval prints 7 h 30 min

#### Scenario: End before start
- **WHEN** reperfusion is earlier than cross-clamp
- **THEN** the tool refuses and names both events

### Requirement: Donor-recipient size ratios without a threshold

The catalog SHALL provide `donor-recipient-size-match` printing weight, height and BSA ratios
and percent differences with unit toggles, reusing the live BSA formula, and stating that no
acceptable range is shipped.

#### Scenario: Ratios
- **WHEN** a 90 kg donor and a 60 kg recipient are entered
- **THEN** the weight ratio prints 1.50 and the difference +50%
