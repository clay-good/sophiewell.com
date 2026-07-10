# Spec Delta — calculator-units

## ADDED Requirements

### Requirement: US-customary units are the default display unit

Every calculator input that offers a choice between a US-customary unit and a metric/SI unit
SHALL pre-select the US-customary option when a tile is opened fresh (no deep-link hash and no
remembered input). US customary is the happy path; the user reaches metric with a single change
of the unit `<select>`.

This applies to every field with a genuine US/metric pair. Inputs with no such pair (blood
pressure in mmHg, oxygen saturation, heart rate, points, percentages, mL, mEq/L, mOsm) are out
of scope and are not altered.

#### Scenario: Weight defaults to pounds
- **WHEN** a user opens any tile with a weight input
- **THEN** the weight unit `<select>` shows **lb** selected by default
- **AND** the metric option **kg** remains available in the same `<select>`

#### Scenario: Height defaults to inches
- **WHEN** a user opens any tile with a height input
- **THEN** the height unit `<select>` shows **in** (inches) selected by default
- **AND** the metric option **cm** remains available in the same `<select>`

#### Scenario: Temperature defaults to Fahrenheit
- **WHEN** a user opens any tile with a temperature input
- **THEN** the temperature unit `<select>` shows **°F** selected by default
- **AND** the metric option **°C** remains available in the same `<select>`

#### Scenario: US-conventional labs stay US-default
- **WHEN** a user opens a tile whose lab input is reported in a US-conventional unit
  (glucose, BUN, calcium, magnesium, bilirubin, creatinine in mg/dL; albumin in g/dL)
- **THEN** that US-conventional unit is the default-selected option
- **AND** the SI alternate (mmol/L, µmol/L, g/L) remains available

### Requirement: The default flip does not change the compute unit

Changing the default-selected display unit SHALL NOT change the unit any compute function
consumes. Every value entered in a US-customary unit SHALL be converted to the calculator's
canonical unit at the input boundary (via `unitNum`) before it reaches the compute. No formula,
validated threshold, or interpretation band is edited by this change.

#### Scenario: Pounds entry is converted to kilograms for the formula
- **WHEN** the weight field defaults to lb and the user enters `154`
- **THEN** the compute receives `~69.85` kg (154 × 0.45359237), not `154`
- **AND** the result is identical to entering `69.85` with the unit set to kg

#### Scenario: Weight-based dosing still computes per kilogram
- **WHEN** a mg/kg or mL/kg dosing tile displays weight in lb
- **THEN** the per-kilogram formula still computes on the kilogram-converted weight
- **AND** no dose or rate value changes versus the pre-flip metric-default behavior

#### Scenario: Fahrenheit entry preserves Celsius thresholds
- **WHEN** a score with a Celsius temperature band displays °F and the user enters a °F value
- **THEN** the value is converted to °C before the band comparison
- **AND** the band boundaries (e.g. `>38 °C`, `<36 °C`) are unchanged

### Requirement: Metric remains one selection away on every US-defaulted field

Every field whose default is flipped to US customary SHALL keep its metric/SI option in the same
unit `<select>`. No metric affordance is removed.

#### Scenario: Switching a field back to metric
- **WHEN** a user changes a US-defaulted unit `<select>` to its metric option
- **THEN** the input is interpreted in the chosen metric unit and converted to canonical as before

### Requirement: Built-in examples and deep links reproduce byte-identically

Applying a tile's built-in example, or opening a deep-link hash, SHALL reproduce the documented
result exactly, unaffected by the changed display default. Because `META.example.fields` encode
inputs in each calculator's canonical unit and do not list the unit selects, applying an example
SHALL first reset every unit `<select>` on the tile to its canonical option, then fill the
example fields. An explicit unit value carried in an example or a deep-link hash SHALL win over
that reset.

#### Scenario: Test-with-example reproduces the documented result
- **WHEN** a user clicks "Test with example" on a tile whose weight now defaults to lb
- **THEN** the weight unit `<select>` is reset to its canonical unit (kg) before the example
  value is filled
- **AND** every numeric token of `example.expected` renders, exactly as before this change

#### Scenario: Existing deep link still reproduces
- **WHEN** a user opens a deep-link hash that encodes an explicit `*-unit` value
- **THEN** the unit `<select>` is set from the hash and the original computation reproduces

### Requirement: MCP round-trips are unaffected

The MCP compute path SHALL be untouched by this change. MCP adapters feed `example.fields`
straight to canonical-unit computes and never consult the browser unit toggle, so `example.fields`
values, `example.expected` results, and all adapter definitions remain in canonical units.

#### Scenario: Adapter round-trip is byte-identical after the flip
- **WHEN** the MCP catalog check runs each adapter's `example.fields` through its `compute`
- **THEN** every documented `example.expected` number is reproduced, identical to before the change

### Requirement: Coverage — every unit-bearing tool honors the US default

Every tool with a numeric input that has a US/metric distinction SHALL present a unit toggle that
defaults to the US-customary option. Tiles still rendering a metric-only unit-bearing input SHALL
gain the appropriate toggle so that no tool defaults a US user into metric.

#### Scenario: A previously metric-only field gains a US-default toggle
- **WHEN** a tile has a weight, height, or temperature input with no unit toggle
- **THEN** the build adds the shared unit toggle to that field, defaulting to the US unit

### Requirement: Unit-pinned analytes are exempt

Analytes whose source literature reports them inconsistently, and which the catalog therefore
pins to a single labeled unit (e.g. HALP `g/L`, per spec-v231), SHALL remain pinned and SHALL NOT
gain a US/metric toggle. The US-default rule applies only to fields that genuinely offer a
US/metric pair.

#### Scenario: A pinned analyte keeps its fixed unit
- **WHEN** a tile pins an analyte to a single unit for reproducibility
- **THEN** no unit toggle is added and the pinned, labeled unit is unchanged
