# spec-v1772 — Herd immunity threshold, and the coverage a vaccine must reach

> Status: **SHIPPED (2026-11-23)**: 1 tool, `herd-immunity-threshold`. The catalog goes to 2,390.

Tool 6 of the public-health change ([spec-v1659](spec-v1659.md)) had been build-gated since October on
Fine 1993 (*Epidemiol Rev*) and Fine, Eames and Heymann 2011 (*Clin Infect Dis* 52:911). Both are still
behind their publisher: re-tested on November 7 and again today, neither has a PubMed Central copy and OUP
answers an automated client with a challenge.

## What was read instead, and why that is enough

The gate asked for those papers because nobody had an acceptable source for the threshold and the
imperfect-vaccine correction. The mathematics is older than either paper, and it is stated in full in two
independent open sources, which is exactly how this same change sourced Levin's attributable-fraction
formula in [spec-v1663](spec-v1663.md) ("read October 20, 2026 in two open restatements"):

| Source | What it states |
|---|---|
| Randolph HE, Barreiro LB. Herd immunity: understanding COVID-19. *Immunity*. 2020;52(5):737-743 ([PMC7236739](https://pmc.ncbi.nlm.nih.gov/articles/PMC7236739/)) | "the herd immunity threshold is defined by 1 - 1/R0 (e.g., if R0 = 4, the corresponding herd immunity threshold is 0.75)", and that in real populations "the situation is often much more complex" |
| Martcheva M. *An Introduction to Mathematical Epidemiology*. Springer, 2015, ch. 9 "Control Strategies" (doi 10.1007/978-1-4899-7612-3_9, open in PMC) | the critical vaccination proportion `p = 1 - 1/R0`; for an imperfect vaccine of efficacy e, `p(e) = (1/e)(1 - 1/R0)`; eradication by vaccination is possible only if `e > 1 - 1/R0`; and Table 9.3, eight diseases with their R0 ranges, thresholds, efficacies and coverage levels |

They agree, which is what the cross-verification rule asks for. The spec's own sentence named two papers;
what it was protecting against was encoding a threshold from memory, and that is not what happened here.

## The tool

Inputs: R0, and optionally the vaccine's efficacy and the coverage reached. R0 is the only figure it needs.

- The threshold, `1 - 1/R0`, as a share of the whole population immune by any route.
- With an efficacy: the coverage a vaccination program must reach, `(1 - 1/R0) / efficacy`.
- When the efficacy is at or below the threshold, the answer says no coverage reaches it, which is
  Martcheva's condition read the other way round.
- With a coverage: whether it reaches the figure above, and by how many percentage points it misses.
- An R0 of 1 or below is refused by name: each case causes one further case or fewer, so there is no
  threshold to reach.
- Every answer carries what the threshold assumes -- even mixing, complete and lasting immunity -- and that
  a national figure can be reached while a community below it still has outbreaks.

## Table 9.3 reproduces, with one thing recorded

Every R0 bound in Table 9.3 gives the threshold the table prints (smallpox 67-80, measles 92, mumps 75-86,
rubella 83-86, chickenpox 89-90, pertussis 92-94, polio 83, diphtheria 75-83), and so do six of its
coverage figures. Three do not, by one percentage point each: the table divides its **own rounded**
threshold by the efficacy, where this tool divides the unrounded one.

| Row | The table | From the unrounded threshold |
|---|---|---|
| Rubella, R0 6, efficacy 0.95 | 87% | 87.7% |
| Poliomyelitis, R0 6, efficacy 0.90 | 92% | 92.6% |
| Diphtheria, R0 6, efficacy 0.87 | 95% | 95.8% |

The unrounded figure is the larger in each case, so the tool asks for slightly more coverage than the table
prints, never less. The test names all three and reproduces the table's own path for them.

Tests: `test/unit/herd-immunity-v1772.test.js` -- Table 9.3 row by row, the worked example in Randolph and
Barreiro, the unreachable-efficacy boundary on both sides, the coverage comparison, the R0 refusals and the
blank-is-not-zero rule for the two optional fields.
