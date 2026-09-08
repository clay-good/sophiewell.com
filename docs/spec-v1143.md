# spec-v1143 — the payment side, and a table that had never rendered

[spec-v1142](spec-v1142.md) added a fourth section to
`probe-omitted-field-decides` for the 155 tiles that carry neither a severity
flag nor a band, where **the number is the conclusion**. It printed 44 fields
across 20 calculators; that wave read the three on the patient's side of the
bill. This one reads the rest.

## Two defaults that were the top of their table

| Tile | Omitted | It answered |
| --- | --- | --- |
| `anesthesia-units` | the medical-direction modifier | `medicalDirection = 'aa'` — **personally performed, 100%**, the highest-paying row |
| `split-shared` | the physician minutes | *"the NPP performed 15 of 15 total minutes (more than half)"* |

The anesthesia modifier is the recurring shape: **a lookup whose miss-value is
the table's most favourable level.** AA and QK differ by exactly half the
payment on the same units, and the tile's own notice already said

> Enter the ASA base units, the time, the CF, **and the medical-direction
> modifier** (which sets the concurrency percentage).

Rule 23 for the fourth time in this programme: the message lists it, then the
tool answers without it. Required now, in the library and in the adapter — and
the browser select, which opened on AA because a select always carries a value,
gets a `-- choose the modifier --` first option (rule 8).

`split-shared` is rule 11 in minutes. Both times defaulted to `0` and only the
**total** had to be positive, so one blank left the tool asserting that the other
provider had done all of it — about a provider nobody had timed. The browser's
guard was `rawEmpty(phys) && rawEmpty(npp)`, which went quiet the moment one was
filled: one blank field, not all of them, again. Both are
required on the time basis; a typed `0` is still an answer, and the MDM basis
never reads them.

## Two silent defaults, named rather than removed

Rule 21 — *a default is not a defect; a SILENT default is*.

- `drg-payment` defaulted the **capital standardized amount** to zero and
  reported only the combined wage-adjusted base, so a DRG came out short by the
  capital share with nothing on screen to say so. A hospital modelling the
  operating component alone is a legitimate call, so the default stays and the
  reading names it.
- `sequestration-adjust` defaulted the **beneficiary cost-share** to zero, which
  makes the whole allowed the program-payment portion and the 2% cut
  proportionally larger. A preventive service with no cost-share is a real case,
  so the same treatment.

## The table on `drg-payment` had never rendered

Verifying the disclosure above is how this turned up. The `derivation()` helper
guarded a null **value** and not a null **row**:

```js
for (const [term, def] of pairs) {        // pairs contains `cond ? [..] : null`
```

Four call sites write a conditional row that way. Destructuring `null` throws,
`safe()` catches it, and the engine's own message went on screen where the table
belongs:

```
Base DRG payment: $9,750.00
…
.for is not iterable
```

On `drg-payment` that is every case that is **not** a post-acute transfer — the
ordinary one — and on `drug-wastage` every case with no least-waste combination.
Skipping a conditional row is the helper's job, not the caller's; fixed in both
copies of it.

## The six rows the fourth section still prints

Read, and each stands:

| Row | Why |
| --- | --- |
| `era-balance` CO / PR | dropping an adjustment group is *supposed* to unbalance the remittance, and the reading says **OUT OF BALANCE … a posting line is missing** |
| `drg-payment` capital, `sequestration-adjust` cost-share | fixed above — they now disclose, and the probe reads it |
| `anesthesia-units` modifying units | zero qualifying-circumstance units is the ordinary claim, not an observation |
| `lab-interpret` A1C | a panel of independent optional labs; one fewer lab is one fewer interpreted row |
| `peds-weight-conv` lb / oz | pounds and ounces are one compound quantity, and the tile echoes both back — *"7 lb 0 oz = 3.175 kg"* names what it used |
| `allowed-amount` deductible / coinsurance | with one of the three stated the benefit design is real, and [spec-v1142](spec-v1142.md) requires the set, not each field |

The probe's numeric arm reads the top-level `note` that `texts()` skips for the
other three sections. Measured before changing it, as the house rule requires:
it moves exactly **four** rows from flagged to exempt, and all four are the
disclosures above.
