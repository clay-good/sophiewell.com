# spec-v1236 — the labels were already written down

The long tail of the dead-end refusal: **twenty-five library files**, each with
its own copy of a reader that returns one `null` for a blank field, a non-number
**and** a value outside its own bounds — and a caller that reads `null` as
absent. So a plasma creatinine of 250 mg/dL was answered with *"Enter … plasma
creatinine (mg/dL)"*, and retyping it produced the same sentence.

[spec-v1226](spec-v1226.md) and [spec-v1227](spec-v1227.md) did the files that
build a `missing` list, where each field already had a label to reuse. These do
not. Each tests its reads in one go —

```js
if (una === null || pcr === null || ucr === null) {
  return { valid: false, message: 'Enter urine sodium (mEq/L), plasma creatinine (mg/dL), and urine creatinine (mg/dL).' };
}
```

— and that sentence is worth keeping. `gradeFault` **skips a blank**, so it goes
*before* the branch: a blank falls through to the caller's message, which still
names every empty field at once, and only the out-of-range value is called out.

## Where the labels came from

Every one of these tiles already publishes a reader-facing label and unit per
argument — to agents, through `mcp/fields.js`. There was no need to invent a
single one:

```
['Plasma creatinine (mg/dL)', o.plasmaCr, 0.1, 30]
```

label and unit from the registry, bounds from the caller's own `fin(o.plasmaCr,
0.1, 30)`.

**Read per calculator, never merged across the catalog.** A first pass built one
`arg → label` map from every tile at once and gave `bronchodilator-response` the
label *"Pre-transfusion platelet count (x10⁹/L)"* for its `pre` — because
`percent-platelet-recovery` also has a `pre`. An arg name is unique inside one
calculator and means nothing outside it. The test pins both tiles naming their
own quantity.

## Reading the caller's bound wrong

Six of the twenty-five test `n < 0` where the rest test `n <= 0` — that is, **zero
is a legitimate answer**: a count of 0 lytic bone lesions, 0 failed
antiarrhythmic drugs. `gradeFault` reads `lo === null` as *strictly greater than
zero*, so taking the first reader for the second refused a real answer:

> CAAP-AF, 0 failed antiarrhythmic drugs → *"Number of failed antiarrhythmic
> drugs must be greater than 0."*

Three existing tests caught it — `caap-af: low score below threshold` and two
Durie-Salmon staging tests, all of which score zeroes on purpose. **A mechanical
pass over twenty-five hand-written readers will read at least one of them wrong;
the existing suite is what says which.**

## Ledger

`probe-envelope-unbounded`, second section: **51 rows → 11**, and 89 when this
run began. Its first section stays at zero.

What is left is eleven rows whose tiles take a different shape again, and the
files the pass skipped on purpose: a function with more than one missing-value
branch (it cannot know which one guards which read), and one whose arg has no
registry label at all (`vasograde`'s `modifiedFisher`).
