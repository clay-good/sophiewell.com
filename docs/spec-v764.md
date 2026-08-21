# spec-v764.md — Four reasons a field never filled

> Status: **SHIPPED (2026-08-20).** Extraction only. No tile added, no compute changed.
> Catalog stays **1564**.

## Why

[spec-v763](spec-v763.md) took field recovery to 81%. Categorising the **929 fields that still
filled nothing** found four causes, and only one of them was the ambiguity the design intends.

| Cause | Fields | |
|---|---|---|
| Two fields on a tile share their terms | 357 | mostly genuine — repeated-item scales |
| **Multi-word term cannot match** | **325** | **a bug** |
| Other | 232 | mixed |
| Enum value ends in punctuation | 8 | a bug |
| Label is entirely stopwords | 7 | a bug |

## The big one: terms that could never match

Terms are built by dropping stopwords from a label. `Bend over and pick up a slipper` becomes the
term `bend pick up` — and then it is matched **contiguously**, against a query that still contains
*over* and *and*. It could never match. **A third of every miss in the catalog was this.**

Terms now match with up to three filler words between each pair, bounded so the looseness cannot
reach across a clause.

## The one that took two passes

`abc-scale` asks about riding an escalator **holding the rail** and **not holding the rail**.
`not` is a stopword, so both reduce to the same term, collide, and neither fills.

Keeping the negation in strict mode is only half the fix. With gaps allowed, the *unqualified*
field's term `ride escalator holding rail` still matches the `not holding` phrase — so it matched
both, and vetoed itself.

The general rule: for fields that collide, a hit carrying a word belonging **exclusively to a
sibling** is a hit on the sibling's phrase, and is dropped. That handles negation without a rule
about negation.

## The small ones

- **Punctuated enum values.** `O-`, `3+`, `63+` have no word boundary after them, so a trailing
  `\b` could never match. Anchored on "not a word character" instead.
- **Labels that are entirely stopwords.** `Value`, `Level` identify nothing; the dom key
  (`cp-val`, `lk-dis-l`) usually carries a word that does.

## Measured

Probes phrased the way a person says it:

| One field per query | v763 | v764 |
|---|---|---|
| Correct | 3949 (81.0%) | **4104 (84.1%)** |
| **Wrong value** | 0 | **0** |

| Whole tile per query | v763 | v764 |
|---|---|---|
| Every value recovered | 1008 (75.8%) | **1058 (79.6%)** |
| Recovered nothing | 99 | **87** |
| Fields recovered | 3962 (81.2%) | **4110 (84.3%)** |

Looser matching bought 155 fields **without a single wrong value** in the per-field measurement,
which is the trade that had to hold.

## What is left, and one thing that did not work

After these fixes, of the fields whose loose terms collide with a sibling:

| | |
|---|---|
| Resolved by strict mode + the foreign-word rule | **108** |
| Still unfilled | 333 |
| — of which identical **even in strict mode** | **47** |

The 47 are the irreducible ones, and the samples say why: the discriminator lives in the
parenthetical. `Maxillary (R)` vs `Maxillary (L)`. `Cutting food (patient)` vs
`Cutting food (alternate)`. `From benzodiazepine` vs `To benzodiazepine`.

**Keeping the parenthetical in strict mode was tried and reverted.** It sounds like the obvious
fix, and measured on realistic phrasing it made things *worse* — 84.1% → 83.4%, gaining nothing:

> A parenthetical only disambiguates if the reader says it, and they do not. Someone reading
> `Maxillary (R)` off the screen types "maxillary 2", which is genuinely ambiguous on a tile that
> also has `Maxillary (L)`. Refusing is the correct answer.

Do not re-try this without a probe that models a reader who actually says the discriminator.

## Gotchas

- The gap is bounded at three words on purpose. There is a test that a term must not span an
  arbitrary distance; without it, a term reaches past its own phrase and claims a number belonging
  to something else.
- The foreign-word rule needs the *strict* word sets of both siblings, not the loose ones — the
  loose sets are identical by definition, which is what made them collide.

## Proof

- `test/unit/query-fill.test.js` — 5 new: a multi-word term matching across dropped words, the gap
  staying bounded, a negation as the only discriminator, a punctuated enum value, and the dom-key
  fallback.
- 26 query-fill unit tests, 11463 unit, 399 mcp, lint, a11y: green.
