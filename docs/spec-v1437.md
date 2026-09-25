# spec-v1437 — the page sweeps caught what the library tests could not

CI's end-to-end job went red on the [spec-v1412](spec-v1412.md) push, in two sweeps every new tool
must pass:

| sweep | what it does | what it found |
|---|---|---|
| `no-answer-from-nothing-sweep.spec.js` | clears every number box on the page | `adult-ett-depth` still answered "21 cm by sex" |
| `one-blank-field.spec.js` | clears one number box at a time | the same answer, when the height alone was cleared |

The answer itself was right: the sex rule (Roberts 1995) needs no height. What the sweeps read is
whether the answer **asks for** or **names** the missing value, in the house vocabulary
(`test/lib/asking-language.js`). The note said "Add the height for the height-based estimate", and
"add" is not a word the house uses to ask. Now: "Enter the height ...". The height-only case's
"Add the sex" became "Choose the sex".

The same reading of the other tools added in this run found one more that would have failed once its
CI job reached the sweep: `blood-4h-window` with the pump rate cleared answers the minimum-rate
question without saying why. It now opens "No pump rate was entered, so this is the slowest that
finishes in time".

## How it was checked

Both sweeps were simulated over all 23 tools added in spec-v1412 through spec-v1436 (clear every
number field; clear one at a time), then the two specs were run for real in chromium. Unit tests
that pinned the old wording were updated.

## The lesson, for the next tool

`npm run release:check` does not run end-to-end tests. A tool that answers from a subset of its
inputs must word its "the rest would add ..." note with a house asking verb (enter, choose, select,
complete, provide) or a disclosing phrase ("no X was entered"), or the page sweeps fail after push.
