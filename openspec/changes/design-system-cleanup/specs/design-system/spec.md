# Spec Delta — design-system

## ADDED Requirements

### Requirement: A single design doc governs every tool's presentation

`docs/design.md` SHALL be the authoritative source for tokens, the tool-view structure,
the component vocabulary, and the interaction and accessibility rules. Every tile and view
SHALL conform to it. A view that disagrees with `docs/design.md` is non-conforming and SHALL
be corrected rather than the doc. `CONTRIBUTING.md` and `openspec/project.md` SHALL reference it.

#### Scenario: A new tile follows the doc
- **WHEN** a tile is added or edited
- **THEN** it reuses the shared components and tokens defined in `docs/design.md`
- **AND** it introduces no per-tile stylesheet or inline style

### Requirement: Presentation values come from tokens

No view, component rule, or inline style SHALL hard-code a color, radius, or spacing value.
Color, radius, and spacing SHALL be CSS custom properties defined once in `styles.css` and
overridden for the light theme on the same names. Any new colored text or surface SHALL meet
WCAG AA contrast in both the dark (default) and light themes.

#### Scenario: Off-scale value is rejected
- **WHEN** the conformance probe scans `styles.css` and the views
- **THEN** it reports any hex, px radius, or raw spacing value that is not a token
- **AND** the no-inline-style guard reports any `style=` attribute emitted by a view

### Requirement: The file-reader archetype uses the dropzone card, not a raw input

Every tile that accepts a local file SHALL present the shared `.dropzone` card — a drag-and-drop
surface with a visible hint, a `drop-active` state, and a removable file-chip list — wrapping the
native file input (which remains the accessible control). No tile SHALL expose a bare, unstyled
`<input type="file">`. The worker-based parse, the "files stay in this tab" guarantee, and the
50 MB limit SHALL be unchanged.

#### Scenario: Upload tile renders a dropzone
- **WHEN** a user opens an X12 or CSV reader tile
- **THEN** the file control is a styled dropzone card, not the native `Choose Files` button
- **AND** dragging a file onto it shows the drop-active state
- **AND** the parsed result is identical to before the migration

### Requirement: A result band renders as a status chip with a text label

When a calculator outputs an interpretation band, the answer card MAY render a status chip
naming that band. The chip's severity SHALL be conveyed by both color and a text label; it
SHALL NOT be distinguishable by color alone. The band value SHALL be the one the tile already
computes — this requirement adds no threshold and changes no computed value.

#### Scenario: Band shows as a labeled chip
- **WHEN** a tile computes a "high risk" band
- **THEN** the answer card shows a status chip reading "High risk" in the severity color
- **AND** a reader who cannot perceive the color still reads the band from the text

#### Scenario: No band, no chip
- **WHEN** a tile outputs a bare number with no interpretation band
- **THEN** no status chip renders

### Requirement: Short exclusive choices use a segmented control; loading and empty states are explicit

A set of 2 to 4 mutually exclusive options that fits one row at 320px MAY render as a
segmented control with radiogroup semantics; longer or open-ended lists SHALL remain a
`<select>`. An asynchronous file parse SHALL show a determinate progress or skeleton state;
a synchronous calculator SHALL NOT show a loading state. A zero-result or empty region SHALL
render an empty state with a one-line next step rather than blank space. These SHALL preserve
the canonical-first-option unit invariant and the `answer-said-once` and one-disclaimer
guarantees.

#### Scenario: Binary choice is a segmented control
- **WHEN** a tile asks for sex as male/female
- **THEN** it MAY present a two-option segmented control that announces the selected option
- **AND** the value fed to the compute and the MCP adapter is unchanged

#### Scenario: File parse shows determinate progress
- **WHEN** a reader parses a multi-megabyte file in the worker
- **THEN** a determinate progress or skeleton state shows until results are ready
- **AND** a synchronous calculator shows no loading state

### Requirement: The cleanup changes presentation only

No requirement in this change SHALL alter a computed value, a validated threshold, a citation,
an example, an MCP adapter, the catalog count, or the deep-link hash format. Byte-identical
reproduction of every `META.example` and deep-link SHALL hold before and after each wave.

#### Scenario: Numbers are unchanged after migration
- **WHEN** any tile is migrated to the modern components
- **THEN** its example and every deep-link hash reproduce the same result as before
- **AND** the MCP round-trip for its adapter is unchanged
