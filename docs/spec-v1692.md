# spec-v1692 — The ACMG resource was open, and it prints a different number

> Status: **SHIPPED (2026-11-07)**. Closes [spec-v1660](spec-v1660.md) task 1.2. No new tile; one
> shipped tile gains its primary source, the source's own figure, and three cautions.

## The gate

The task read: "not read: not open access; tool 2 cites Bayes' theorem as stated arithmetic". The 2021
resource **is** open access. Its PubMed record carries a PMC id, and `PMC8488021` serves the full text:
*Screening for autosomal recessive and X-linked conditions during pregnancy and preconception: a
practice resource of the American College of Medical Genetics and Genomics*, Genet Med 2021;23:1793.

Fourth gate re-tested today that turned out to be about reachability rather than the document. (The
2013 position statement was not separately opened; the 2021 resource is the current one and supersedes
it for this arithmetic.)

## ACMG's printed formula is not the posterior, and the tile now says so

The resource states:

> An individual's residual risk to be a carrier after having a negative screening test can be
> calculated as follows: Population Carrier frequency × (1 − Detection Rate).

The tile computes the exact Bayes posterior, which renormalizes that product over both outcomes. **They
are different numbers.** At a carrier frequency of 1 in 25 and a detection rate of 90%, ACMG's product
is 1 in 250 and the posterior is 1 in 241; at a carrier frequency of 1 in 2 the product is 1 in 20
against a posterior of 1 in 11.

A reader who checks this tool against that sentence would conclude it is broken. So the tile prints
ACMG's own figure beside its own, and names the relationship: the product is the numerator of the same
calculation, and it understates the posterior by a factor of about the carrier frequency.

**The comparison is shown only when the gap is material** — when the understatement reaches 1%. The
first implementation compared the rendered "1 in N" strings, which differ even at a carrier frequency
of one in a million (1 in 10,000,000 against 1 in 9,999,991) where the gap is 0.00009% and saying so is
noise. That is why the rule is relative rather than textual, and a unit test pins both ends.

## Three cautions, on every result

- "A negative screening result does not eliminate the risk of being a carrier for the conditions
  screened but does reduce that risk. **The residual risk to be a carrier for any condition is never
  zero.**"
- "It is impractical to provide a precise residual risk after carrier screening that includes
  simultaneous analysis of multiple uncommon or rare variants within genes", because "the carrier
  frequency and detection rate may not be known for each condition being screened".
- On reporting: "calculations depend on the patient's self-identified ethnicity", "data sets and
  populations used to establish carrier frequency can vary", and for many X-linked genes "carrier
  frequencies are imprecise".

These are carried even on a reassuring result, which is tested — a 99.9% detection rate drives the
residual risk below 1 in 10,000, and that is exactly when it might be read as a rule-out.

## What moved

- `lib/residual-carrier-risk-v1660.js` — the ACMG product reported when material, and the cautions.
  The Bayes table is still the first thing shown, which a test asserts.
- `META['residual-carrier-risk']` — the citation was "Stated arithmetic: Bayes' theorem" with no URL
  and is now the practice resource with its PMC link, so the tile has a primary source and a reader can
  reach it. README source-link count 2,265 → 2,266.
- `docs/citation-staleness.md` — the row still described the tile as a bare identity. It now records
  that the tile quotes a revisable practice resource, and that ACMG is **not** in `ISSUER_PATTERN`
  while being the only tile citing it, so the next ACMG-citing tile is the moment to reconsider that.

## Proof

- `test/unit/residual-carrier-risk-acmg-v1692.test.js` — seven cases: the product reported at 1 in 250
  against a posterior of 1 in 241, the divergence at a carrier frequency of 1 in 2, the materiality
  rule at both ends, all three cautions present, the cautions present on a reassuring result, a 100%
  detection rate still refused, and the Bayes table still first.
- 18,753 unit tests and 494 MCP tests green; lint clean; example-correctness, answer-said-once and the
  320px catalog sweep green; the result read in a browser.
