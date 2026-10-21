# Tasks — Genetic counseling risk arithmetic

> **Built October 19, 2026** ([docs/spec-v1660.md](../../../docs/spec-v1660.md)). Unticked items were not done;
> the build record says why.
>
> Originally a docs-only proposal. Confirm the six remaining ids absent (they were on October 19, 2026).

## 1. Read the gated sources
- [x] 1.1 (read at esp.org; Hardy writes p : 2q : r with q squared = pr) Hardy 1908 (the letter) for the p² : 2pq : q² statement (tool 1).
- [ ] 1.2 (not read: not open access; tool 2 cites Bayes' theorem as stated arithmetic) The ACMG carrier-screening position statement (2013) and the 2021 ACMG practice
      resource's caution on residual risk (tool 2).
- [ ] 1.3 (not read; the prior stays reader-typed, no preset) A text stating the 2/3 prior for the sister of an isolated X-linked case and its
      assumptions (tool 4 preset).
- [x] 1.4 (read at archive.org; the picker's F values are computed from the path rule) Wright 1922 for path counting and the standard coefficients (tool 5).

## 2. Lib
- [x] 2.1 (one lib per tool on a shared `lib/bayes-table.js`) `lib/genetic-risk-vNNNN.js`: `hardyWeinberg`, `residualRisk`, `coupleRisk`,
      `xLinkedBayes`, `relationshipCoefficient`, `bayesTable` (the general function the others call).
- [x] 2.2 Unit tests: 1 in 2,500 → 2pq = 0.0392; CF 1/58 and DR 0.91 → 1 in 634; two residual
      risks × 1/4; n = 3 unaffected sons from a 1/2 prior → 1/9; first cousins F = 1/16 once
      read; refusals on priors not
      summing to 1 and on a risk above 1.

## 3. Views, META, agents
- [x] 3.1 Group E renderers; every result prints the Bayes table; "1 in N" and decimal both.
- [x] 3.2 (Hardy and Wright cited with the copies read; Bayes as stated arithmetic, the 1763 essay not opened) META: citations to the 1908, 1763 and 1922 papers with "read at build" dates;
      examples labeled as illustrations.
- [x] 3.3 (phrases avoid "autosomal", "genetic" and "parents"; the fagan-post-test synonym was not added) MCP adapters; synonyms: "carrier frequency", "Hardy-Weinberg", "residual risk",
      "carrier screening negative", "recurrence risk", "X-linked carrier", "consanguinity",
      "first cousins risk", "Bayes". (Screen predictive value is `fagan-post-test`'s; add
      "NIPT positive predictive value" to its synonyms instead.)

## 4. Ship
- [x] 4.1 Count surfaces; `node scripts/build-search-corpus.mjs`; `npm run release:check`;
      CHANGELOG; `docs/spec-vNNNN.md` build record.
