# spec-v1701 — FDA's CYP interaction examples for a medication list (drug-interaction-kinetics tool 4)

> Status: **SHIPPED (2026-11-07)**: `cyp-list-check` and the weekly dataset `data/fda-ddi-examples`. Open in the
> change: the plot component (0.1) and the related-link backfills (4.3).

## What shipped

| Piece | What it does |
|---|---|
| `scripts/data/builders/fda-ddi-examples.mjs` | Fetches FDA's examples page weekly; picks Table 1 by its first header cell and checks all eleven column names; strips `<sup>` footnote markers into their own field; merges aprepitant's two rows; lists each combination row's components; keeps the 21 footnotes and FDA's not-comprehensive sentence. Edition = "Content current as of"; check date = fetch + 14 days, renewed on every fetch; bounds 220 to 400 drugs (the first build has 244) |
| `data/fda-ddi-examples/` | 244 drugs (46 KB), footnotes, the sentence; content current as of 05/29/2026, fetched November 7, 2026 |
| `lib/cyp-list-check-v1701.js` | Matches a list (salts, strengths and dose forms ignored; a combination row found from one component and said so), quotes each cell and footnote, and lists every pair where one drug is a CYP inhibitor or inducer and another a sensitive or moderate sensitive substrate of the same enzyme |
| `lib/fda-ddi-load.js`, `mcp/fda-ddi-disk.js` | The same files for the page and for MCP |

The tool also takes a dropped list file through the existing `drug-list` kind, which now routes to it as well as to
`hazardous-drug-list-check`.

## Rules

- A drug not found reads "not on this edition of FDA's examples (current as of 05/29/2026). That is not a finding of
  no interaction." Every result ends with FDA's sentence that the examples "are a guide and not considered a
  comprehensive list".
- No pair is graded, called safe or given an action. Transporter cells are listed and not paired.
- A drug FDA lists in two roles on one enzyme (aprepitant: CYP3A inhibitor and substrate) is never paired with itself.
- Past the check date the tool does not answer from the table and says when it was last fetched.

## Choices made at build

- **The tool's name says "examples"**, not "inhibitors, inducers or substrates": the first name took the bare words
  "inhibitors" (from the proton-pump inhibitor tool), "inducers" and "substrates" in the home box. Phrases with
  "table", "interaction" and "substrate" were dropped for the same reason (`tic-file-check`, `dips-interaction`,
  `ddi-strength-classify`).
- **The fixture is the page as read**, 108,266 bytes, SHA-256 `8f364f50…` (the hash design.md recorded), with its
  script, noscript, style and link elements removed so no analytics tag enters the repository (`grep-check` bans
  them): 102,193 bytes, SHA-256 `e8507e1e…`. The tables are untouched. A live fetch
  with the build's own user agent returns a slightly different page (`sourceSha256` in the manifest) with the same
  table.

## Proof

- `test/unit/data-builder-fda-ddi-examples.test.js` (9 tests): 245 rows to 244 drugs, aprepitant merged, the
  ciprofloxacin and ritonavir markers, the paritaprevir combination, empty cells dropped, Table 1 moved to second
  position still found, a renamed column refused, a 20% row drop refused, the edition and check date.
- `test/unit/cyp-list-check-v1701.test.js` (6 tests): clarithromycin with simvastatin as one CYP3A pair; a strength and
  dose form ignored; lopinavir through its combination row; "not on this edition"; no self-pair; footnote 20; the
  expired, missing-table and empty-list refusals.
