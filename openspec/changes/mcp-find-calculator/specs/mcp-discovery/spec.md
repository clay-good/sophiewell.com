# Spec Delta — mcp-discovery

Supersedes the spec-v183 §2.2 "exactly three dispatch tools" clause: the surface becomes four
fixed tools. The rationale it protected — no per-calculator tool flood, stdio-only, stateless,
deterministic, no AI — remains in force and is restated below.

## ADDED Requirements

### Requirement: A ranked natural-language discovery tool exists

The MCP server SHALL expose a fourth tool, `find_calculator`, taking `{ query, limit?, group?,
specialty? }` and returning the top-ranked candidate calculators for a natural-language query.
Each candidate row SHALL carry `id`, `name`, `group`, `specialties`, `summary`, and a short
`why` explaining the match (matched synonym phrase or driving tokens). The default `limit` is
small (5) with a hard cap, keeping responses lightweight; `describe_calculator` remains the
detail hop.

#### Scenario: A natural query finds the canonical tile
- **WHEN** a client calls `find_calculator` with query "stroke risk afib"
- **THEN** the first candidate is `chads` (CHA2DS2-VASc) with a `why`
- **AND** the response contains at most `limit` candidates

#### Scenario: Filters compose
- **WHEN** a client passes `specialty` or `group` alongside `query`
- **THEN** ranking runs only over calculators matching the filters

### Requirement: Discovery ranking is shared with the site's resolver

`find_calculator` SHALL rank with the same deterministic resolver and synonym table the
browser's hero search uses, over per-tile text assembled by a shared pure module, so both
surfaces route the same query to the same calculator. No model, no network, and no
non-deterministic input SHALL participate; identical inputs always produce identical ordering
(stable id tie-break).

#### Scenario: Surface parity
- **WHEN** the same query is evaluated by the browser resolver and `find_calculator` over the
  same corpus fields
- **THEN** both return the same top calculator id

#### Scenario: Reproducible ordering
- **WHEN** `find_calculator` runs twice with identical arguments
- **THEN** the candidate order is identical

### Requirement: No-match responses guide rather than error

A query matching nothing above threshold SHALL return `{ count: 0, candidates: [], hint }`
steering the client toward `list_calculators` filters; a blank query SHALL return
`{ valid: false, message }`. The handler SHALL never throw across the protocol boundary,
consistent with the server's error posture.

#### Scenario: Unmatched query returns a hint
- **WHEN** a client queries gibberish
- **THEN** the response is a zero-count result with a usable hint, not an error

### Requirement: The existing three tools are unchanged

`list_calculators`, `describe_calculator`, and `compute_calculator` — including
`list_calculators`' substring `query` semantics — SHALL be byte-for-byte unaffected. The
server remains stdio-only, stateless, and telemetry-free, and no per-calculator tools are
added: the fixed surface grows from three tools to exactly four.

#### Scenario: Existing clients unaffected
- **WHEN** a client uses only the original three tools
- **THEN** every response is identical to the pre-change server

#### Scenario: Tool list stays fixed
- **WHEN** a client lists the server's tools
- **THEN** exactly four tools are advertised, none of them per-calculator
