# Spec Delta — inline-compute

## ADDED Requirements

### Requirement: Unambiguous numeric queries compute inline

For an allow-listed set of tiles, a query containing the tile's trigger tokens plus a complete,
unambiguous set of numeric inputs SHALL render the computed result directly in the dropdown:
the value with its canonical unit, labeled with the tool's name. The computation SHALL use the
same pure compute function the tile itself uses — client-side, deterministic, no network.

#### Scenario: BMI from a plain query
- **WHEN** a user types "bmi 180 lb 5'10"
- **THEN** the dropdown's top row shows the computed BMI (≈ 25.8 kg/m²) labeled as Body Mass
  Index
- **AND** the value equals what the BMI tile computes for the same inputs

### Requirement: Ambiguity never guesses

A template SHALL fire only when every required field parsed and no bare number could mean two
different units or fields. Weights require an explicit lb/kg; temperatures an explicit °F/°C;
heights accept explicitly-unit-marked forms (feet-inches, `in`, `cm`). Incomplete or ambiguous
parses SHALL render no inline value — the query falls through to normal ranked results, and
cleanly-parsed fields MAY still prefill the routed tile.

#### Scenario: Unitless numbers do not compute
- **WHEN** a user types "bmi 180 70" with no units
- **THEN** no inline result renders and the ranked results appear as usual

#### Scenario: Trigger word alone is a normal search
- **WHEN** a user types "bmi" with no numbers
- **THEN** the dropdown behaves exactly as name search does today

### Requirement: The inline result deep-links into the prefilled tile

Selecting the inline result SHALL open the tile with the parsed inputs prefilled via the
existing hash-state serialization, so the tile independently recomputes the same value and
shows its interpretation bands, citation, and unit toggles. The inline row never terminates the
interaction on its own.

#### Scenario: Prefill round-trip reproduces the value
- **WHEN** the user presses Enter on an inline BMI result
- **THEN** the BMI tile opens with weight and height prefilled
- **AND** the tile renders the same value shown inline

### Requirement: Inline compute is additive and allow-listed

The inline row SHALL be an additional option above the ranked results, never a replacement for
them. Only tiles on a curated allow-list, each with a reviewed parse template (trigger tokens,
field patterns, unit requirements), participate. There SHALL be no generic free-text argument
guessing for arbitrary tiles.

#### Scenario: Ranked results remain beneath the inline row
- **WHEN** an inline result renders
- **THEN** the ranked tile results still follow it in the same listbox

#### Scenario: Non-allow-listed tile never computes inline
- **WHEN** a query names a tile outside the allow-list with plausible numbers
- **THEN** no inline value renders; the query routes normally

### Requirement: Inline values are labeled and unit-explicit

Every inline result SHALL print its unit (canonical or US-customary per the calculator-units
spec) and the tool name it came from. Interpretation-band text SHALL NOT render inline; band
context belongs to the tile view alongside its citation.

#### Scenario: Unit always visible
- **WHEN** any inline result renders
- **THEN** the value carries an explicit unit label and the source tool's name
