# spec-v905 — DKA resolution criteria

## What this gives you

Whether ketoacidosis has actually resolved — and which of the four conditions is doing the work.

## §1 The definition

**Glucose < 200 mg/dL**, together with **at least two of**:

| | |
|---|---|
| Serum bicarbonate | ≥ 15 mEq/L |
| Venous pH | > 7.30 |
| Anion gap | ≤ 12 mEq/L |

## §2 Resolution is not the glucose

This is why the tile exists. A normal glucose is **one of four conditions**, not the answer.
Stopping the insulin infusion when the glucose falls is the commonest way rebound ketoacidosis
happens: the infusion is what closes the gap, and the glucose falls first. On every result.

## §3 Two of the three, not all three — and a closed gap alone is one

A patient whose anion gap **and** bicarbonate have come back still meets the definition while the
venous pH lags, because resuscitation fluid leaves a hyperchloremic acidosis behind. The converse
matters just as much: a closed gap **on its own** is one of three and does not meet it.

Writing that sentence is what caught an error in my own draft. The first version claimed a
hyperchloremic picture with a closed gap "still meets the definition" — it does not, it is 1 of 3,
and the tile's own printed output said so. Same failure mode as spec-v888: prose asserting
something the arithmetic contradicts, caught by reading the output rather than the source.

## §4 The anion gap tracks the ketosis, not measured ketones

The nitroprusside reaction does not detect β-hydroxybutyrate, the dominant ketone early, so
measured ketones can appear to **rise** as a patient improves and β-hydroxybutyrate converts to
acetoacetate. On every result.

## §5 A missing value is not a met value

When fewer than three secondary values are entered the tile says how many are absent and that the
anion gap in particular is the one to have — rather than quietly counting a blank as a failure
the reader might read as a measurement.

## §6 Resolution is not the moment the infusion stops

Subcutaneous insulin is given and overlapped with the infusion, conventionally by 1 to 2 hours,
before the infusion comes down. Printed on a resolved result, which is exactly where the tile
would otherwise read as permission.

## §7 Sourcing (spec-v97 gate)

- Kitabchi AE, Umpierrez GE, Miles JM, Fisher JN. *Hyperglycemic crises in adult patients with
  diabetes.* Diabetes Care. 2009;32(7):1335-1343.

No tracked guideline issuer, so no `docs/citation-staleness.md` row is owed.

## §8 Posture

Decision support, not a verdict. It compares values already measured against a published
definition. It does not manage an infusion, and it does not decide when to transition.

Catalog 1693 → 1694.
