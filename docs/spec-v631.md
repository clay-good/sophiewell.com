# spec-v631 — Expose the non-calculator tools: decision trees and reference

**Status:** proposal. No code changed. Written 2026-07-31. Part of the v627 program.

Five clinical tiles are real, interactive tools a user gets on the site but do not fit the
field → compute → number adapter shape, so the current MCP surface can't carry them. They are the last
clinical gap. This spec gives them a home.

## The five

| id | name | Shape on the site | Data |
|---|---|---|---|
| `tetanus` | Tetanus prophylaxis decision tree | `renderDecisionTree` traversal | `data/tetanus.json` |
| `rabies-pep` | Rabies PEP decision tree | `renderDecisionTree` traversal | `data/rabies.json` |
| `bbp-exposure` | Bloodborne-pathogen exposure decision tree | `renderDecisionTree` traversal | `data/bbp.json` |
| `sti-screening` | STI screening-interval reference (CDC) | static `renderTable`, no inputs | `data/sti.json` |
| `co-cn-antidote` | CO / cyanide / smoke-inhalation antidotes | static reference text, no inputs | inline |

The three decision trees take answers to a series of questions and return a recommendation — genuinely
interactive, genuinely used, and today invisible to agents. The two reference tiles take no input at all.

## Design: two small, non-calculator tool shapes

**1. A decision-tool traversal tool** for the three trees. The tree data (`data/*.json`) is already a clean,
deterministic structure: nodes, answers, and terminal recommendations. Expose it as:

```
run_decision_tool({ id, answers })
  -> { id, node, question, options }              // when more input is needed
  -> { id, outcome, recommendation, citation, disclaimer }   // at a terminal node
```

`answers` is the ordered path of choices. Given the same answers, the same node/outcome comes back — fully
deterministic, a pure walk over committed JSON. `describe`-style discovery returns the tree's root question
and shape so an agent knows what to ask. No traversal logic is duplicated: factor the site's traversal into a
pure `lib/` function both surfaces call (the renderer keeps the DOM; the lib returns the node).

**2. Reference exposure** for the two static tiles. They have no inputs, so they are content, not a
calculation. Expose them read-only — as MCP **resources** (the protocol's native shape for reference content)
or via a `get_reference({ id })` tool that returns the table/text plus citation. Lowest priority in the
program; if resources add too much surface for two tiles, **waive them** (v632) with reason
`static-reference` and revisit if more reference tiles appear.

## Posture — the load-bearing part

These outputs are recommendations, and the clinical disclaimer is explicit that a computed result is "not a
treat / escalate / **prescribe** order." That is exactly why these tiles lack numeric examples and were held
back. Exposing them is defensible **only** with the framing kept tight:

- The tool returns **the published source's algorithm output** (the CDC/ACIP path), verbatim, with its
  citation — the same content the site already shows a user. It is a lookup of a guideline's own branch, not
  advice the tool originated.
- The standard disclaimer rides on every terminal outcome, and the outcome is labeled as the source's
  recommendation, not an order.
- **No dosing numbers are synthesized.** If a terminal node names a product, it names what the source names;
  the tool computes nothing pharmacologic.

If that framing can't be held for a given tree, that tree stays waived. Parity with the site is the goal;
exceeding the site's posture is not.

## Guards

- **Determinism.** Pure walk over committed JSON; identical `answers` → identical outcome. A round-trip test
  pins a full path to its terminal outcome for each tree (the analogue of the numeric example gate).
- **Shared traversal.** The site renderer and the MCP tool call one pure `lib/` traversal fn — no second
  implementation of the tree logic.
- **Accountability.** Whatever is not exposed here (e.g. the two reference tiles, if deferred) gets an
  explicit waiver in v632. No silent omission.

## What not to do

- Do **not** reshape a decision tree into a fake scalar calculator to fit the existing gate. Use the
  decision-tool shape.
- Do **not** let the tool author or infer a recommendation beyond the source tree. It returns the guideline's
  branch; it does not reason past it.

## Files (when built)

`lib/` (pure decision-tree traversal fn), `mcp/` (`run_decision_tool`, optional `get_reference`/resources),
`mcp/server.js`, `mcp/catalog.js` (or a parallel decision-tool registry), `scripts/check-mcp-catalog.mjs`
(path round-trip gate for trees), `test/mcp/*`, `docs/mcp-coverage.md`.
