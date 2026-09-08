# spec-v1142 — the patient owes $0.00, from benefits nobody entered

Twelve waves of this programme were driven by one probe's first section, and
[the last commit](incomplete-input-program.md) recorded that every row of it had
been read. So this wave asked what the probe **cannot see**.

## The reach

`probe-omitted-field-decides` grades a dropped field two ways: a boolean
`abnormal` flipping false→true, or one of `bandLabel / band / stage / severity /
grade / risk / category / class` moving. Measured across the catalog:

| | tiles |
| --- | --- |
| set a boolean `abnormal` | 984 |
| no flag, but carry a band/stage/severity string | 543 |
| **neither** | **155** |

Those 155 could never produce a row in any of its three sections — and they are
the converters, the dosing tools and the whole billing family, where **the
number is the conclusion**. A fourth section now asks the same question of them:
drop one field, and does a finite output move without the tile saying so? It
skips `kind === 'bool'`, because rule 4 says an unticked checkbox is a real "no"
— stated in the probe rather than inherited from the number/enum filter written
for the other sections, which is how five earlier checks in this programme went
blind ([spec-v1106](spec-v1106.md)).

The filter was negative-tested before it was trusted: the catalog's kind is
`bool`, not `boolean`, and the first version excluded nothing.

**First run: 44 fields across 20 calculators.** Three were defects.

## `allowed-amount` and `nsa-cost-share`

Both take three cost-share terms — remaining deductible, coinsurance percentage,
copay — and each defaulted to `0`:

```js
const coinsurancePct = num('coinsurancePct',
  input.coinsurancePct == null ? 0 : input.coinsurancePct, { min: 0, max: 100 });
```

Individually that is right. A copay-only plan has no coinsurance; a met
deductible has nothing remaining. **All three at zero is not a benefit design —
it is an empty form**, and what it produced was the reassuring reading:

```
charge $1,000, allowed $600, nothing else entered
  Patient owes $0.00        payer payment $600.00

NSA emergency, QPA $800, billed $2,000, nothing else entered
  Patient owes $0.00        plan pays $800.00
```

So the terms stay individually optional and the **set** is required. State one
and the tool answers; state none and it says what it is missing (rule 2). The
numbers that do not depend on the benefit terms are still reported — the
contractual write-off, and the NSA prohibited balance bill, which is the
protection itself.

A typed `0%` is still an answer and still returns a balance of zero (rule 1).

## `cob-calc`

`secondaryWouldPayCents` defaulted to `0`, and three of the four methods are
**defined by it**: lesser-of takes the lower of it and the balance,
non-duplication takes it minus the primary payment, MSP takes the lowest of it
and two caps. Blank, all three said:

```
Secondary pays $0.00; patient owes $120.00
```

A bill for the whole balance the primary left, from a field nobody filled in.
Come-out-whole is benefits-less-paid and never reads it, so it stays optional —
the guard is on the three methods that need it, not on the input.

## Rule 8, six times on two tiles

The browser fields were rendered with a **value**, not a placeholder:

```js
moneyField('Deductible remaining ($)', 'aa-ded', '100', '0')
numField('Coinsurance (%)', 'aa-coins', '20', '0')
```

A pre-filled `0` is an answer the reader never gave, and it is the answer that
zeroes the bill. All six are placeholders now. The renderer's `numv(id) || 0`
coercions went with them: a blank money field passes through as a blank
(`money()`), so the library decides rather than the edge.
