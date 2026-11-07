# spec-v1693 — The preset the source refused

> Status: **SHIPPED (2026-11-07)**. Closes [spec-v1660](spec-v1660.md) task 1.3 by **reading the source
> and declining to build the preset it asked for**. No new tile; `x-linked-bayes-risk` gains its
> source, and a sentence that stops the figure being read off the wrong relative.

## The gate asked for a preset; the source says the preset is wrong

The design asked for "2/3 for the sister of an isolated case under the usual assumptions" as a preset
prior, gated on reading "a source that states the 2/3 prior for the sister of an isolated case (with
its mutation-rate assumptions)".

The source read is Ferlini, Neri and Gualandi, *Risk assessment and genetic counseling in families with
Duchenne muscular dystrophy*, Acta Myol 2012;31:195, open at `PMC3631803`. It contradicts the preset
twice.

**1. The two-thirds belongs to the mother.** The figure comes from Haldane's mutation-selection
equilibrium:

> Since DMD boys do not pass on their defective allele to the following generation, in every generation
> one third of mutated alleles is 'lost' from the population ... the selection of mutated alleles from
> the population must be compensated for by an equivalent rate (i.e. one third) of de novo mutations.

That makes two thirds of **mothers** of isolated cases carriers. A sister's prior is her mother's
carrier probability times the one-half chance of inheriting the mutant X. **Offering a sister 2/3 would
hand her the mother's figure and double her risk.**

**2. Even for the mother, the clean 2/3 is an idealization.** It assumes equal mutation rates in the
sexes, which the same paper contradicts by mutation type — "Point mutations and duplications arise
preferentially during spermatogenesis whereas deletions mostly arise in oogenesis" — and it cites
Passos-Bueno's empirical split for mothers of isolated DMD cases: "likelihoods of 62.3% to be carriers,
of 6.7% to carry a germline mosaic and of 31% to bear two normal alleles". **Three outcomes, not the
two a 2/3-against-1/3 prior implies, and 62.3% rather than 66.7%.** Germline mosaicism leaves a
recurrence risk even when the mother's lymphocytes are negative: 14% in Bakker, 20% with a 10–30%
interval in van Essen.

## So the task is closed by not building it

The prior stays the reader's — which is what the tile already did, but for the weaker reason that no
source had been read. Now the tile says whose figure the two-thirds is:

> The prior is as entered, and it is specific to the relative it describes: for an isolated case the
> two-thirds figure from Haldane's equilibrium is the MOTHER's, and a sister's prior is that times the
> one-half chance of inheriting the mutant X. No prior is preset here.

This is the gate working as designed. A docs-only reading of the design would have shipped a preset
that was wrong about which relative it applied to, in a tool whose whole output is a risk figure a
counselor repeats to a family.

## What moved

- `lib/x-linked-bayes-risk-v1660.js` — both reasons recorded at the decision, with the quotes, so the
  preset cannot be restored without meeting them; and the reader-facing note names the relative.
- `META['x-linked-bayes-risk']` — the citation was bare "Stated arithmetic" with no URL and now cites
  the paper with its PMC link. README source-link count 2,266 → 2,267.
- The task is ticked with the finding, not with "done".

## Proof

- `test/unit/x-linked-prior-not-preset-v1693.test.js` — six cases: no preset and the result saying so,
  the note naming the mother and the sister's halving, a reader's 2/3 carried through unchanged rather
  than silently corrected, the halving per unaffected son (2/3 → 1/2 → 1/3 → 1/5), the two reasons and
  both empirical figures present in the source comment, and the tile citing a reachable source.
- 18,759 unit tests and 494 MCP tests green; lint clean; example-correctness, answer-said-once and the
  320px catalog sweep green.
