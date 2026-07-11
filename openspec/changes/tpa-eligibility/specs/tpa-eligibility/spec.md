# Spec Delta — tpa-eligibility

## ADDED Requirements

### Requirement: IV alteplase eligibility decision aid

The catalog SHALL provide a `tpa-eligibility` calculator that, given the time from last known
well and a checklist of the AHA/ASA 2026 inclusion/exclusion criteria, reports whether the
patient meets the IV alteplase eligibility checklist for that time window. This answers the
routine stroke-team question "is this patient a thrombolysis candidate?", which the existing
stroke tiles (all severity, risk, or prognosis scores) do not.

The tile SHALL be a per-patient computation, not a static reference table (spec-v29 §3): the
verdict names the selected time window, the criteria that fired, and the resulting eligibility.

The tile SHALL report a guideline-checklist result and SHALL NOT emit a treatment order, a dose
as an instruction, or an "administer alteplase" directive; the treatment decision stays with the
stroke team (spec-v11 §5.3).

#### Scenario: Eligible in the ≤ 3 hour window
- **WHEN** the ≤ 3 hour window is selected and no absolute exclusion is checked
- **THEN** the tile reports that no absolute contraindication is met and the patient meets the
  AHA/ASA 2026 IV alteplase checklist, deferring the treatment decision to the stroke team

#### Scenario: An absolute exclusion is present
- **WHEN** one or more absolute exclusion criteria are checked
- **THEN** the tile reports that the patient is excluded and names the criteria that fired

#### Scenario: The extended window adds relative exclusions
- **WHEN** the 3–4.5 hour window is selected and an ECASS-III relative exclusion (age > 80,
  NIHSS > 25, oral anticoagulant use, prior stroke plus diabetes) is checked
- **THEN** the tile reports it as a relative contraindication to weigh with the stroke team, not
  as an absolute bar

#### Scenario: Outside the alteplase window
- **WHEN** the time from last known well is greater than 4.5 hours
- **THEN** the tile SHALL report that the patient is outside the IV alteplase window and point to
  the imaging-based / thrombectomy pathway
- **AND** SHALL NOT emit an eligibility verdict for alteplase
