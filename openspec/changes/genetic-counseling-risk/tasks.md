# Tasks — Genetic counseling risk arithmetic

> Docs-only proposal. Confirm the seven ids absent (they were on October 19, 2026).

## 1. Read the gated sources
- [ ] 1.1 Hardy 1908 (the letter) for the p² : 2pq : q² statement (tool 1).
- [ ] 1.2 The ACMG carrier-screening position statement (2013) and the 2021 ACMG practice
      resource's caution on residual risk (tool 2).
- [ ] 1.3 A text stating the 2/3 prior for the sister of an isolated X-linked case and its
      assumptions (tool 4 preset).
- [ ] 1.4 Wright 1922 for path counting and the standard coefficients (tool 5).

## 2. Lib
- [ ] 2.1 `lib/genetic-risk-vNNNN.js`: `hardyWeinberg`, `residualRisk`, `coupleRisk`,
      `xLinkedBayes`, `relationshipCoefficient`, `screenPpv` (calling `diagnostic-2x2`'s
      function), `bayesTable` (the general function the others call).
- [ ] 2.2 Unit tests: 1 in 2,500 → 2pq = 0.0392; CF 1/58 and DR 0.91 → 1 in 634; two residual
      risks × 1/4; n = 3 unaffected sons from a 1/2 prior → 1/9; first cousins F = 1/16 once
      read; PPV with sens 0.99, spec 0.999, prior 1/1,000 → 49.8%; refusals on priors not
      summing to 1 and on a risk above 1.

## 3. Views, META, agents
- [ ] 3.1 Group E renderers; every result prints the Bayes table; "1 in N" and decimal both.
- [ ] 3.2 META: citations to the 1908, 1763 and 1922 papers with "read at build" dates;
      examples labeled as illustrations.
- [ ] 3.3 MCP adapters; synonyms: "carrier frequency", "Hardy-Weinberg", "residual risk",
      "carrier screening negative", "recurrence risk", "X-linked carrier", "consanguinity",
      "first cousins risk", "NIPT positive predictive value", "Bayes".

## 4. Ship
- [ ] 4.1 Count surfaces; `node scripts/build-search-corpus.mjs`; `npm run release:check`;
      CHANGELOG; `docs/spec-vNNNN.md` build record.
