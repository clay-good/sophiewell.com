# Spec Delta — question-routing

Extends the spec-v7 §3.2 / spec-v8 §4.3 prompt resolver. The three-pass architecture
(synonym table → token ranker → typo retry), the pure-function contract (no DOM, no fetch,
no AI), the threshold-gated null return, and the audience biasing all remain in force.

## ADDED Requirements

### Requirement: Question scaffolding does not affect routing

The resolver SHALL strip interrogative scaffolding and stopwords ("what is the," "how do I,"
"should I," "for my patient with," …) from the ranking view of a query, so a question routes
to the same tile as its bare-keyword form. The raw query SHALL still be used for exact-phrase
matching so verbatim tile-name queries keep their bonus.

#### Scenario: Question form equals keyword form
- **WHEN** a user types "what is the stroke risk for my patient with atrial fibrillation"
- **THEN** the top-ranked tile is the same as for "stroke risk atrial fibrillation"

#### Scenario: Verbatim tile name still wins exactly
- **WHEN** a user types a tile's exact name
- **THEN** that tile ranks first, as today

### Requirement: Ubiquitous tokens cannot dominate ranking

Token scoring SHALL weight matches by rarity across the corpus (inverse document frequency),
so near-universal tokens ("score," "risk," "scale") contribute less than discriminating
clinical tokens, and a name-only hit on common words no longer beats a tile whose descriptive
fields match the query's specific terms.

#### Scenario: "stroke risk in afib" routes to CHA2DS2-VASc
- **WHEN** a user types "stroke risk in afib"
- **THEN** `chads` (CHA2DS2-VASc) is the top result
- **AND** tiles matching only the common tokens "stroke"/"risk" in their names rank below it

#### Scenario: A stray common token does not hijack the route
- **WHEN** a user types "sodium is low how fast can i correct it"
- **THEN** `sodium-correction` is the top result
- **AND** `fast-ed` does not outrank it on the token "fast"

### Requirement: Common inflections match

The resolver SHALL apply a bounded, hand-listed suffix normalization (plurals, -ed, -ing,
-ion/-tion pairs) identically to corpus and query tokens. The suffix list is a reviewed
constant, not a general-purpose stemmer.

#### Scenario: correct matches correction
- **WHEN** the query contains "correct" and a tile's indexed text contains "correction"
- **THEN** the token contributes to that tile's score

### Requirement: Clinical abbreviations and lay phrasings resolve

The curated synonym table SHALL grow to cover common clinical abbreviations (afib, sob, dka,
gib, uti, …), eponym aliases, and canonical-intent phrases, and SHALL retain pass-1 precedence
so a curated mapping always beats statistical ranking. The table remains a reviewed, versioned,
deterministic JSON asset.

#### Scenario: Abbreviation reaches the spelled-out tile
- **WHEN** a user types "afib" in a query and no indexed field contains that literal token
- **THEN** the synonym table maps it toward the atrial-fibrillation tiles and routing succeeds

#### Scenario: Curated intent overrides the ranker
- **WHEN** a synonym row maps a phrase to a tile id
- **THEN** that tile is returned for the phrase regardless of token statistics

### Requirement: Typo recovery covers the full vocabulary

The typo pass SHALL rewrite an unrecognized query token to its one-edit neighbor in the full
corpus vocabulary (not only the synonym phrases), with bounded cost (length-bucketed candidate
sets, per-query token cap). Multi-typo queries MAY still fall through, as today.

#### Scenario: Misspelled eponym recovers
- **WHEN** a user types "cockroft gault"
- **THEN** the token rewrites to "cockcroft" and the Cockcroft-Gault tile ranks first

### Requirement: Routing stays deterministic and fast

The same query against the same corpus and synonym table SHALL always produce the same
ordering (fixed-precision scoring, stable id tie-break). Per-keystroke ranking SHALL run
entirely in memory against a prebuilt token index; no network request and no non-deterministic
input participates in scoring.

#### Scenario: Reproducible ordering
- **WHEN** the same query is evaluated twice in any environment
- **THEN** the ranked tile order is identical

### Requirement: Existing resolver contracts are preserved

`resolvePrompt(query, tiles, synonyms, audience)` SHALL keep its signature, its threshold-gated
top-1-or-null contract, and its audience biasing. A new ranked API SHALL expose the top-N with
a per-hit `why` (and matched `phrase` when a synonym fired) for downstream consumers. Below
threshold, the hero search falls back to the name/id ranking, and an empty query still lists
the catalog A-Z.

#### Scenario: Below-threshold query falls back as today
- **WHEN** a query matches nothing above threshold
- **THEN** `resolvePrompt` returns null and the dropdown shows the name/id ranking

#### Scenario: Ranked API agrees with top-1
- **WHEN** the ranked API returns a non-empty list for a query
- **THEN** its first entry is the tile `resolvePrompt` returns for the same arguments
