# spec-v1699 — Drug-interaction kinetics, first slice (tools 3, 7, 8 and 9)

> Status: **SHIPPED (2026-11-07)**: `ddi-strength-classify`, `dose-history-level`, `two-compartment-params` and
> `emax-hill-effect`. Open in the change: tools 1, 2, 5 and 6 (they need the ICH M12 re-read and its PDF hash), tool 4
> (the FDA Table 1 builder) and the plot component.

The first build of the [drug-interaction-kinetics](../openspec/changes/drug-interaction-kinetics/proposal.md) change.

## What shipped

| Tool | Group | What it answers | Source |
|---|---|---|---|
| `ddi-strength-classify` | Q | The FDA class an observed AUC ratio falls in | FDA examples page, Table 2 legend (current as of 05/29/2026) |
| `dose-history-level` | F | The level from the doses actually given, beside the on-schedule level | Stated arithmetic: one-compartment superposition |
| `two-compartment-params` | F | k21, k10, k12, Vc, CL, Vss, Vbeta and both half-lives from A, alpha, B, beta | Stated arithmetic |
| `emax-hill-effect` | F | The effect at a concentration, or the concentration for a target effect | Stated arithmetic |

## The gate, as read

1.2 FDA page: re-read November 7, 2026. 108,266 bytes, "Content current as of: 05/29/2026", the same edition the
design read; the Table 2 definitions match design.md word for word. The URL in an older FDA link
(`.../drug-development-and-drug-interactions-table-substrates-inhibitors-and-inducers`) is a different, 2023 page
about index drugs; the tool cites the examples page.

## Choices made at build

- **One lib per tool** (the MCP catalog gate wants an adapter file named like each lib), so 3.2's
  `pk-multidose` became three files.
- **Boundaries compared at ten decimal places**, so a ratio of 0.20 is an 80% decrease (strong), not 79.999...%.
- **Peak of the last interval** is found by sampling and then refined to the true maximum, so an oral tmax prints
  2.44 h, not a grid point.
- **design.md's oral level of 9.305 mg/L is 9.304**: the exact value is 9.30446, and the test says why.
- **Clock times** ("YYYY-MM-DD HH:MM") are subtracted as written; a daylight-saving change between doses is not
  applied, and the code says so.
- **Search phrases** audited word by word: drafts took "auc" from `auc-trapezoid`, "missed" from
  `contraceptive-missed-pill` and "pharmacokinetic" from `pk-suite`, and the first tool name took "given" from
  `med-admin-window`; all were reworded. The strength tool's name and summary first said "AUC ratio", which pushed
  `vanc-auc` off the three choices offered for a bare "auc" (`test/unit/ambiguous-pick-order.test.js`); they now say
  "interaction study" and "exposure ratio", and the fields still say AUC.

## Proof

- `test/unit/ddi-pk-v1699.test.js` (11 tests): every design.md vector for the four tools, each class line on both
  sides, the ka = k limit form, clock times, and the refusals.
- `test/unit/fuzz-tools.test.js` runs all four modules; `test/mcp/mcp-search-relevance.test.js` has one probe each.
