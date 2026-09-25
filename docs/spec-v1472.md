# spec-v1472 — CGM time in range targets

A continuous glucose monitor report prints five percentages; the reader wants to know which of the
consensus targets they meet. No tile checked CGM percentages against these targets (the only "time in range" in the catalog is the INR one, `rosendaal-ttr`).

## Source, read 2026-09-25

Battelino T, Danne T, Bergenstal RM, et al. Clinical Targets for Continuous Glucose Monitoring Data
Interpretation: Recommendations From the International Consensus on Time in Range. *Diabetes Care*.
2019;42(8):1593-1603. doi:10.2337/dci19-0028 (PMC6973648). Table 2 defines the ranges, the %CV target
(36% or less) and data sufficiency (14 days, 70% of data); Table 3 sets the targets.

| Target | Type 1 or type 2 | Older or high-risk |
|---|---|---|
| Time in range, 70-180 mg/dL | above 70% | above 50% |
| Time below 70 mg/dL | below 4% | below 1% |
| Time below 54 mg/dL | below 1% | not listed |
| Time above 180 mg/dL | below 25% | not listed |
| Time above 250 mg/dL | below 5% | below 10% |

The inequalities are strict: a time in range of exactly 70% does not meet "above 70%".

## Behavior

Population and the five percentages are required; a blank is asked for, never defaulted. The five
must add up to 100 within 1 point (reports round each range), or the tile asks for them again. Time
below 70 is the two low ranges added; time above 180 is the two high ranges added. The answer counts
the targets met and names each unmet one with its value.

Notes: %CV against 36% or less (and the below-33% footnote when it is 33-36); days worn and time
active against 14 days and 70%, or that they were not entered; for type 1 or type 2, the age under 25
footnote (about 60% when the A1C goal is 7.5%); each 5% of time in range matters; targets are
personalized. Pregnancy is not covered: its targets use 63-140 mg/dL, which the five ranges cannot
give.

## Tests

`test/unit/cgm-time-in-range.test.js`: all met, each target at its strict cutoff, the older
population's three targets, the sum check, blanks, %CV and data-sufficiency notes.
