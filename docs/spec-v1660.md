# spec-v1660 — Genetic counseling risk arithmetic

> Status: **SHIPPED (2026-10-19)**: six tools. The X-linked prior presets stay off (below).

The build of the [genetic-counseling-risk](../openspec/changes/genetic-counseling-risk/proposal.md) change
proposed in [spec-v1654](spec-v1654.md). Hardy's 1908 letter and Wright's 1922 paper were read on October 19, 2026
in open copies (esp.org; archive.org, jstor-2456273). Every tool prints its Bayes table.

## What shipped

| Tool | What it answers | Source |
|---|---|---|
| `hardy-weinberg-carrier` | Carrier frequency 2pq from the affected incidence, or from q | Hardy 1908 |
| `residual-carrier-risk` | Carrier risk after a negative screen from the carrier frequency and detection rate | Bayes' theorem |
| `recessive-couple-risk` | Risk of an affected child: A × B × 1/4 | Mendelian segregation |
| `x-linked-bayes-risk` | A carrier probability revised by unaffected sons and a negative test | Bayes' theorem |
| `coefficient-of-relationship` | F and r for seven relationships or the reader's own paths, and the recessive risk to a child | Wright 1922 |
| `bayes-risk-table` | Any number of hypotheses and pieces of evidence | Bayes' theorem |

Shared code: `lib/bayes-table.js` (the table, "1 in N", and one parser for probabilities typed as decimals, percents,
fractions or "1 in N").

## The gates, as read

| Gate | Answer |
|---|---|
| 1.1 Hardy 1908 | Read. Hardy writes AA : Aa : aa as p : 2q : r and shows it is stable when q² = pr, under random mating, sexes evenly distributed and equal fertility. With p = x², r = z², q = xz and x + z = 1 this is x² : 2xz : z², the modern p², 2pq, q². |
| 1.4 Wright 1922 | Read. For a common ancestor who is not inbred, each path adds (1/2)^(n+n′+1). The relationships in the picker are stored as their paths, so first cousins (two paths of 2 and 2) compute to 1/16; nothing is typed. F is "the departure ... toward complete homozygosis", which gives the child's affected frequency q² + F·q(1 − q). |
| 1.2 ACMG statements | Not read (not open access). The residual risk is cited as Bayes' theorem, which it is. |
| 1.3 The 2/3 sister prior | Not read. The prior is typed; no preset is offered. |

## What changed from the proposal

- **Results print "1 in N" rounded to a whole number above 10.** The cystic fibrosis illustration reads "1 in 26",
  not "1 in 25.5"; the decimal 0.0392 is printed beside it.
- **Hardy and Wright are cited with the copies read**, and their DOIs or archive pages linked. Bayes 1763 was not
  opened, so the Bayes tools cite the theorem as stated arithmetic rather than the essay.
- **Search phrases avoid "autosomal", "genetic" and "parents"**, which belong to the ADPKD and AML tools and to a
  pediatric scale. The `fagan-post-test` synonym the proposal suggested was not added.

## Proof

- `test/unit/genetic-risk-v1660.test.js`: 1 in 2,500 → 2pq 0.0392; CF 1/58 with DR 91% → 1 in 634; two confirmed
  carriers → 1/4; a 1/2 prior with three unaffected sons → 1/9, the same through the general table; Wright's values
  for seven relationships and a typed path list; refusals on priors that do not sum to 1 and probabilities above 1.
- `test/unit/fuzz-tools.test.js` runs all six modules; `test/mcp/mcp-search-relevance.test.js` has one probe per tool.
