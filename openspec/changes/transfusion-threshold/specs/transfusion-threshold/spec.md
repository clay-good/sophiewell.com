# Spec Delta — transfusion-threshold

## ADDED Requirements

### Requirement: Restrictive transfusion threshold decision aid

The catalog SHALL provide a `transfusion-threshold` calculator that, given a hemoglobin value
and a patient population, reports the AABB 2023 restrictive transfusion threshold for that
population and whether the entered hemoglobin sits below it. This answers the routine bedside
question "is this hemoglobin low enough to transfuse?", which the existing transfusion tiles
(all massive-transfusion scores or pediatric volume calculators) do not.

The tile SHALL be a per-patient computation, not a static reference table (spec-v29 §3): the
decision string names the entered value, the population threshold, and the resulting action.

#### Scenario: Hemoglobin below the population threshold
- **WHEN** a stable hospitalized adult has a hemoglobin below the restrictive threshold
- **THEN** the tile reports the threshold and states that transfusion is indicated per AABB 2023

#### Scenario: Hemoglobin at or above the threshold
- **WHEN** the entered hemoglobin is at or above the population threshold
- **THEN** the tile states the restrictive strategy applies and transfusion is not indicated on
  the number alone

#### Scenario: A population with no numeric recommendation
- **WHEN** the selected population is one for which AABB makes no numeric threshold
  recommendation (acute coronary syndrome)
- **THEN** the tile SHALL report that no restrictive-threshold recommendation exists for that
  population and defer to symptoms and specialist input
- **AND** SHALL NOT emit a fabricated numeric threshold

#### Scenario: Symptomatic anemia override
- **WHEN** the symptomatic-anemia input is set
- **THEN** the tile annotates that active symptoms can justify transfusion above the numeric
  threshold (clinical-judgment override) without lowering the reported threshold
