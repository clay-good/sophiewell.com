# spec-v770 — a scored category is a number, but only some numbers

## What was wrong

613 fields are rendered as a `<select>` of fixed options and described to agents
as a plain `number`. The published schema for the Helsinki CT score said:

    "hel-mass": { "description": "Mass lesion type", "type": "number" }

An agent had no way to learn that 0, 2 and -3 are the only numbers that mean
anything, and "Mass lesion type" as a number is not guessable.

Passing any other number was not refused. It scored as if the finding were
absent and returned a confident total. **Measured across the whole set: of 560
out-of-set values, 282 were silently accepted and 234 changed the answer.**
`atlas-cdi` took `atl-abx: 9`, where the options are 0 or 2, and answered
ATLAS 4 instead of 6, `valid: true`.

## What it does now

Those descriptors carry `values` — the options the form offers. `validateInputs`
enforces it, and `fieldSchema` publishes it as `enum`, so an agent both sees the
legal set and gets told the legal set when it misses.

**All 560 are now refused, naming the values.**

The kind stays `number` on purpose. These values are summed, and `enum` would
hand the calculator a string: `'2' + '3'` is `'23'`.

## Why a snapshot of the rendered options is safe here

Some selects are repopulated by another field — `rucam-course` changes with the
RUCAM scale — and a single snapshot of one of those would be too narrow, which
is the worse failure: it would REJECT a legal call. Every candidate was read
twice, once at rest and once after perturbing every other control on the tile.
None of the 613 changed. The 4 fields whose declared values the form does not
offer were checked by hand and are all correct: `cauchy-frostbite`'s `normal` is
an alias of `not-done` in the same grade, and the two `rucam` values belong to
the cholestatic scale.

## What the gate found

`test/integration/field-values-match-dom.spec.js` holds every declared list to
the options its tile renders, in both directions, under the same perturbation.
On its first run it caught an over-declaration this change had just introduced:
Thompson HIE items do not share one ceiling — tone, posture and respiration run
0-3 and the other six run 0-2 — so a blanket max had added a grade to each of
the six. Their labels had been claiming `(0-3)` for years.
