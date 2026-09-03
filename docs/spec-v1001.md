# spec-v1001 — The gates' own comments had drifted

## The finding

Today's work has repeatedly been "a number with more than one copy drifts unless something checks
it". The gate scripts that enforce that rule were breaking it in their own headers.

**`check-citations.mjs`** described rule 7 as: *"**Eight** tiles whose source is a book chapter, a
meeting abstract or a pre-1946 paper that no index carries are grandfathered."* The set is
`SEARCH_URL_GRANDFATHERED`, thirty lines below in the same file, and it holds **twelve**. A second
comment in that file already said twelve. The header had been wrong since the set last grew.

**`check-catalog-truth.mjs`** said: *"exactly one tile carries the new `shape: 'document-linter'`
field. The remaining **254** tiles default to `shape: 'numeric'`."* The catalog is 1,704. That
number was true roughly 1,450 tiles ago.

Neither is load-bearing — no check reads them — which is exactly why neither was noticed.

## What changed

Both are removed rather than corrected. A count restated in prose beside the thing it counts is a
second copy, and correcting it only resets the clock.

The third copy was load-bearing, and it is gone too. The number of grandfathered search links
lived in **three** places: the README's *"Twelve more say 'Search PubMed for this source'"*, a
literal `searchLinks !== 12` in `check-catalog-truth.mjs`, and the set itself.
`check-catalog-truth` now imports `SEARCH_URL_GRANDFATHERED`, compares against `.size`, and checks
the README's **word** against that size through a number-word table — so linking one of the twelve
fails the build until the README sentence is updated, and names the word it should say.

## Proof

Negative-tested in both directions against the real files:

- Removing one tile from `SEARCH_URL_GRANDFATHERED` while leaving the README alone fails with
  *"the README should say "Eleven more say ..." for the 11 grandfathered search links; META has 12
  search links."*
- Editing the README to "Eleven more say" while the set holds twelve fails with the same message
  naming "Twelve".

Full lint chain and 13,066 unit tests pass.
