# spec-v1048 — Every documented number needs its own

## The gate that could pass on a coincidence

`example-correctness` asks, for every calculator that ships a worked example, whether each number in
the documented `expected` string appears in what the tile renders. `docs/incomplete-input-program.md`
has listed its weakness as open for a dozen specs:

> **`example-correctness` matches numbers loosely.** It asks whether each documented number appears
> somewhere in the output, which a wrong answer can satisfy by coincidence.

Each expected number was checked *independently*, against every number in the output. So one output
number could satisfy several documented ones.

## What it was hiding

**`ranson-bisap`.** Documented: *"Ranson 2 — roughly 2% mortality; BISAP 2 — low risk."* Rendered:
*"Ranson 2 — **<1% mortality**; BISAP 2 — Low risk."* The sweep passed it, because the **2** from the
score satisfied the **2%** from the mortality.

And the tile disagreed with itself. Its own interpretation table — printed on the same page under
"How this is calculated" — says *"Ranson 0-2: Roughly 2% mortality in acute pancreatitis"*, and the
three bands beneath the offending one carry the figures Ranson 1974 is cited for: 15%, 40%, 100%. The
`<1%` was the outlier. It is now `~2%`.

**`lab-interpret`.** It renders nothing until "Interpret values" is clicked, so this sweep — which
fills the example and reads — has never seen its output. It looked like it was passing because the
documented range `(4.0-5.6%)` falls within tolerance of the `5.4` sitting in the A1C **input box**,
and the fallback haystack includes input values. Two documented numbers, one number to be. It is now
in `SCENARIO_ONLY` with that reason, beside `pa-lint` and the screener tiles.

## The rule

A **matching**, not a search: each documented number is an edge to the output numbers it could be,
and the assertion is that a perfect matching exists on the documented side. Standard augmenting-path
search over lists of at most a few dozen.

Measured before shipping: across all 1,699 examples, the stricter rule newly failed **three** tiles,
and every one was a true positive — the two above, plus two whose `expected` echoes an input the
output does not print. That is what made it shippable: a gate that tightens by three is a gate
people will keep.

## The rule behind the rule

**A gate that checks each fact independently can be satisfied by one fact doing several jobs.** The
question to ask of any "does the output contain X" check is not whether X is there, but whether X
has something of *its own* to be.
