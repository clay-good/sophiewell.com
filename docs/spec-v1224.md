# spec-v1224 — the clamp that stood in for a guard, on seven risk engines

Seven of the catalog's ten-year cardiovascular-risk tiles reported a risk
percentage from a systolic blood pressure of **3000 mmHg**:

| tile | reading at SBP 3000 |
| --- | --- |
| `score2` | 10-year CVD risk 49.2% — very-high category. |
| `score2-op` | 10-year CVD risk 49.2% — very-high category. |
| `mesa-chd` | MESA 10-year CHD risk: 21.5% with CAC 100, 19.78% without. |
| `framingham-cvd` | Framingham 10-year general-CVD risk 47% (vascular age 98.5). |
| `reynolds-risk` | Reynolds 10-year cardiovascular risk 89.8%. |
| `ascvd` | High (>=20%) |
| `prevent` | High (>=20%) |

Every one is a number a reader acts on, computed from a pressure ten times the
highest ever recorded in a human.

## Why it happened

`lib/cvrisk-v103.js` centers its predictors with a clamp:

```js
const csbp = (clamp(s, 60, 250) - 120) / 20;
```

That clamp is **right, and it is not a guard**. The published betas are fitted on
a range, and centering an SBP of 260 at the edge of that range is honest
modelling. What it also does is make every larger number indistinguishable from
260 — so the value that should have been refused arrives at the band table
looking like a hypertensive emergency, which is a reading the tile is happy to
report. It is the shape spec-v1207 named: **a clamp is the opposite of a guard.**

The two engines in `lib/scoring-v4.js` reached the same place by the other road.
`ascvdPce` takes `ln(sbp)` and `prevent10yr` splits SBP at 110 into two linear
terms; neither saturates, so the risk simply climbs with whatever is entered and
lands in the top band.

## The fix

`BOUNDS.sbp` in `lib/bounds.js` has said 20–300 mmHg, *"values outside 20–300 are
not survivable"*, since spec-v53. All seven now check it, and the sentence the
reader sees is `boundsAdvisory`'s. **No clinical number is decided in this wave.**

The check runs **after** each function's own missing-value branch, keeping
spec-v1207's rule intact from the other side: a reader who left the field blank
is asked for it by name, not told the value they did not enter is out of range.

## The agent surface, again

`ascvdPce` and `prevent10yr` return a `{ score: null, band }` guidance shape, and
`band` is prose. An agent calling `compute_calculator` got:

```json
{ "valid": true, "result": { "score": null, "band": "Input above the plausible range for systolic blood pressure…" } }
```

— the refusal presented as the answer. That was true of all three refusal paths
on both engines, including the two that predate this wave (the blank-field
message and the age-range message), so all six now carry `valid: false`. This is
the trap spec-v1205 recorded: a guarded library can still tell an agent its
refusal is valid.

## The tests that asserted the old behaviour

Four overflow-safety tests drove `sbp: 1e9` and asserted the risk came back a
finite probability — which is what the clamp guaranteed, and what the guard now
refuses. Their intent is real (no `Infinity`, no `NaN` from a fuzzed predictor),
so each keeps every other predictor at `1e9` and moves SBP to **300**, the top of
the envelope. The fifth, `mesa-chd`'s, fuzzes the calcium score and was
unaffected.

`test/unit/cv-risk-sbp-envelope.test.js` pins both halves for all seven: the
impossible value is refused, and the tile still answers at its worked example and
at exactly 300 mmHg, which is a hypertensive emergency and not an error.

## Ledger

`scripts/probe-envelope-unbounded.mjs`: **116 fields / 68 calculators → 109 / 61.**
The probe's first section — the rows whose impossible value produced a
*reassuring* reading — has stood at zero since spec-v1211 and is unchanged.
