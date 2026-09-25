# spec-v1415 — a whitespace-only value is a blank, in the shared guards

`inputFault()` and `gradeFault()` in `lib/num.js` are the two guards about a hundred calculators
share. Both tested `raw === ''` **before** trimming, and `Number('   ')` is 0 — so a field holding
only spaces reached them as a measured zero:

| helper | before | now |
|---|---|---|
| `inputFault` | with a floor of 0, `'   '` passed as the value 0 | "Enter the ...", as for a blank |
| `gradeFault` | with a floor above 0, `'   '` was refused as out of range | skipped, as for a blank, so the caller's own missing-value message runs |

spec-v1241 through v1243 found this and, rather than change a helper every other tile calls, worked
around it in four libraries with a local `blankIfEmpty()` (`lenke-scoliosis`, `ecst-carotid`,
`portopulmonary-hypertension`, `hepatopulmonary-syndrome`). With the helper fixed, the four copies
are deleted: one rule, written once.

## Was it reachable?

Measured before the change, over every number field of every worked example (3,321 fields, 1,766
tools), driving each as `''` and as `'   '`: **no field computed from the whitespace-only value.**
The agent surface's validator already rejects it as not a number, and a browser number input never
yields one. So this closes a latent defect for any direct caller of the library, and removes the
duplicated rule, rather than changing an answer anyone could see.

## Tests

`test/unit/num.test.js`: `inputFault` asks for `'   '` and `'\t'` and still accepts `' 0 '`;
`gradeFault` skips `'   '` and still refuses `' 5 '` below a floor of 10. Negative-tested: with the
old `lib/num.js` restored, both new tests fail. The four tiles' own suites pass unchanged.
