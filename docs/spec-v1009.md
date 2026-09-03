# spec-v1009 — A transposed digit got a confident answer

## The finding

207 numeric inputs across 99 tiles declare a plausible range on the field itself — `min: 0,
max: 300` on a heart rate, `min: 3, max: 15` on a GCS. About half of those tiles enforce it and say
so plainly:

> Enter a Glasgow Coma Scale total between 3 and 15.
> Parent heights should be between 100 and 230 cm.

The other half compute from whatever is typed. `min` and `max` on an `<input>` are enforced by the
browser **only at form submission**, and these tiles never submit — they recompute on every
keystroke. So the constraint was decoration wherever the tile did not re-check it by hand.

Measured on the live pages:

| Tile | Typed | Answered |
| --- | --- | --- |
| `rabt-score` | heart rate 3007 | shock index 30.07, massive transfusion predicted |
| `saps-ii` | age 1307 | 79.9% predicted hospital mortality |
| `snappe-ii` | FiO2 1007% | SNAPPE-II 101 of 162, "high illness severity" |
| `peged` | D-dimer 500007 | "CT pulmonary angiography indicated" |
| `hiet-dosing` | bolus 17 units/kg, in a field that allows 1 | an insulin dose |
| `euroscore2` | age 1207 | "predicted in-hospital mortality 100.00%" |
| `non-hdl-remnant` | total cholesterol 10007 | non-HDL 9957 mg/dL |
| `kawasaki-criteria` | fever 607 days | "meets classic Kawasaki disease criteria" |

A transposed digit is the commonest data-entry error there is. That makes this the likeliest way a
reader ends up with a wrong number here: not a wrong formula, a wrong key.

## The fix

One hook, wired once for every tile as it renders. On each edit it asks the browser what it already
knows — `input.validity.rangeOverflow` and `rangeUnderflow` — and, when a field is out of the range
it declares, states the fact above the answer:

> Check the highlighted value: Heart rate (bpm) is 3007, outside the 0 to 300 this field accepts.

The offending input carries `aria-invalid="true"` so it is findable by a screen reader and outlined
on screen. Correcting the value removes both.

Three deliberate choices:

- **Above the answer, never inside it.** `#q-results` is an aria-live region; a warning about an
  input is not part of the reading, and putting it there would re-announce the answer.
- **The answer still renders.** A reader who meant an extreme value and knows why should still see
  what it gives, and suppressing 1,704 renderers centrally would mean guessing which of them can
  survive being told to produce nothing.
- **The sentence claims nothing about the answer.** Half these tiles refuse an out-of-range value
  themselves and half compute from it; a sentence that guessed wrong either way would be worse than
  the plain fact.

## Proof

`test/integration/declared-ranges.spec.js` — four tiles across both populations (one that already
refuses, three that did not), each asserting the warning names the field, the value and the bounds;
that it sits above and outside `#q-results`; that the input is marked `aria-invalid`; and that
correcting the value clears both. Plus an in-range case that must never be flagged, and a two-field
case that names both in one sentence.

The full lint chain, both 320px mobile sweeps, the smoke suite, and the 28-minute
indiscriminate-interaction sweep over every tool all pass with the hook in place.

## Left open

The range is only as good as what the field declares, and 1,391 inputs declare a `min` while only
463 declare a `max` — a heart rate field with no `max` still accepts 3007 silently. Filling in the
missing bounds is per-tile clinical judgment and its own piece of work; this spec makes the bounds
that exist do something.
