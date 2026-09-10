# spec-v1206 — the last two whose analytes were already in the table

`scripts/probe-unguarded-sibling.mjs` is down to its residue. These are the two
remaining rows whose measurements `lib/bounds.js` **already declares** — which is
the whole test for whether a row is workable at all
([spec-v1189](spec-v1189.md): enforce what is written, decide nothing clinical).

## `haps`

`cdaiCrohns` sits above it in `lib/gi-v126.js` and was guarded in
[spec-v1181](spec-v1181.md), for a haematocrit of 750% that drove CDAI to
**-3975** — a negative total on a 0-600 scale — and printed it as *clinical
remission*.

HAPS reads the **same two analytes** and never got the guard. Its failure is
milder and worth stating precisely: an impossible haematocrit does not produce a
nonsense number, it simply fails the "is this normal?" test and moves the answer
to **not harmless**. Alarming rather than reassuring — and still a verdict from a
number that cannot be.

A haematocrit of **75%** is the top of the envelope, a real and abnormal value,
and still reads "not harmless". The test says so, because the useful thing to pin
is where the guard stops.

## `hscore-hlh`

`ipssrMds` and `sokalCml` in `lib/hemonc-v94.js` are both guarded. A temperature
of 450 °C scored the top band:

```
HScore 167: estimated HLH probability ~54% (Fardet 2014).
```

169 is the discriminating threshold, so that reading sits just under it — from a
temperature no patient has had.

**Only the temperature.** `lib/bounds.js` declares no envelope for ferritin,
triglyceride, fibrinogen or AST, and picking one is a clinical judgment that
belongs with a source. A test asserts that a ferritin of 1e9 still scores, so the
absence is a **record** rather than an oversight — the same discipline
[spec-v1205](spec-v1205.md) applied to the CPIS leukocyte count.

## Where this leaves the finder

**6 modules, 7 functions**, from 13 and 41 at
[spec-v1202](spec-v1202.md). What is left is not more of the same work:

- `urineOsmolalGap` — fixed, in a way the probe cannot see
  ([spec-v1202](spec-v1202.md)).
- `nmr` — bounds its own inputs inline, `pos(o.anc, 0.001, 500)`. It calls no
  *watched* helper, which is all the probe can tell.
- `refeeding-risk`, `lundBrowder`, `mrcSumScore`, `modifiedMarshall` — need a
  `BOUNDS` entry that does not exist. `refeeding-risk` is the one to do first and
  the reason to do it properly: a body-mass index of 9999 answers, and it removes
  a NICE minor criterion rather than adding one, so the error is on the reassuring
  side. That is a sourcing task — a BMI envelope with a citation — not a wave.

## Proof

Lint, 13,505 unit tests, 448 MCP tests and four browser sweeps pass, including
`example-correctness` across all four shards.
