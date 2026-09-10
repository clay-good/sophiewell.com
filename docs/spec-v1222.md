# spec-v1222 — a reading with nothing to split on

[spec-v1221](spec-v1221.md) took `one-blank-field-probe` from twenty rows to two
and named what the two were:

> Both are one limitation of the shared `addedText`, and it is worth naming
> because the **gate** uses it too. … Teaching `addedText` to segment a reading
> that has no sentence punctuation is the next chunk, and it belongs with the gate
> rather than in a report.

This is that chunk.

## The boundary that was not there

`addedText` implements [spec-v1196](spec-v1196.md)'s movement rule: compare a
reading before and after a field is cleared, and judge the vocabulary only against
the sentences the reading **added**. It split on sentence punctuation.

A reading assembled from DOM nodes has none. `#q-results` textContent runs the
rows together, so `anion-gap-dd` reads:

```
Anion gap: 26Albumin-corrected AG: 26delta-AG = 14delta-HCO3 = 10…
```

Clear the optional albumin and one row goes; nothing is added. But with no
boundary to split on, the whole run was a single chunk, that chunk differed, and a
reading that had added nothing was reported as adding ninety-two characters.

Splitting also where **a digit meets a letter** recovers the row edge — `26Albumin`,
`1.40Pure`, `10delta` — which is exactly where the concatenation happened:

```js
addedText('Anion gap: 26Albumin-corrected AG: 26delta-AG = 14…',
          'Anion gap: 26delta-AG = 14…')            // -> ''   (was 92 chars)
```

## Why finer is the safe direction

Both sides are split the same way, so this changes which chunks **match**, not
what either reading contains:

- a chunk unchanged in both is now recognised as unchanged and filtered out — the
  false "added" text this removes;
- a chunk the reading genuinely gained is still absent from `before` and still
  reported;
- a value that **moved** — the recompute-from-the-blank these sweeps exist for —
  still produces a differing chunk. `Anion gap: 26` → `Anion gap: 31` still reads
  as added.

The second and third are asserted, not argued: a test pins that a new clause and a
changed number both survive the finer split. A change that only ever removes
false positives is worth nothing if it also removes true ones, and the test is
what separates those claims.

## Which surface this touches

`one-blank-field.spec.js` is a **gate**, and it runs in CI. The direction of the
change is toward fewer flags, so the risk it carries is not a missed defect but
the opposite of what [spec-v1221](spec-v1221.md) worried about — and either way,
reasoning about a gate is not verifying it. All four shards were run locally
against the built site before this shipped.

That matters because the alternative was inference: the argument above is sound
and I have been wrong before about a gate I did not run. The e2e queue on this
repository is eight runs deep, so waiting for CI to answer was not an option;
running the gate here was.

## Proof

Both new unit tests fail on the old split and pass on the new. The full
`one-blank-field` gate passes locally, all four shards, and lint (19 gates) and
13,579 unit tests are green. `anion-gap-dd` and `carboxyhemoglobin`, the two rows
spec-v1221 left, are the cases the first test reproduces.
