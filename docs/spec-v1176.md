# spec-v1176 — the value you entered, reported as missing

Enter a serum albumin of **40** — the g/L figure a European or SI lab report
prints for 4.0 g/dL — into `glasgow-prognostic-score`, and it says:

> Enter the serum albumin (g/dL).

About the albumin you just entered. Retype it and you get the same sentence.

**124 of the 194 fields that refuse an out-of-range value describe it as a
missing one** (`scripts/probe-envelope-unbounded.mjs`, second section). 70 name
the range or the value, which is what the other 124 should do:

> albumin gdl must be between 0.5 and 8. Check the value entered.
> — `corrected-anion-gap`

## One helper, 18 copies, three states collapsed into one

```js
function pos(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return null;
  return n;
}
```

`null` means three different things here — **blank**, **not a number**, and **out
of range** — and every caller reads it as the first. The helper is defined
identically in **18 library files**, with **411 call sites** passing bounds.

This is the incomplete-input programme's own central distinction, inverted. The
programme exists because a blank was read as a zero — *a gap is not a
measurement*. This is the mirror: **a measurement is not a gap**, and reading one
as the other produces a refusal the reader cannot act on. It is also
[project_discarded_input](spec-v1075.md)'s shape — a value entered and thrown
away — with the added insult of asking for it again.

## Why this is a programme and not a wave

411 call sites across 18 files. Changing `pos` to distinguish the states changes
what every one of them returns, and the fix at each site is a judgment about what
the message should say. Started at the end of a session, that is how a sprawling
half-finished refactor happens.

So this wave ships the **measurement**, in the probe, where it is repeatable and
carries its own reach. The recommended shape for whoever drains it:

1. ~~Add one shared `rangeFault(value, lo, hi, name, unit)` to `lib/bounds.js`.~~
   **Corrected by [spec-v1177](spec-v1177.md): it is already there.**
   `boundsAdvisory(key, value)` returns exactly the sentence wanted, built from
   the note — *"Input above the plausible range for serum albumin (0.5 to 7
   g/dL); verify the units."* Writing a second one would have been
   [the duplicated-rule shape](spec-v1155.md), in the wave that exists to point
   at an unused shared rule.
2. Have each guard call it **before** its incomplete-message, so the specific
   fault wins over the general one.
3. Leave `pos` alone. 411 sites keep working, and the migration is per-guard
   rather than per-call.

Doing it the other way round — changing `pos` first — is
[spec-v1171](spec-v1171.md)'s lesson: a helper's current behaviour is depended on
in ways nobody has enumerated.

## What it connects to

[spec-v1174](spec-v1174.md) fixed five fibrosis scores that answered a platelet
count in lab-report units. This is the same unit confusion meeting the *other*
failure: where v1174's tiles answered wrongly, these refuse correctly and then
describe the refusal wrongly. **A reader hitting either one is copying a number
off a report exactly as it is printed** — and neither the answer nor the refusal
tells them the unit is the problem.

Albumin is the sharpest case because the direction is fixed: g/L is ten times
g/dL, higher albumin reads as healthier, so the wrong unit always lands on the
favourable side. 13 of the 15 albumin tiles that refuse it misdescribe it.

## Verification

`npm run release:check` green. The probe asserts nothing and is not run in CI.
