# spec-v1081 — two indices that counted independence, and the example that had none to count

Three more off [spec-v1079](spec-v1079.md)'s queue, and a fourth defect that only
became visible once the first two were fixed properly.

## Katz and Lawton have the Braden's shape

Both count the activities a patient manages **alone**, so both fail in the same
two directions [spec-v1080](spec-v1080.md) described:

- Sliders parked at `1` read **"Katz ADL 6 of 6: full independence"** for
  somebody nobody assessed.
- Summing only the rated items understates independence, so it reads as **more**
  impairment than the patient has — an alarm from nothing
  ([spec-v1036](spec-v1036.md)).

Neither is earned, so both ask:

> Katz ADL not scored: rate **feeding**. The index counts the activities the
> patient manages alone, so a partial sum reads as more impairment than they
> have, and leaving the rest at "independent" reads as none.

## A refusal that was arriving as a stack trace

Both libraries **threw** on a missing item:

```js
assert.throws(() => katzAdl({ bathing: 1, dressing: 1, toileting: 1 }));
```

An activity nobody has rated yet is an ordinary state of a form being filled in,
not a caller error — and [spec-v1015](spec-v1015.md) is the whole spec about
refusals reaching the reader in the words of a stack trace. Both now return a
refusal the tile renders and an agent receives as `INCOMPLETE`. A value that is
*present and impossible* still throws, because that is a caller error, and the
existing assertions for `2`, `-1`, `0.5` and `NaN` are unchanged.

## The declaration that hid a third tile

Neither index declared `values`, so the fourteen items were `kind: 'number'` with
no options — the [spec-v1075](spec-v1075.md) blind spot again. Declaring
`['0', '1']` is the [spec-v770](spec-v770.md) contract, and it brings both under
the picklist gate.

It also made them visible to the all-max example probe from spec-v1080, which had
walked past them for exactly that reason. Re-running it with the declarations in
place surfaced a tile the first pass could not see, in the **other** direction:

> `p-possum` — every one of eighteen variables at grade **1**, the healthiest
> option, opening a surgical-mortality predictor on **0.2% mortality**.

Its sibling `possum` demonstrates a realistically sick patient (32/18, 50%
mortality). `p-possum` now uses the same eighteen grades, which fixes the opening
screen and makes the two directly comparable — the point of P-POSSUM being the
recalibration of the same inputs.

## Worked examples, running total

| Tile | Was | Now |
|---|---|---|
| `braden` | 23, "not at risk" | 14, moderate risk |
| `barthel` | 100, "independent" | 65, moderate dependency |
| `katz-adl` | 6 of 6, "full independence" | 4 of 6, moderate impairment |
| `lawton-iadl` | 8 of 8, "full independence" | 5 of 8, moderate impairment |
| `p-possum` | 0.2% mortality | 29.7% mortality |

`graeb-ivh` and `four-ts-hit` remain at their maxima and are correct there: on
those two the top of the scale is the alarming end.

## What holds it

An assertion per index covering all three states, and the old throwing contract
replaced by an explicit test of the new one. Verified locally against the **whole**
chromium suite rather than a chosen subset — 237 passed, 1.1 h — because
[spec-v1078](spec-v1078.md) proved that changing a worked example reaches tests
that have nothing to do with the tile.

## The lesson

> **Fixing a contract can widen a finder.** Neither index declared its options,
> so a probe keyed on declared options could not see them, and the tile behind
> them stayed hidden too. Two of the five examples fixed in this programme were
> only reachable after an unrelated-looking declaration was put right.
