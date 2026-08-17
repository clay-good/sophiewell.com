# spec-v744.md — The example printed the option's value, not the option

> Status: **SHIPPED (2026-08-17).** Copy only. No tile added, no number changed.
> Catalog stays **1564**.

## Why

Every tool page carries a worked example: the inputs on the left, the values on the right, the
result underneath. The values come from `META.example.fields`, which is keyed by DOM id and stores
the raw `<option value>` — the token an agent passes over MCP, never the words a nurse sees.

So the ASTCT CRS grading page said:

> **Hypotension level** — `onevaso`

The select on screen reads *Requiring one vasopressor (± vasopressin)*. Across the catalog, **370
of 5,932 example rows** printed a token like that: `onevaso`, `moderately-severe`, `no-mild`,
`mgdl`, `wet`, `transsphincteric`. The example exists so the reader can see the shape of a value
before typing their own; a row naming something the tool never shows them does the opposite.

## What changed

`scripts/lib/option-labels.mjs` reads the option text out of the view that builds the select — the
only place it exists — and the page prints that instead. **370 → 154 raw rows**; 636 of the 1,465
enum example values across the catalog now name their option.

| | |
|---|---|
| Before | `Congestion: wet` · `Perfusion: cold` |
| After | `Congestion: Wet - congestion present` · `Perfusion: Cold - hypoperfusion` |

Two rules keep a *wrong* label off the page:

- **Scoped per tile.** DOM ids are unique inside a tile, not across the catalog: `lf-type` is a Le
  Fort level in one tile and a Lisfranc pattern in another. Extraction runs inside each renderer
  block, so seven such collisions never see each other's options.
- **Checked against the registry.** A map is used only when it names *every* value the MCP field
  declares. A select that does not offer the declared values is not the select behind that field,
  and its labels are dropped rather than guessed at.

The 829 that do not resolve are selects whose options are built at render time from a lib constant
(RUCAM, ARC-HBR, the clubfoot scores). Those are not statically readable, so they keep printing the
raw value exactly as before — the extractor fails quiet, never wrong. Option text longer than 72
characters is cut at a word boundary so the value column cannot push the row off a phone screen.

## Proof

- `test/unit/tool-page-option-labels.test.js` — four cases: a **coverage floor** at 636 resolved
  values, so a view rewritten into a shape the parser cannot read fails loudly instead of silently
  reverting the page; the Le Fort / Lisfranc pair, asserting neither tile can see the other's
  options; the registry guard, refusing a map that covers only part of the declared values; and a
  sweep asserting every resolved select has distinct, non-blank text for each declared value.
- Negative-tested: breaking the object-literal branch of the parser drops coverage and fails the
  floor.
- `npm run lint`, `npm run test:unit`, `npm run test:mcp`, `npm run test:a11y`, `npm run
  data:verify` clean. The MCP surface is untouched — agents were always given the value, and still
  are.

## The lesson worth keeping

The registry is written for the machine customer. Every field on it — value, unit, kind — is what
an agent needs to *call* the tool, not what a person needs to *read* it. Where a page renders
registry data straight through, check what the human sees: the two audiences share the data and do
not share the vocabulary.
