# spec-v1114 — reading my own eleven waves back through the finder

Nothing new was found by looking for new defects. This wave came from running
`probe-omitted-item.mjs` and asking a different question: **of the twenty-four
tiles fixed since [spec-v1103](spec-v1103.md), how many does the finder still
flag?**

Four did. One was wording. Three were the same mistake, made three times.

## Rule 13 exempts the verdict, not the number under it

[spec-v1111](spec-v1111.md) drew this distinction and applied it to
`gvhd-grade`'s organ stages — grade IV rules in, but printing *"liver stage 0"*
for an unstaged organ is still a fabricated observation. Having written that
down, I then failed to apply it to **numbers** in three tiles fixed on either
side of it:

| Tile | The verdict was exempt, and so was… |
|---|---|
| `euroscore2` ([spec-v1107](spec-v1107.md)) | the **predicted mortality percentage**. "very high" cannot be talked down by an unstated factor — but the figure under it can, and 8.15% printed where a complete call gives 10.66% |
| `bfcrs` ([spec-v1110](spec-v1110.md)) | the **severity total**. A screen-positive reading printed "severity total 12/69" as though all 23 items had been scored |
| `ses-cd` ([spec-v1111](spec-v1111.md)) | **moderate**, which is not the ceiling. I wrote `!high`, and `high` is true for moderate *and* severe. A partial 9 of 56 could be 20, which is severe |

The `ses-cd` one is worst, because it is rule 15 exactly — *a fix scoped by one
worked case is scoped to that case*. I tested the empty call, where the band is
"remission", and never tested a partial one.

All three now floor the number while leaving the verdict alone:

> EuroSCORE II predicted in-hospital mortality **at least 10.66%** (very high
> predicted operative risk, **which the unstated factors cannot lower**)…

That second clause matters: it is the reader's assurance that the *tier* is not
also provisional.

## `mdq` said the right thing in the wrong words

Its refusals — *"the co-occurrence question is unanswered"*, *"the functional
impairment is not rated"* — are correct and are not in
`test/lib/asking-language.js`. Rule 16 says to widen a list a real gate depends
on only after measuring what it un-flags, so the tile changed to the house's
`is needed` and the list did not.

One widening **was** measured and made: the disclosure pattern
`of (?:the )?\d+ (?:items|…)` now allows one adjective, because the house writes
both *"8 of the 20 items"* and *"7 of the 13 symptom items"*. Measured across
every tile and every droppable field, it moves exactly **one** field from
flagged to exempt — `masld-criteria`, which was already refusing rather than
answering.

And `mdq`'s positive band said *"12 of 13 symptoms YES"* with twelve answered,
which reads as thirteen asked. It now says *"12 of the 12 answered"*.

## The fuzz harness caught a `ReferenceError` my own check missed

Moving `answeredSymptoms` into the `failed` list put a `const` above its own
declaration. My manual check exercised the positive branch and never reached it;
`spec-v53`'s adversarial matrix did, on the very first baseline call:

```
mdq(baseline) threw ReferenceError: Cannot access 'answeredSymptoms'
before initialization -- only TypeError/RangeError are allowed
```

**A `const` used above its declaration is a throw, not an `undefined`** — the one
thing that makes hoisting order a correctness question rather than a style one.

## The result

`probe-omitted-item.mjs`: **226 fields across 78 calculators → 134 across 70**,
across this wave and [spec-v1113](spec-v1113.md), and **none of the
twenty-four tiles this programme has fixed since spec-v1103 is still flagged.**

The practice that produced it is the one already in the notes for gates: read
your own work back through the tool that found the original defect, and treat
its silence about your fix as a claim to be checked rather than a result.
