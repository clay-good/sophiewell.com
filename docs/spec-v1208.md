# spec-v1208 — one field, two ranges

[spec-v1207](spec-v1207.md) guarded `refeeding-risk` and the page then said this,
in two live regions stacked above the answer:

```
Check the highlighted value: BMI (kg/m^2) is 9999, outside the 5 to 80 this field accepts.
Input above the plausible range for body mass index (5 to 200 kg/m^2); verify the units.
```

Both sentences are right about their own source. The first reads the input's
`min`/`max` attributes, which a view module writes by hand; the second reads
`lib/bounds.js`. One field, two published ranges — the drift this repo keeps
finding, in the shape it keeps taking: one rule written twice.

That wave fixed its own tile. This one asks the general question.

## The probe needs no mapping

`scripts/probe-envelope-unbounded.mjs` carries the hard part of this kind of
work: deciding which envelope a labelled field belongs to. `BOUNDS.sodium` is
*serum* sodium, and a urine sodium of 20 is normal — so that probe validates its
own label-to-envelope map against every worked example before it trusts a row.

`test/integration/two-ranges-one-field.spec.js` has no map and needs none. When
both sentences fire, **the page itself has already declared they are about the
same field**. The probe only reads the two ranges and compares them. A row is a
defect, not a suspect: there is no reading under which one field having two
published ranges is right.

It was negative-tested before it was trusted — the `refeeding-risk` ceiling was
put back to 80, the probe reported exactly that one row, and reporting went to
zero when it was restored.

## What it found

**25 fields across 12 tiles**, every one the same shape:

| tile | fields | field said | envelope says |
| --- | --- | --- | --- |
| `saps-ii` | heart rate, systolic BP | 0–400 | 10–300 / 20–300 |
| `saps-ii` | PaO2, sodium, potassium, bicarbonate, bilirubin | 5 hand-written ranges | the table's |
| `abi` | all four cuff pressures | 0–400 | 20–300 |
| `base-excess` | pH, bicarbonate, haemoglobin | 0–8, 0–60, 0–25 | 6.5–8, 2–60, 2–25 |
| three compensation tiles | PaCO2, bicarbonate | 0–200, 0–60 | 5–200, 2–60 |
| `cdai-crohns`, `haps` | haematocrit | 0–100 | 5–75 |
| `stewart-sid-sig` | sodium | 0–200 | 90–200 |
| `ipss-r-mds` | haemoglobin | 0–25 | 2–25 |
| `euroscore2` | age | 0–120 | 0–130 |

## Why the fix changes nothing that is computed

Each of these tiles **already** refuses outside the envelope — that is why the
second sentence was on screen at all:

```
abi, right ankle 350 mmHg
  -> Input above the plausible range for systolic blood pressure (20 to 300 mmHg)
```

So the looser attribute never let a value through. It was inert, and its only
effect was to print a contradicting range. Per [spec-v1198](spec-v1198.md) — a
view's ceilings **are** `lib/bounds.js`'s — all 22 declarations now read the
table. This changes what the page *says*, not what it computes.

`euroscore2` is the one that ran the other way: its age field warned above 120
while the tile happily computes to 130, so it was flagging a value it accepted.

## Proof

After the fix the sweep reports **0**, with its reach unchanged — 1,706 tiles,
1,001 fields driven past their max, and the same 34 fields where both sentences
still speak. The count fell because rows were fixed, not because the probe
stopped looking ([spec-v1202](spec-v1202.md)).

`declared-bounds-probe` confirms no tile now warns about its own worked example,
which is the direction tightening a floor could have broken. Lint, 13,509 unit
tests, 448 MCP tests and the range gates pass.
