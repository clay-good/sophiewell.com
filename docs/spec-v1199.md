# spec-v1199 — the early-warning family, and a refusal only the browser saw

[spec-v1198](spec-v1198.md) took the acid-base cluster out of
`scripts/probe-envelope-unbounded.mjs` and left it at 149 fields across 81
calculators. Sorting the rest by tile puts one family at the top: the
early-warning and ICU-severity scores.

Every band in these is a saturating step, so an impossible observation scores
exactly the points a survivable extreme does and the total lands in a risk band
with nothing to mark it.

| tile | a value it scored |
|---|---|
| `news2` | SBP 3000, pulse 3000, temperature 450 |
| `mods` | creatinine 250 mg/dL, platelets 20,000 K/µL, GCS 157 |
| `saps-ii` | sodium 2000, potassium 100, bilirubin 600, WBC 2000 |

## The rule was one function away, again

`mews` has had the guard since [spec-v1181](spec-v1181.md). `news2` sits
**directly above it in the same file**, and the comment inside `mews` names it:

```js
// spec-v930: same as news2 -- unguarded band chains, so an empty observation
//            set returned ">=5: increased risk of death, ICU admission".
```

The two were fixed together for the *missing* observation in
[spec-v930](spec-v930.md) and separately for the *impossible* one. Fifth
occurrence of that shape in this run.

`saps-ii` has the same instinct written down for one variable out of twelve —
`agePts(Math.max(0, Math.min(130, a)))` — and clamps nothing else.

## The one only the browser saw

`mews` was guarded, and its refusal reached an **agent** as a success.

```js
if (fault) return { score: null, band: fault, missing: [] };
```

`mcp/tools.js` treats a library result as an answer unless it is `null` or
carries `valid: false`. So `compute_calculator` on a systolic of 3000 returned:

```json
{ "valid": true, "result": { "score": null, "band": "Input above the plausible range …" } }
```

A careful agent reads the band. One that reads `score` gets `null` from a call
that reported success. The missing-input case was never exposed this way because
`mcp/fields.js` marks all five inputs `required`, so the validator refuses before
compute is reached — the envelope is the one path that gets past it.

`valid: false` is all it needed; the MCP layer already falls back to `raw.band`
for its message, and the view keys off `score`, not `valid`, so the page is
unchanged.

## After the missing-value branch, never inside it

Held throughout, and it is why `mods` checks only the values that are present:
the probe keeps a 121-row section for tiles whose out-of-range refusal calls an
entered value *missing*, so retyping it produces the same sentence. That section
stands at 121 before and after.

## A test that pinned it

```js
test('overflow / extreme inputs yield a finite mortality in [0,100]', () => {
  const r = sapsII({ ...SICK, age: 1e9, wbc: 1e9, bun: 1e9, gcs: 3 });
  assert.equal(r.valid, true);
```

The overflow-safety property is real and worth keeping; the case it was written
on is now refused. It is split in two — extreme inputs are refused with a range
message and no `NaN`, and the mortality is still finite and in [0,100] at the
**top edge of every envelope at once**, which is where the property can still be
asserted. Fifth test in this run that recorded the behaviour being fixed.

## Proof

The probe reads **149 → 132** fields and **81 → 77** calculators. Lint, 13,487
unit tests, 448 MCP tests and five browser sweeps pass.

## Left in the family, on purpose

- `meows` **throws** a `TypeError` for an out-of-range vital rather than
  returning a refusal, which the output-safety layer turns into a
  `COMPUTE_ERROR`. That is a different shape and a different fix.
- `lods` already carries bounds and reports an out-of-range value as one of the
  values still owed — five of the 121 rows in the probe's other section, where
  retyping the number produces the same sentence.
- `harvey-bradshaw` **clamps** an out-of-range subscore and reports
  "Harvey-Bradshaw Index 17: severe (> 16)" with the clamping in a parenthetical.
  An answer computed from a value the tile has already decided was impossible.
