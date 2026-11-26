# spec-v1798 — A ratio is one number, and coincidences hit it

> Status: **SHIPPED (2026-11-25)**: 171 caps that the cap finder was absorbing as "a shared envelope" by
> arithmetic coincidence are now declared, and the agent surface names a field the way the page does.
> 2,667 of 5,189 number fields declare a bound, 4,896 edges. No tool's arithmetic changed; the catalog
> stays 2,390.

Two finders disagreed, and that is how this was found. `probe-undeclared-cap` reported **1** undeclared cap;
`probe-envelope-inside` had been printing 27 rows of the form *a value just inside an envelope is refused by
a narrower cap that nothing declares*. Both cannot be right.

`probe-envelope-inside` was. `gorlin`'s heart rate is guarded 10 to 300 bpm, and the cap finder was
classifying that as **`BOUNDS.hematocrit × 3.3333`**.

## Where the coincidences came from

[spec-v1795](spec-v1795.md) added a free-scale envelope match, for the real case of an envelope restated
through a molar conversion: `hscore-hlh` reads triglyceride in mmol/L and calls
`boundsAdvisory('triglycerides', tg * 88.57)`, so its edges are the envelope over 88.57 and no list of
decade scales can cover them. The reasoning for allowing a free factor was that *two known edges pin the
factor*, and that is true — but it then leaves exactly **one** constraint, the **ratio** of the edges. A
ratio is one number. `BOUNDS.hematocrit` is 3 to 90, a ratio of 30; a heart rate guarded 10 to 300 is a
ratio of 30.

The single-edge branches are weaker still, and had the same hole for longer: a **ceiling alone** is one
constraint even with a discrete scale, so `grobman-vbac`'s age cap of 70 matched `BOUNDS.baseExcess`, whose
ceiling is 70. An **age** was being reported as the base-excess envelope.

The fix is corroboration: a match that rests on a single edge or a free factor now requires **the field's
own words to name the envelope**. A word of three letters or more, equal to one of the envelope key's words
or to it with a plural dropped either way. `hscore-hlh` says "triglyceride" and keeps its match; a heart
rate is not a hematocrit, whatever the arithmetic says.

That has to read the key's **words**, not the key: `ageYears` is two words and a field says "age",
`weightKg` is two and a field says "weight". Comparing whole keys failed every compound one, which is most
of them, and briefly reported 185 age and weight caps as undeclared when they are the envelope exactly.

One more gap, in the opposite direction: a `CEILING_ONLY` envelope's floor is deliberately **not** enforced
([spec-v1762](spec-v1762.md) — a hemoglobin of 1.4 g/dL has been survived), so finding no floor is what that
envelope looks like, whatever the sign of the floor it publishes. `stewart-sid-sig`'s albumin is refused
above `BOUNDS.albumin.max` in the library's own words and was being offered for a literal of 7, which would
have frozen a copy of a moving edge.

| | before | after |
|---|---|---|
| `probe-undeclared-cap` ENVELOPE rows | 319 | **136** |
| DECLARABLE | 1 | 171 → **2** |
| `probe-envelope-inside` rows | 27 | **26** |
| Number fields declaring a bound | 2,479 | **2,667** |
| Configurations `probe-declared-cap-configs` drives | 21,069 | **22,818** |

## The 171

132 by the codemod of [spec-v1795](spec-v1795.md), with its rule that a refusal sentence's number is
trusted only where it agrees with the independently bisected edge. The rest by hand, and they fell into the
shapes that vein already knows: twelve fields declaring an envelope's **floor** while the library keeps a
tighter ceiling of its own (four hemoglobins at 30 g/dL, four heart rates at 300, three creatinines at 30),
and nine **generated families** where one edit declares the whole family from the table the library reads —
`dean-fluorosis-cfi`'s six categories, `hand-hygiene-compliance`'s moments, `therapy-cost-compare`'s three
regimens, `er-opioid-label-start`'s prior-opioid doses.

Two rows are left and both are deliberate. `vo2max-exercise`'s treadmill time is capped where the VO₂max it
reports leaves its output range ([spec-v1795](spec-v1795.md) explains why that is not a declaration). And
`site-of-care-compare`'s cost share carries **either** a coinsurance percent **or** a dollar copay, picked
by the select beside it: the library refuses above 100 in the one and above 1,000,000 in the other, so a
union fails both ways round, and the two gates said so in that order — `declared-cap-honest` found 1,000,000
refused as a percent, `probe-declared-cap-configs` found 1,050,000 answered as a copay.

## Naming the field

Declaring a range moves the refusal from the library to `mcp/fields.js`, and one test caught what that cost:
[spec-v1248](spec-v1248.md) requires `lymphocyte-doubling-time` to say **"Earlier absolute lymphocyte
count"** on the agent surface rather than an anonymous refusal, and `validateInputs` was answering
`"ldt-alc1" must be from 0 (exclusive) to 100000`. The rule was being kept only by the library, so declaring
a range on such a field quietly replaced a named refusal with a dom key.

`validateInputs` now names a field the way the reader's page names it, with its unit, falling back to the
key only for a label too long to sit in a sentence. That is a better sentence for all ~2,667 declared
fields, not just this one. The test that caught it asserted the library's exact phrasing — *"greater than
0"* where the declaration layer says *"from 0 (exclusive)"* — and now asserts what spec-v1248 actually
requires: the field is named, and the floor is stated, in either layer's words.
