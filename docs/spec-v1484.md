# spec-v1484 — Community Fluorosis Index (Dean)

The catalog had individual dental indices, but not the population index for dental fluorosis. Dean's
Community Fluorosis Index (CFI), from 1934, is still the standard way a survey reports how much of a
population has fluorosis, and whether it is a public health concern.

## What it does

The reader enters how many of the people surveyed fall in each of Dean's six categories, 0 if none:

| Category | Weight |
|---|---|
| normal | 0 |
| questionable | 0.5 |
| very mild | 1 |
| mild | 2 |
| moderate | 3 |
| severe | 4 |

The CFI is the weighted mean: the sum of each count times its weight, divided by the number of people.
It reads as a negative (up to 0.4), borderline (0.4 to 0.6), slight (0.6 to 1), medium (1 to 2), marked
(2 to 3) or very marked (3 to 4) public health concern. Above 0.6, fluorosis is a public health issue.
The answer also gives the share of people scored very mild or worse.

The printed bands share their endpoints. A value exactly on one is read into the lower band, and the
answer says so. Every count is required, because a blank count is not assumed to be none. Counts must
be whole numbers, and at least one person must be scored.

## Sources

- Dean HT. Classification of mottled enamel diagnosis. J Am Dent Assoc 1934;21:1421-1426.
- The weights, the formula and the bands as applied in BMC Public Health 2024 (PMC11267771).

## Tests

`test/unit/dean-fluorosis-cfi.test.js`: the worked example (0.88, slight); the weights; the band edges
and the shared-endpoint note; the 0.6 line; blank, empty and fractional counts.
