# spec-v1136 — the fifth check narrowed to `kind === 'number'`

Every defect [spec-v1134](spec-v1134.md) and [spec-v1135](spec-v1135.md) fixed was
on an **enum select**: the HEAR history and ECG, the MASCC burden of illness, the
modified-Fisher cisternal blood, the eight MG-ADL items. So it was worth asking
what the finder written to catch exactly that class had been looking at.

```js
.filter((f) => f.kind === 'number' && ...)   // scripts/probe-omitted-field-decides.mjs
if (f.kind !== 'number') continue;
```

`probe-omitted-field-decides` exists to ask *could the field nobody entered have
changed the verdict?* — and it had never examined a single enum. That is the
**fifth** check in this programme found narrowed the same way;
[spec-v1106](spec-v1106.md) lists the earlier four. Each was written beside a fix
expressed in number fields and inherited that scope, and each then reported clean
for years about a question it was not asking.

An enum needs no scaling: its plausible values are the ones it declares. Widened,
the first section went from nothing of this kind to **17 fields across 16
calculators**.

## The one that had to be fixed

`salicylate-toxicity`, with a level of 45 and no unit:

| Unit | Recommendation |
| --- | --- |
| omitted | No listed EXTRIP hemodialysis criterion met on the entered data. |
| `mmoll` | **Hemodialysis recommended (EXTRIP).** |

`unit === 'mmoll' ? x * 13.81 : x` reads everything else — an unstated unit
included — as mg/dL, and the recommendation named neither the unit nor the level
it had used. **The quiet direction is the dangerous one**: a mmol/L level read as
mg/dL under-states by 13.81, which is the side of every threshold that sends
nobody to dialysis.

mg/dL stays the assumption — it is the unit the EXTRIP thresholds are published
in and the one the page pre-selects. The recommendation now carries the level it
was read against, and says when the unit was assumed:

> No listed EXTRIP hemodialysis criterion met on the entered data. Read against a
> salicylate of 45 mg/dL **(no unit given; mg/dL assumed, and a level in mmol/L is
> 13.81 times this)**.

## Correcting spec-v1133

[spec-v1133](spec-v1133.md) says the library has "exactly two" unit defaults. That
is true of **defaulted unit parameters in a function signature**, which is what
the grep behind it could see. It is not true of the question the wave was
actually asking. There are **13 optional unit selects** on tiles with a worked
example, and the honest count is:

| | |
| --- | --- |
| name the unit in the reading | 10 |
| did not | 3 → 1 real defect |

The finder I used to justify a claim about the catalog was as narrow as the
probes this wave widened, and I did not check its reach before publishing the
number. That is [rule 17](incomplete-input-program.md) — *a finder's reach is part
of its result* — applied to a one-line grep instead of a probe.

## Two of the three were the scan being narrow

- `kings-college-nonapap` prints `Bilirubin 20 mg/dL.` in the factor's own detail
  line, which the renderer shows beside the factor. The unit used is visible
  where the finding is reported — the same reason spec-v1133 cleared the
  acetaminophen arm. My scan read four top-level fields and missed it.
- `triple-i` refuses a temperature of 100.9 with no unit, because 100.9 is
  outside the °C range. The range guard does the work; °C and °F barely overlap
  for a body temperature.

**A false flag costs more than a quiet row**: it invites a fix to a tile that was
right ([spec-v1130](spec-v1130.md)). Both were read before either was touched, and
neither was touched.

## What the widened probe still has open

Twelve more rows in its first section, including two compensation tiles whose
acute/chronic select silently picks *acute* and changes what the measured
bicarbonate is compared against. They are read, not yet worked.
