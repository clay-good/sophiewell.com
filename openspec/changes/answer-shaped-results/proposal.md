# Change: Answer-shaped results — answer card, related tools, inline compute

## Why

The hero dropdown answers every query the same way: a bare list of tile names, with the
prompt resolver's best hit silently promoted to slot 0 (`app.js:3236-3240`). Three gaps follow:

1. **No explanation.** When "kidney function" surfaces eGFR first, nothing says *why* — and
   when the promotion is wrong, it silently displaces the right answer with no signal the user
   can act on.
2. **Dead-end zero state.** A non-matching query renders "No tools match." and stops.
3. **Unanswered numeric questions.** Someone typing "bmi 180 lb 5'10" has given the site
   everything a pure, local, deterministic compute needs — yet gets a link instead of the
   number. Every compute is already client-side, and the hash router already encodes prefilled
   state (`#bmi&q=w=70;h=1.75`), so "open the tool with these values filled in" is already a URL.

All of this stays deterministic and inside the existing single-input, dropdown-only surface —
no new page, panel, or mode, per the minimalist search-first direction.

## What Changes

- **Answer card at slot 0, gated by confidence.** When the ranked resolver's top hit clears a
  score threshold *and* a margin over the runner-up, the first option renders as a compact card:
  tile name, one plain-language line (tool-copy `whatThisIs` via the search corpus, falling back
  to the adapter summary), and a "matched: …" breadcrumb from the resolver's `why`/`phrase`.
  Below the gate, the dropdown stays the plain list it is today.
- **Related-tools row.** Under the answer card, up to 3 chips from the tile's curated
  `META.related` graph (1,084 tiles already carry it). Curated data only — no algorithmic
  suggestions.
- **Inline compute for unambiguous numeric queries.** A new pure module parses number+unit
  patterns for a small allow-listed set of high-frequency tiles; when the parse is complete and
  unambiguous, the dropdown's top row shows the computed value, labeled with the tool name and
  units, and Enter/click opens the tile prefilled via the existing hash-state format. Ambiguous
  or partial parses never guess: they fall back to routing (optionally still prefilling the
  fields that parsed cleanly).
- **Zero-result recovery.** Replace the bare "No tools match." with a one-edit "did you mean"
  suggestion when one exists, plus links into the browse groups.

## Impact

- Affected specs (folded in at build): **answer-results** (new capability), **inline-compute**
  (new capability).
- Affected code: `app.js` (`bindHeroSearch` render path), `styles.css`, new pure
  `lib/query-compute.js` (parse templates + allow-list), hero-search e2e + mobile 320px
  no-overflow sweep, unit tests for the parser.
- **Depends on:** `plain-language-search` (ranked API with scores/`why`; corpus one-liners).
- **Untouched:** routing model, tile views, computes, META values, MCP, CSP, catalog count.
- Combobox accessibility contract (ARIA roles, `aria-activedescendant`, keyboard wrap-around,
  Enter/Escape semantics) is preserved — new rows are ordinary listbox options.
- Docs-only proposal (propose-first); a later session builds it.
