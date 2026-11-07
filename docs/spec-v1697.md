# spec-v1697 — Variant interpretation arithmetic (tools 1 and 2)

> Status: **SHIPPED (2026-11-07)**: `acmg-variant-classify` and `max-credible-allele-frequency`. Tools 3 and 4 (the
> VCF readers) and the `vcf` file kind remain open in the change's tasks.

The first two tools of the [variant-interpretation-math](../openspec/changes/variant-interpretation-math/proposal.md)
change. The shared BGZF reader (`lib/bgzf.js`) shipped earlier the same day as a defect fix.

## What shipped

| Tool | What it answers | Source |
|---|---|---|
| `acmg-variant-classify` | The class for the codes applied, at their applied strengths, three ways: the 2015 rule that fired, the points and their class, the posterior | Richards 2015 Table 5; Tavtigian 2018 and 2020; ClinGen SVI |
| `max-credible-allele-frequency` | maxAF for a dominant or recessive model, the allele-count ceiling at an AN, and a too-common decision from an AC or a FAF | Whiffin 2017 and the authors' calculator |

## The gates, as read

| Gate | Answer |
|---|---|
| 1.1 Richards Table 5, SVI | Read for the design on November 7, 2026, the same day; no newer general SVI change to a default strength was found then. |
| 1.2 Whiffin calculator | Re-read at build (`jamesware/alleleFrequencyApp`, `server.R`): dominant `(1/2) * prev * hetA * hetG / pen`, recessive `sqrt(prev) * hetA * sqrt(hetG) / sqrt(pen)`, ceiling `qpois(0.95, AN * AF)`. Matches design.md. |

## Choices made at build

- **Codes are typed, one per line**, on both surfaces (`PVS1`, `PM2_Supporting`), with the 28 codes and their default
  strengths listed under the box. One field keeps the browser and the MCP contract the same.
- **A pathogenic rule beside a lone benign code that meets no benign rule keeps the 2015 class** and says so; a
  conflict is called when rules in both directions are met, or when codes point both ways and no rule is met.
- **Two very strong codes meet no Table 5 rule** read literally; the page says the table does not list that pair rather
  than inventing a rule.
- **Benign codes move only between supporting and strong** unless the reader ticks that a gene-specific specification
  allows moderate; very strong benign and a modified BA1 are refused.
- **Genetic contribution blank is taken as 1** and the result says so (the paper's worked example).
- **Search phrases** were audited word by word: the first draft took "codes" from `lcd-diagnosis-check` and "points"
  from `nursing-home-staffing-star`; both phrases were dropped.

## Proof

- `test/unit/variant-interpretation-v1697.test.js` (16 tests): every vector in design.md **Tests** (0.9986, 0.9878,
  0.8999 and 0.9019, 0.0507, 0.00066; ceilings 9, 5, 322 and 15), every Table 5 rule on a minimal code set, the point
  bands at -7, -6, -1, 0, 5, 6, 9 and 10, applied strengths, and the refusals.
- `test/unit/fuzz-tools.test.js` runs both modules; `test/mcp/mcp-search-relevance.test.js` has one probe per tool.
