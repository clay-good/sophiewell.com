# Spec Delta — search-corpus

## ADDED Requirements

### Requirement: The search corpus is compiled from existing hand-authored sources only

The build SHALL compile a per-tile natural-language search corpus exclusively from prose that
humans already authored and reviewed in this repo: tile names/groups/audiences (UTILITIES),
specialties, `example.expected` sentences and interpretation-band text (META), `data/tool-copy`
`whatThisIs`/`whenToUse` prose, and MCP adapter summaries. No text SHALL be machine-generated
at build time; the builder only extracts, trims, and assembles.

#### Scenario: A tile's corpus row traces to authored sources
- **WHEN** the corpus builder emits a row for a tile
- **THEN** every string in that row is a copy or concatenation of text present in UTILITIES,
  META, `data/tool-copy`, or an adapter summary
- **AND** no field contains synthesized prose that appears in none of those sources

#### Scenario: Tiles with sparse prose still get a row
- **WHEN** a tile has no tool-copy file, no adapter summary, and no example
- **THEN** its corpus row still exists with name, group, audiences, and specialties
- **AND** the absent fields are omitted rather than filled with placeholder text

### Requirement: The corpus is a same-origin static asset within budget

The corpus SHALL be served as static JSON under `data/search-corpus/` on the site's own origin
(compatible with `connect-src 'self'`), following the existing `data/` manifest+shard
convention, and SHALL NOT exceed 200 KB gzipped for the full catalog.

#### Scenario: No new network posture
- **WHEN** the SPA loads the corpus
- **THEN** the only request is a same-origin fetch under `data/search-corpus/`
- **AND** the deployed Content-Security-Policy is unchanged

#### Scenario: Budget enforced at build
- **WHEN** the compiled corpus exceeds 200 KB gzipped
- **THEN** the build fails with a size report rather than shipping the oversized asset

### Requirement: The corpus is an accelerator, not a dependency

Search SHALL remain fully functional when the corpus is missing, still loading, or fails to
fetch: ranking falls back to the pre-corpus behavior (name/id/specialties plus the synonym
table), exactly as `data/synonyms.json` degrades today.

#### Scenario: Corpus fetch fails
- **WHEN** the corpus request errors or returns unusable content
- **THEN** the hero search continues to rank on the unenriched tile corpus
- **AND** no error surfaces to the user

#### Scenario: First keystrokes before corpus load
- **WHEN** the user types before the lazy corpus load resolves
- **THEN** results render immediately from the unenriched ranking
- **AND** subsequent keystrokes after load use the enriched ranking

### Requirement: Corpus builds are deterministic

Running the corpus builder twice over identical inputs SHALL produce byte-identical output
(sorted tile ids, stable key order), so `dist/` diffs stay meaningful and the service-worker
data cache is not churned by no-op builds.

#### Scenario: Repeated build is byte-identical
- **WHEN** the builder runs twice with no source change
- **THEN** the emitted manifest and shard bytes are identical

### Requirement: Corpus text is safe for user-facing surfaces

Because downstream changes may render corpus strings in the UI, every emitted string SHALL be
free of internal jargon: no spec/build references and no hardcoded catalog counts
(catalog-truth). The builder SHALL enforce this with assertions.

#### Scenario: A source string carrying internal jargon is rejected
- **WHEN** an assembled corpus string matches the spec-reference or hardcoded-count guards
- **THEN** the build fails identifying the tile and offending string

### Requirement: The builder works without the MCP subtree

The site SHALL remain buildable with `mcp/` removed. When the MCP subtree is absent, the
builder SHALL skip the adapter-summary source silently and emit the corpus from the remaining
sources.

#### Scenario: Build with mcp/ deleted
- **WHEN** the corpus builder runs in a tree without `mcp/`
- **THEN** it completes successfully with summary fields omitted
