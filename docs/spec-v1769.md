# spec-v1769 — Sample sizes for proportions (WHO, Lwanga and Lemeshow 1991)

> Status: **SHIPPED (2026-11-21)**: `sample-size-proportion` and `sample-size-two-groups`, tools 10 and 11 of the
> [public-health-epidemiology](../openspec/changes/public-health-epidemiology/) change, proportion formulas only.
> Catalog 2,389.

## Source, read November 21, 2026

Lwanga SK, Lemeshow S. *Sample size determination in health studies: a practical manual.* World Health
Organization, Geneva, 1991. ISBN 92 4 154405 8. In WHO IRIS as handle
[10665/40062](https://iris.who.int/handle/10665/40062) (scanned PDFs). The gate's earlier note said the manual had no
IRIS copy; it has one.

| Part | Used for |
|---|---|
| Table 1, Examples 1 and 2 | one proportion, absolute precision: n = z²(1−α/2) P(1 − P) / d² |
| Table 2, Examples 3 and 4 | one proportion, relative precision: n = z²(1−α/2) (1 − P) / (ε² P) |
| Example 2 | a design effect multiplies n (cluster design effect 2: 96 becomes 192) |
| Table 4, Examples 9 and 10 | the difference of two proportions, absolute precision: n = z²(1−α/2) [P1(1 − P1) + P2(1 − P2)] / d² per group |
| Table 5 (page 36), Examples 11 and 12 | the two-proportion test, per group: {z(1−α) √[2P̄(1 − P̄)] + z(1−β) √[P1(1 − P1) + P2(1 − P2)]}² / (P1 − P2)², z(1−α/2) when two-sided |

## What the tools do

| | `sample-size-proportion` | `sample-size-two-groups` |
|---|---|---|
| Modes | absolute precision (points) or relative precision (% of P) | hypothesis test, or the difference to a precision |
| Inputs | P, confidence 90/95/99%, d or ε, design effect | P1, P2; α (above 0 to 20%), power (50 to 99%), one- or two-sided; or confidence and d; design effect |
| Rounding | nearest whole number, as Tables 1 and 2 print it | up, as Tables 4 and 5 print it |
| Output | n | n per group and the total |

- A design effect is optional (blank is 1, simple random sampling, and the answer says so). It must be 1 to 100;
  the result is multiplied by it and rounded up.
- Refused: a proportion of 0% or 100%, a precision of 0 or 100 or more, equal proportions in the test mode, a blank
  or unchosen field. z is the exact normal quantile (1.644854, 1.959964, 2.575829; 1.281552 and 0.841621 for power).
- The test mode names the variance form the manual prints: pooled under the null, unpooled under the alternative.
- When P1 or P2 is under 5%, the answer says the manual gives a different (arcsine) formula and tables for very small
  proportions, which these pages do not compute.

## Checks

`test/unit/sample-size-v1769.test.js` (13 tests), every value against the manual:

| Example | Manual | Computed |
|---|---|---|
| 1: P 20%, d 5 points, 95% / 90% | 246 / 173 | 246 / 173 |
| 2: P 50%, d 10 points, 95%; design effect 2 | 96; 192 | 96 (96.04); 192 |
| Table 1: P 5%, d 2 points, 95% | 456 | 456 (456.2) |
| 3: relative 10%, P 50%, 95% / 90% | 384 / 271 | 384 / 271 |
| 4: relative 5%, 95%, P 25% / 40% | 4,610 / 2,305 | 4,610 / 2,305 |
| 9: difference, P1 = P2 = 50%, d 5 points, 95% | 769 | 769 (768.3) |
| 10: difference, 40% and 32%, d 5 points, 95% | 707 | **704** |
| 11: 5% vs 15%, one-sided, α 5%, power 90% | 153 | 153 (152.27) |
| 12: 60% vs 50%, two-sided, α 5%, power 90% | 519 | 519 (518.04) |
| Table 5b: 5% vs 10%, one-sided, power 80% | 343 | 343 (342.1) |

**Example 10 differs on purpose.** The manual reads V from Table 4a rounded to 0.46 and prints 707. The exact
V = 0.4 × 0.6 + 0.32 × 0.68 = 0.4576 gives 703.1, rounded up to 704. The tool computes V exactly.

## Not done

- **Means** (the design's σ branches of tools 10 and 11): the manual says "Continuous response variables are not
  considered in this manual". They wait on another source.
- **Finite-population correction and non-response inflation** (in the design): not in the manual, not built.
- **Unequal allocation** (in the design): not in the manual; the answer says the groups are equal.
- **The small-proportion (arcsine) tables** (Tables 5e to 5h, Example 13): not computed; a note appears instead.
