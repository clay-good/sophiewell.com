# spec-v1011 — A percentage is bounded by whatever it is a percentage of

## The finding

spec-v1010 filled in the bounds the site had already agreed on twice. This one covers a set where
the bound needs no agreement at all, because it follows from what the number *is*: 44 fields whose
label carries a `%` had no maximum.

A saturation, a burn's percentage of body surface, a blast percentage, a hematocrit, a dextrose
concentration — each is a part of a whole, and a part cannot exceed its whole. `SpO2 (%)` accepting
1007 is not a clinical judgment call.

## The trap that makes this not a one-line rule

Eleven of those 44 are a percent of a **predicted** value — `FEV1 (% predicted)`,
`DLCO (% predicted)`, `Peak VO2 (% predicted)`, `FVC % predicted`. A healthy person routinely
exceeds 100% of predicted; a fit young adult at 120% of predicted FEV1 is normal, not a typo.
Capping those at 100 would have made the tool cry wolf at the commonest healthy reading it sees.

So the rule is not "a label with a % gets 0-100". It is:

- **A percent of a whole** — of the blood, of the body surface, of the solution, of the red cells —
  is bounded 0 to 100. **29 fields.**
- **A percent of a predicted or reference value** is not bounded at 100 and was left alone.
  **11 fields.**
- Four more were skipped by hand and are named below.

## The four skipped, and why

| Field | Why |
| --- | --- |
| `abl-hcti` | one field offers "Initial hematocrit (%) **or** hemoglobin (g/dL)" — two scales, no single bound |
| `db-dfvc` | a signed 24-week **change** in FVC % predicted: negative is the finding |
| `ps-fev1`, `ps-fvc` | measured in liters; the `%` in the label refers to what they are used to compute |

## Observed and deliberately left alone

Two fields declare a maximum that is tighter than physiology: `mecki-lvef` caps LVEF at 80% and
`mg-ef` caps ejection fraction at 90%. An LVEF above 80% happens in a hyperdynamic ventricle, so
under spec-v1009 those will warn on a real value. They are the tile's own statement of its model
domain, though, and spec-v1010's rule holds here too: **fill in absences, never narrow or widen what
a tile deliberately declared**. Changing them is a clinical call for the tile's author, not a
sweep's.

## Proof

- No documented worked example falls outside a bound this adds — checked before any edit, the same
  pre-flight spec-v1010 used.
- `declared-ranges`, `example-fills`, `unit-toggle`, `deep-link-round-trip` and the full lint chain
  pass.
