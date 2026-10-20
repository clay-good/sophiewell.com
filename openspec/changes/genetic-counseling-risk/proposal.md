# Change: Genetic counseling risk arithmetic

**Status:** Built October 19, 2026: six tools shipped, recorded in [docs/spec-v1660.md](../../../docs/spec-v1660.md).
The X-linked prior presets stay off (no source for the 2/3 sister prior was read).
**Audience:** the genetic counselor, the obstetric and pediatric clinician who orders carrier
or prenatal screening, and the patient reading a report that says "residual risk 1 in 630".
**Program index:** [docs/spec-v1654.md](../../../docs/spec-v1654.md).

## Why

A name search of the live catalog on October 19, 2026 for "carrier", "Bayes", "Hardy",
"recurrence risk", "X-linked", "autosomal", "consanguin", "cell-free", "cfDNA", "NIPT",
"aneuploidy" and "trisomy" found no genetics risk tool (the hits were a pituitary
classification and a cystic fibrosis diagnostic criteria set). Yet the arithmetic genetic
counselors do by hand is small, closed, and over a century old: Hardy-Weinberg proportions
(Hardy 1908, Weinberg 1908), Bayes' theorem (Bayes 1763), Wright's coefficient of relationship
(Wright 1922). The positive predictive value of a screen at a given prior is already live in
`fagan-post-test`.

These are exactly the arithmetic identities the catalog's admission rule accepts when the source
is named and the constants are reader input. The constants here (a disease incidence, a
detection rate, a maternal-age prior) vary by population and laboratory, so they are inputs,
echoed in the result.

## What changes

Six new tools, group E (Clinical Math & Conversions). Tool 6 was dropped as a duplicate (see below):

| # | id | Name | Source |
|---|---|---|---|
| 1 | `hardy-weinberg-carrier` | Carrier Frequency From Disease Incidence (Hardy-Weinberg) | Hardy 1908, *Science* 28:49 (open copies found; build: read the letter) |
| 2 | `residual-carrier-risk` | Residual Carrier Risk After a Negative Screen | Bayes 1763; the ACMG position statement names the two inputs (build gate: statement not opened) |
| 3 | `recessive-couple-risk` | Autosomal Recessive Risk to a Pregnancy From Two Carrier Risks | arithmetic identity (Mendelian 1/4) |
| 4 | `x-linked-bayes-risk` | X-Linked Carrier Risk With Unaffected Sons (Bayes) | Bayes 1763; worked-method text (build gate) |
| 5 | `coefficient-of-relationship` | Coefficient of Relationship and Inbreeding for a Consanguineous Couple | Wright 1922, *Am Nat* 56:330 (build gate: not opened) |
| 6 | ~~`screen-ppv-from-prior`~~ | dropped: duplicates `fagan-post-test` | |
| 7 | `bayes-risk-table` | Bayesian Risk Table (Prior, Conditional, Joint, Posterior) | Bayes 1763 |

## Why this passes the admission rule

Each tool is an input and a computed output with the working shown as the four-row Bayes table
counselors already write. No tool recommends a test or a reproductive decision; each reports
the probability the entered figures imply. No population table ships: carrier frequencies,
detection rates and age-specific priors are reader input, with the sentence that they must come
from the laboratory's report or a cited population study.

## What this does not do

- No carrier-frequency table by ancestry, no maternal-age aneuploidy table, no variant
  database. (ACMG's 2021 guidance itself cautions that exact carrier frequencies and test
  sensitivities are not known; the tools say so.)
- No pedigree drawing, no multi-generation likelihood beyond the single-step Bayes the tools
  show, no linkage.

## Impact

- New capability `genetic-counseling-risk`.
- Dropped on October 19, 2026: the live `fagan-post-test` already returns this in its sensitivity and specificity mode (pre-test 0.1%, sensitivity 99%, specificity 99.9% gives 49.8%), and `diagnostic-2x2` recomputes predictive values at a target prevalence.
- `fagan-post-test` is the two-hypothesis case of `bayes-risk-table`; link them.
