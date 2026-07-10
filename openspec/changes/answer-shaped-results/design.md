# Design — answer-shaped results

## Context

`bindHeroSearch()` (`app.js:3177`) renders on every `input`/`focus`: `matchesFor()` merges the
resolver's promoted hit with the name/id ranking into a flat list of `<li role="option">` rows
(name + group label). Enter routes to the active option; empty query lists the catalog A-Z.
The dropdown is the only search surface — that stays true.

## Decisions

**D1 — Confidence gate.** The answer card renders only when
`top.score >= CARD_THRESHOLD && top.score >= CARD_MARGIN * second.score` (constants live in
one place, exported via `_testing`; exact values fixed at build against the fixture set).
Below the gate: today's plain list, unchanged. Rationale: a confidently-wrong card is worse
than a list; the gate converts ranking quality into card precision.

**D2 — Card content, with fallback chain.** Name (as today) + one-liner from the search
corpus: tool-copy `whatThisIs` → adapter summary → *no line* (card degrades to a plain row
plus the breadcrumb). Breadcrumb: synonym hits show the matched phrase ("matched: 'kidney
function'"); ranker hits show the top matched tokens. All strings come from the corpus, which
already enforces the no-internal-jargon rule.

**D3 — Related chips.** `META.related` only, first 3 ids as authored (curated order is the
ranking), rendered as small chips inside the card's option row. Clicking a chip routes to that
tile. Chips are not separate listbox options — the card stays one option for keyboard flow;
chips are reachable by pointer and exposed to AT as in-option links. (Keyboard users reach
related tools on the tile itself, which already renders neighbors in its intro copy.)

**D4 — Inline compute is allow-listed, not generic.** A new pure module `lib/query-compute.js`
exports parse templates for a curated starter set where bedside mental math is common and the
parse can be made unambiguous — target set at build: `bmi`, `bsa-dubois` (or catalog
equivalent), `qtc`, `corrected-sodium`, `corrected-calcium`, `anion-gap`, `map-calc`,
`unit-converter-v4` conversions (lb↔kg, °F↔°C, mg↔mmol where the analyte is named). Each
template declares: trigger tokens (tile aliases), field patterns (number + required unit or
unit-free-safe), and the compute import. **Fire only on a complete, unambiguous parse**: every
required field present; units required wherever a bare number could mean two things (weight
needs `lb`/`kg`; height accepts `5'10`, `178 cm`, `70 in`). No template may guess a unit.

**D5 — Inline result row.** One row above the ranked list: computed value with canonical
units and the tool's name (e.g. "BMI 25.8 kg/m² — Body Mass Index"). It is an ordinary listbox
option; Enter/click routes to `#<tile>&q=<parsed fields>` using the existing `trackHashState`
serialization, so the tile opens with the same inputs and shows its interpretation bands and
citation. Interpretation-band text is deliberately **not** shown inline: the number invites the
click; the clinical context lives on the tile with its citation.

**D6 — Partial parse.** If trigger tokens match but the parse is incomplete/ambiguous, no
inline row renders; the normal ranked results appear, and the top hit's route MAY carry the
cleanly-parsed fields as prefill. Never a wrong number; at worst, a normal search.

**D7 — Zero-result recovery.** When `matchesFor` returns empty: try the full-vocab one-edit
rewrite; if it changes the query, offer "Did you mean *<rewritten>*?" as an actionable option;
always append the browse-group links. "No tools match." remains only as the final line.

**D8 — A11y and keyboard.** Every new row is `role="option"` inside the existing listbox with
`aria-selected` handling; the card's accessible name is "name — one-liner." ArrowUp/Down
wrap-around, Enter, Escape, blur-close, and the `mousedown` routing trick are untouched.

## Risks

- **Clinical safety of inline numbers.** Mitigations: allow-list only (D4), no unit guessing,
  canonical unit always printed, band interpretation reserved for the tile view, and the value
  recomputed by the tile itself from the same prefilled inputs (single source of truth: the
  same pure compute).
- **Parse collisions with tile-name search.** Trigger tokens must not swallow plain name
  queries ("bmi" alone → no numbers → no inline row; routing unaffected).
- **Dropdown height on mobile.** Card + chips + inline row must pass the 320px no-overflow
  sweep; cap the card to two lines with ellipsis.
- **Hash prefill drift.** Prefill uses the same `q=` serialization `trackHashState` writes, so
  any future hash change updates both sides together; an e2e asserts inline value == tile
  value for each allow-listed template.
