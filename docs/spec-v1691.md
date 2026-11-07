# spec-v1691 — The classic Westgard multirule, and a judgment about its source

> Status: **SHIPPED (2026-11-07)**. Closes [spec-v1658](spec-v1658.md) tool 1. One new tile; catalog
> 2,364 → 2,365. Third of today's gate re-tests, after [spec-v1689](spec-v1689.md) and
> [spec-v1690](spec-v1690.md).

## The source decision, stated plainly so it can be overturned

The 1981 paper is still behind the publisher: Oxford returned **HTTP 403** on November 7, 2026, exactly
as on October 19. What changed is not the paper's reachability but a re-reading of the proposal.

The proposal's own design already sourced this tool twice over:

> Westgard JO, Barry PL, Hunt MR, Groth T. ... *Clin Chem* 1981;27:493-501 — **not opened** (PubMed
> blocked the fetch); **rule definitions read on westgard.com, "Westgard Rules and Multirules", by the
> first author**; build gate on the paper

and, for the rule set:

> the classic 1_3s / 2_2s / R_4s / 4_1s / 10_x with 1_2s as the warning, **as the author's page
> describes for two levels**; the three-level alternatives (2of3_2s, 3_1s, 6_x, 9_x) are listed but not
> evaluated until their definitions are read in the paper

spec-v1658's build record then generalized the gate to the whole tool. Those two readings conflict.
This ships the narrower one: **the classic five rules plus the 1_2s warning, from the first author's own
published statement of his own rules, citing both it and the 1981 paper** — which is what the owner's
November 2026 rule asks for when an original is not reachable. **The three-level alternatives are not
evaluated**, and the result says so, because the design gated those on the paper specifically.

The author's page is not a third-party scan; it is the rules' author restating them. If that is the
wrong call, the tile is one `citationUrl` and one task checkbox away from being reverted.

## Four things that are easy to get wrong, all encoded

1. **1_2s is a warning, never a rejection.** The author gives the cost of treating it as one: at a 2s
   limit "when N=2, it is expected than 9% of good runs will be falsely rejected; with N=3 ... about
   14%; with N=4, it's almost 18%." A single point past 2s reports a warning and names the rules to
   inspect by. A test asserts it does not reject.
2. **"The same" side is load-bearing** in 2_2s and 4_1s. Two points straddling the mean are not a
   2_2s, and four alternating points are not a 4_1s. Tests pin both negatives.
3. **R_4s is within-run only**, in the author's own note. Evaluated on the current run's two levels and
   never across runs; a test drives opposite sides across runs and asserts it stays silent.
4. **4_1s and 10_x cross runs and materials**, so the consecutive series has to be ordered — and the
   order changes the answer. The order used is stated on every result: oldest run first, level 1 before
   level 2 within a run.

### The bug that order caused, found by its own test

2_2s was first implemented on one flat interleaved series. That misses the classic pair: **the same
level in two consecutive runs is not adjacent** once the other level sits between them, so a genuine
across-run 2_2s went unreported. It is now evaluated on both axes — within the run across materials,
and across runs within a material — which is how the rule is applied at N=2.

Also fixed from the same test run: `inputFault`'s `null` low bound means "must be above zero", so using
it for a control **mean** refused a legitimately zero or negative mean (a base excess, a delta) and
swallowed the zero-SD check behind a range message.

### The classic trigger, reported rather than chosen

In the manual procedure the 1_2s warning is what sends you to the other rules, and the author says of
4_1s and 10_x that "In order for this to be violated, you must first see a 1:2s violation." A computer
application does not work that way: "Computer applications don't need to use the 1 2s warning rule."
Both readings are reported — every rule that fired, and whether the 1_2s warning the classic procedure
gates on was present — so a rule that fires without a warning is shown rather than suppressed.

## A synonym that would have stolen a neighbour's name

The first synonym row for this tile carried `"levey jennings rule check"` and `"qc rule violation"`. A
search phrase claims any whole word inside it and the shortest phrase wins, so those would have taken
**`levey` and `jennings` from the Levey-Jennings tile**, plus `rule` and `check`. It showed up as ten
failures in `test/unit/ambiguous-pick-order.test.js` on words as unrelated as `crrt` and `phosphate`,
and was isolated by removing the row and re-running. The row is now `westgard rules`,
`westgard multirule`, `westgard` — phrases whose every word belongs to this tool.

## Proof

- `test/unit/westgard-multirule-v1691.test.js` — fifteen cases: each rule firing, each "same side"
  negative, R_4s refused across runs, 4_1s across levels and runs, 10_x counting two per run and broken
  by one crossing point, the 1_2s warning never rejecting, a rule firing with no warning still shown,
  the stated order, the three-level rules declared unevaluated, zero SD and mismatched run counts
  refused, and a blank line not read as a zero.
- 18,743 unit tests and 494 MCP tests green; lint clean; `check-catalog-truth` at 2,365 with group E
  215 → 216 and README source links 2,265.
- The four nuances driven in a real browser: both levels past +2s → 2-2s; one level past 2s → in
  control with a 1-2s warning; opposite sides → R-4s and not 2-2s; past 3s → 1-3s.
- `docs/unbuilt-tools.md` regenerates to 12 unbuilt, down from 13.

## What is left in this spec

One item, and it is conditional: task 1.5 asks for Levey and Jennings 1950 (*Am J Clin Pathol*
20:1059) "if reachable; otherwise leave 'not opened' on the page", which is what the
`levey-jennings-limits` tile says today.

An earlier draft of this spec claimed `42 CFR 493.803` and `493.1255` were unopened. That was wrong:
the change's task list records both as read on October 19, 2026 (1.3 with 493.841 and 493.851, where
the 80% and two-of-three rules sit, and 1.4 for calibration verification). The "not opened" marks sit
in the proposal's source table, which the build then superseded.
