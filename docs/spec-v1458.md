# spec-v1458 — no reading prints "null", and a gate that keeps it that way

[spec-v1457](spec-v1457.md) found `lvh-criteria` printing "Cornell voltage > null mm (men)" when
the sex was blank: a template string interpolating a value that is null exactly when an input is
missing. That shape is easy to write anywhere, so the whole catalog was swept for it.

## The sweep

Every tool's worked example, and the example with each field dropped in turn: about 8,400 library
calls. Any reader-facing string containing `null`, `undefined`, `NaN` or `[object Object]` is
reported.

| hit | what it was |
|---|---|
| `nnt-arr` "NNT undefined" | the word in its mathematical sense; allowed by exact phrase |
| `heaven-criteria` "deliberately left undefined" | ordinary prose; allowed by exact phrase |
| `nichd-fhr` with variability blank | **"Category null"** as the short label an agent receives |

## The `nichd-fhr` fix

With the variability blank the tracing cannot be categorized, and the tool already said so in its
sentence. But its short label read "Category null", and the structured result reported
`variability: "moderate"` (and likewise defaults for the decelerations and the sinusoidal pattern)
because the library picks the normal value internally for its logic (spec-v1102 made that logic
account for it) and then echoed the pick back. The result now reports what was **entered** (`null`
for a feature not entered), and the label reads "Not yet categorized". The page never showed the
label, so this reached agents only.

## The gate

`test/unit/no-null-in-readings.test.js` runs the same sweep on every unit-test run and fails on any
new hit outside the two exact prose phrases. Negative-tested: with the old `nichd-fhr` restored it
fails naming "Category null". It also asserts it reached more than 5,000 runs, so a catalog-loading
fault cannot turn it into a silent pass.
