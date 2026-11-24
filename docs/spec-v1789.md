# spec-v1789 — The label is not the answer

> Status: **SHIPPED (2026-11-24)**: 1 gate added, 0 tools changed. The catalog stays 2,390.

[spec-v1788](spec-v1788.md) found `herd-immunity-threshold` assuming a perfect vaccine in silence, and its
field label had said so all along: "Vaccine efficacy (optional; blank is a perfect vaccine)". That is the
trap worth naming. **The label is not the answer.** A reader fills a form once and then reads a result; the
result is what they act on, what they say out loud and what they copy into a note. The label is above a box
they left empty.

That defect was found by hand, by reading four tiles a prioritiser had flagged. Hand-reading works and does
not persist. But the labels announce themselves, so the same question can be put to the whole catalog for
almost nothing: **a field whose label states a substitution for a blank must have a reading that names the
substitute when it is used.**

`test/unit/blank-label-promise.test.js` holds it. 28 fields in the catalog state what a blank means; the
rule covers the ten that substitute a VALUE.

## Why it is a gate and not a fix

Four tools already passed, in their own words:

| Tool | What the reading says when the field is blank |
|---|---|
| `f100-rutf-amount` | "No sachet energy was entered, so the standard 92 g, 500 kcal sachet is used." |
| `mortality-measures` | "Choose a multiplier to change it; until then the measure's usual one, per 100,000, is used." |
| `sample-size-proportion`, `sample-size-two-groups` | "Design effect 1: simple random sampling (none entered). A cluster or other design needs a larger sample; enter its design effect to multiply the result." |

The sample-size pair shipped in [spec-v1769](spec-v1769.md) and `herd-immunity-threshold` in
[spec-v1772](spec-v1772.md) -- **three days apart**. One batch got this right and the next did not, with the
same author and the same week. That is the gap a gate closes and a review does not: a review is a date, and
everything written after it is unexamined until someone remembers to look again.

## What the rule does not cover

**`omit for X` is a different promise.** The anion gap's albumin reads "optional; omit for the uncorrected
gap", and the oxygenation index's PaO2 reads "omit for the saturation index alone". Those offer another
ANSWER rather than a substituted value, and the answer itself changes to the one the label named -- the
reading becomes the uncorrected gap, which is what was asked for. Eighteen of the 28 are that shape and are
honest by construction, so the rule excludes `omit for` and `omit to` explicitly rather than ledgering them
one by one.

**Enumeration counts as disclosure.** `modified-marshall`'s cardiovascular score reads "blank = not
assessed", and its answer prints "(assessed: respiratory 3, renal 2)" -- the blank system is simply not in
that list. Naming what was scored names what was not, which is the form
[spec-v1218](spec-v1218.md) already counts ("named, asked for, or enumerated less"), so the rule accepts it.

**One row is judged.** `overpayment-60day`'s investigation-end date is in a tool that returns structured
fields and no prose at all: its view writes the sentence, so there is no reading here to hold to the promise,
and the field is not in the worked example either.

## Negative-tested

The gate was checked the only way a gate can be: by removing [spec-v1788](spec-v1788.md)'s fix from
`lib/herd-immunity-v1772.js` and running it. It reports

```
herd-immunity-threshold:hit-eff: label says "Vaccine efficacy (optional; blank is a perfect vaccine)"
and the reading never mentions it
```

and passes again once the fix is back.
