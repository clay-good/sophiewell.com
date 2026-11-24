# spec-v1786 — The deadlock between two finders

> Status: **SHIPPED (2026-11-24)**: 9 libraries hoisted, 13 fields declared. No tool's arithmetic changed;
> the catalog stays 2,390.

Two finders had been pointing at the same fields and giving opposite instructions.

`probe-envelope-inside` said: this tool refuses a survivable value with a narrower cap, **and nothing
declares that cap** -- 37 rows. `probe-declared-cap-configs` said: that cap cannot be declared, because the
library keeps it on some branches and not others, so a declaration would be a claim that is false wherever
it does not hold. Both were right. The declaration codemod had offered twelve of these fields in
[spec-v1781](spec-v1781.md) and the configuration probe had correctly turned every one of them down.

Neither finder could break the tie, because the answer is not a declaration or a silence. It is to make the
cap true everywhere first.

## Where each cap went missing

Driving every enum option of each tool showed the exact branch:

| Tool and field | The configuration in which the cap vanished |
|---|---|
| `c5-otc-sale-limit` purchaser's age | state law requires a prescription, so no nonprescription sale and no age is read |
| `chemo-dose-verify` weight, dosing weight | a carboplatin AUC basis, which hands off to the Calvert tool before the weight |
| `doac-dose-check` age, weight | the VTE indications: the age and weight criteria are apixaban's AF dose-reduction rule |
| `medicaid-work-requirement-check` age | any exception applies, and an excepted month needs no age |
| `osha-standard-threshold-shift` baseline and recent age | age correction off: Tables F-1 and F-2 are the only reader of the ages |
| `passive-immunization-dose` weight | a fixed-dose product (HBIG for a newborn) |
| `pralidoxime-dose` weight | an adult, who gets a fixed dose |
| `tranexamic-acid-renal-dose` weight | the oral route, which is not dosed per kilogram |
| `vial-rounding` weight | a dose ordered in mg rather than mg/kg |
| `poseidon` age | nowhere: it already refused outside 12 to 60 in every configuration, and simply never said so |

Every one is a real branch that does not use the field. That is why the guard was written inside the branch
in the first place, and it is also why the cap could not be declared.

## The hoist, and what it costs

Nine libraries get the hoist [spec-v1744](spec-v1744.md) wrote down and
[spec-v1780](spec-v1780.md) applied to 25 fields: a `gradeFault` above the branch split.
`gradeFault` skips a blank, so each branch keeps its own missing-value sentence and an optional field stays
optional -- only a value the reader actually typed is judged.

**It does cost something**, and the trade is worth stating. A reader who asks for an adult pralidoxime dose,
which is fixed, and types a weight of 450 kg is now refused where before they were answered. The weight was
not used in that answer. Against that: 450 kg is outside the population the label's dosing was written for,
the reader has almost certainly mistyped, and the same typo carried into the pediatric branch -- or into the
next tool -- would matter. One rule that holds everywhere is also the only kind that can be declared, which
is what makes the cap visible to an agent before it calls rather than as a refusal afterwards. Every other
tool in the catalog already behaves this way.

## What moved

| | before | after |
|---|---|---|
| `probe-envelope-inside` | 48 | **28** |
| Fields with a declared bound | 2,122 | **2,135** |
| `probe-declared-cap-configs` | 0 open, 1 judged | 0 open, 1 judged, over 18,124 configurations |

Three of the thirteen had to be declared by hand. The bisecting finder cannot reach a field its worked
example leaves blank (`chemo-dose-verify`'s optional dosing weight), and the codemod will not touch a
descriptor spread over several lines after what it did to `billing-v82.js` (`poseidon`'s age,
`vial-rounding`'s weight, which is built by a helper that takes no bounds).

## The 28 left

| Cause | Rows |
|---|---|
| An **output envelope** reached from this field: the refusal is about a number the library worked out, and [spec-v1785](spec-v1785.md) made those say so | 11 |
| A narrower cap on the field itself, still undeclared: six on fields a unit select rescales, three whose cap moves with another input, and the rest on fields no bisection reaches | 17 |

The 11 are now machine-readable as a class, because their sentence says "works out to". A finder that can
tell an input's cap from an output's envelope is the next narrowing, and it is available for the first time.
