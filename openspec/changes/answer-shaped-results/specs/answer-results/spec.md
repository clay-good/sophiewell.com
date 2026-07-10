# Spec Delta — answer-results

## ADDED Requirements

### Requirement: High-confidence matches render as an answer card

When the ranked prompt resolver's top hit clears a fixed score threshold and a fixed margin
over the runner-up, the dropdown's first option SHALL render as an answer card: the tile name,
one plain-language line describing what the tool is for (when authored prose exists for the
tile), and a breadcrumb explaining the match. Below the gate, the dropdown SHALL render the
plain ranked list exactly as today.

#### Scenario: Confident match shows the card
- **WHEN** a user types "kidney function" and the resolver's top hit clears the gate
- **THEN** the first option is a card naming the eGFR tile with its one-line description
- **AND** Enter routes to that tile as today

#### Scenario: Near-tie suppresses the card
- **WHEN** the top two ranked tiles score within the margin
- **THEN** no card renders and the plain list appears unchanged

#### Scenario: Sparse tile degrades gracefully
- **WHEN** the top hit has no authored one-liner in the corpus
- **THEN** the card renders name and breadcrumb only, with no placeholder text

### Requirement: The match is explained

The answer card SHALL carry a short "matched" breadcrumb: the synonym phrase when the synonym
table fired, otherwise the query tokens that drove the ranking. The breadcrumb text SHALL come
from the query and the curated corpus only, with no internal jargon (no spec/build references,
no scores).

#### Scenario: Synonym match shows the phrase
- **WHEN** "they denied it" routes via the synonym table to the appeal-letter tile
- **THEN** the card's breadcrumb shows the matched phrase

### Requirement: Related tools surface from curated data only

The answer card SHALL show up to 3 related tools drawn exclusively from the tile's authored
`META.related` list, in authored order. No algorithmically inferred suggestions SHALL appear.
Tiles without `META.related` show no related row.

#### Scenario: Related chips route
- **WHEN** the answer card shows a related tool chip and the user clicks it
- **THEN** the app routes to that tile

### Requirement: Zero results offer recovery

When no tile matches a query, the dropdown SHALL offer recovery instead of only a dead-end
message: a "did you mean" option when a one-edit rewrite of the query would match, and links
into the browse groups. The terminal "No tools match." line remains only when no recovery
exists.

#### Scenario: Typo earns a suggestion
- **WHEN** a query matches nothing but a one-edit rewrite would match
- **THEN** the dropdown offers the rewritten query as an actionable option

#### Scenario: Truly unmatched query still offers browsing
- **WHEN** no rewrite helps
- **THEN** the dropdown offers the browse groups alongside the no-match message

### Requirement: The combobox contract is preserved

All new rows (answer card, inline result, recovery options) SHALL be ordinary options inside
the existing ARIA combobox/listbox: `role="option"`, `aria-selected` management,
`aria-activedescendant` tracking, ArrowUp/Down wrap-around, Enter-routes-active,
Escape-clears, and blur-close behavior all unchanged. The dropdown remains the only search
surface; no new page, panel, or mode is introduced, and the whole surface passes the 320px
no-overflow sweep.

#### Scenario: Keyboard flow over the card
- **WHEN** a user arrows through results that include an answer card
- **THEN** the card is one option in the sequence and Enter on it routes to its tile

#### Scenario: Screen reader announcement
- **WHEN** the card is the active option
- **THEN** its accessible name is the tile name plus the one-line description
