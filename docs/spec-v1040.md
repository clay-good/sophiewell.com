# spec-v1040 — `Number(null)` is 0

## The trap

Every guard in this codebase that refuses to compute from a missing value is written one of two
ways:

```js
if (!Number.isFinite(Number(v))) return null;      // written for Number('') -> NaN
if (v === null) return null;                       // written for a null
```

The renderers used to pass `Number(input.value)`, so a blank field arrived as `NaN` and the first
form worked. The whole spec-v1006→v1038 program has been converting them to pass **`null`** instead
— and `Number(null)` is **`0`**, which is finite. So every guard of the first form quietly stopped
seeing the thing it was written for, *because of the fix meant to help it*.

Five calculators had a correct, deliberate missing-input guard that could no longer fire:

| Tile | The guard that stopped working | What it printed instead |
| --- | --- | --- |
| `hacor` | "Enter all six HACOR inputs to score" | HACOR 0: not in the high-risk band |
| `hys-law` | "Enter a total bilirubin with its upper limit of normal" | One lab criterion is not met: the bilirubin threshold. The rule is not reached. |
| `stewart-sid-sig` | "Enter sodium, potassium, ionized calcium…" | SIG −122.2 mEq/L: no excess unmeasured anion |
| `delta-check` | (its `num()` returned 0 for a blank) | The result has risen by 2.4 over 12 hours, past the thresholds |
| `cohens-kappa` | (a blank cell counted as zero cases) | Kappa −0.923: worse than chance |

`hys-law` is the one to read twice. Its message for a bilirubin that came back *below* the threshold
and its message for a bilirubin that never came back were **the same sentence**.

## The fix

The coercion helpers now return null for a blank before they coerce, in `hacor`, `hys-law`
(`ratio`), `acidbase-v129` (`fin`/`nonneg`/`pos`), and the laboratory-QC family that shares one
`num()` helper: `delta-check`, `bland-altman`, `cohens-kappa`, `sigma-metric`,
`biological-variation-goals`, `airway-resistance`, `udca-response`, plus the two paediatric growth
modules.

## The finder, and why it is not a gate

`scripts/probe-blank-coercions.mjs` lists every `Number.isFinite` check in `lib/` whose surrounding
lines do not exclude a blank. It reports **146**, and most are harmless — a clamp on a rating item
where 0 is the floor anyway, or a `&& n > 0` test that a zero fails correctly. Turning that into a
failing gate would mean 146 exemptions on day one, which is a ledger nobody reads.

So it is a **report**, to be run when touching a coercion helper. The gate that actually catches
this class is `required-field-agreement.spec.js`, which asks the question from the outside: does the
browser answer something the agent surface refuses? That is how all five of these were found.

Ledger: 44 → 39.

## The rule

**A guard against a missing value has to be written against the shape the caller actually sends.**
When a renderer changes what a blank field looks like, every guard downstream is a guard against the
old shape until someone checks. `isBlank(v) || !Number.isFinite(Number(v))` covers both.
