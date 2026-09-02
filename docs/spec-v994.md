# spec-v994 — The architecture doc described a different product

## The finding

`docs/architecture.md` is what README points a new contributor at to learn how the thing is built.
Read against the code, its two structural claims were both wrong.

**The home view.** Twice — in the overview and again under Runtime Architecture — the doc says the
app renders "a `#hero-search` combobox **and a static browse-by-category nav**". There is no
category nav. `spec-v51/v53` replaced the tile-grid home, and `spec-v751–v756` reduced what
replaced it to a single ask box; `app.js` says so in as many words, in the comment above
`bindHeroSearch`: focusing the empty input lists the whole catalogue A–Z, and that *is* the browse
affordance now. The doc had also gone stale on the catalog size, which spec-v992 fixed.

**The tile taxonomy.** A section titled "v4 group expansion (post-v29 surface)" enumerated groups
J through O. Against `GROUP_LABELS` in `app.js`:

| Doc said | Actually |
| --- | --- |
| J "Public Health & Infectious Disease" | J is **Immunization & Infectious Disease** |
| K "Lab Reference" — *retired* | K is **Reference Ranges**, still declared |
| L "Forms & Numbers Literacy" — *retired* | L is **Insurance Glossary**, still declared |
| N "Literacy Helpers": unit converter, time-to-dose, peds weight converter | N is **Pediatrics & Neonatal**, 17 tiles |
| O "Patient Safety" — *retired* | O is **High-Alert & Safety**, still declared |
| (M not mentioned at all) | M is **State & Coverage Reference** |

Five of the six were named wrongly. And because the section scoped itself to the v4 letters, the
only picture of the catalog's shape a contributor got left out **group G, which holds 1,344 of the
1,704 tiles**.

## What changed

The section is now a table of every group — letter, on-screen label, tile count — and
`check-catalog-truth.mjs` holds it to `app.js` on **both** columns. The visible label was already
gated across the five files that declare it (spec-v953); prose could not join that list, because
its parser reads a JavaScript object literal, which is exactly how this copy went unchecked. It
gets its own parser now rather than its own exemption.

Four labels do survive with no tiles behind them — K, L, M, O — so the doc says that plainly
instead of calling them retired, and says what happened to the thresholds the pruned tables
carried. Group D is explained rather than skipped: it was "Provider & Plan Lookup", cut by spec-v5
along with the 38 live-data tiles that were its whole contents.

## Proof

`test/unit/catalog-count-rule.test.js` pins the detector on synthetic input: a matching table
passes, a wrong count and a wrong label each fail with the letter named, a group present in only
one side is reported in both directions, and a doc with no table fails rather than passing vacuously.
Negative-tested against the real files too — changing G's count to 1300 and misspelling K's label
each fail the gate, and both together are reported together.
