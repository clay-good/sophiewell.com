# spec-v1203 — the finder's first four rows, and its first false one

[spec-v1202](spec-v1202.md) shipped `scripts/probe-unguarded-sibling.mjs` and
fixed one row. This works its list from the top, where the top is the rule that
spec says to follow: **open the modules whose siblings were guarded most
recently**, because those are the halves someone was in the middle of.

## `lib/critcare-severity-v200.js`

[spec-v1200](spec-v1200.md) fixed `lods` in this file. The probe printed the
module the moment it did, and the three functions beside it had the identical
defect with the identical helper:

```
inRange(v, lo, hi)  ->  null for blank, for non-numeric AND for out-of-range
```

| | before, on an entered value | after |
|---|---|---|
| `oasis` | "Enter all ten OASIS variables …" for a heart rate of 3000 | "The heart rate 3000 is outside 0 to 350. Check the value entered — this is not a missing measurement." |
| `apps-ards` | "Enter age, PaO₂/FiO₂ ratio, and plateau pressure" for a plateau of 800 | the plateau pressure, named |
| `delta-gap` | see below | the analyte, named |

Nine functions apart, one file, one helper. The messages come from the same
`outOfRange` helper `lods` got, which now capitalises its first word — the labels
read "the sodium", so the sentence had been starting lowercase.

## The one that was not the same bug

`delta-gap`'s albumin is **optional**: absent, the uncorrected anion gap is used;
present, the gap is albumin-corrected. And `inRange(70, 0.5, 7)` returns `null`,
which is exactly what absence returns.

So an albumin entered in **g/L** — 70 rather than 7.0, the commonest unit mistake
there is with albumin, and the one [spec-v1178](spec-v1178.md) exists for — was
silently thrown away, and the uncorrected gap was reported as though nobody had
offered one. The input changed nothing and the tile said nothing:
[[project_discarded_input]]'s shape, arrived at from the other direction.

## Two singletons in files already wired

`clip` and `clichy` sit in modules that gained `inputFault` in
[spec-v1201](spec-v1201.md) and did not call it. `clip` reported an AFP of nine
million as one of the pickers still to select; `clichy` returned a bare
`{ valid: false }`, so `mcp/tools.js` supplied its own "Enter the required
values." Both now name the lab, and both keep the original sentence where the
missing field is a **picker** rather than a number — there is no range to name for
a Child-Pugh stage.

## The finder's own false positives

The first run of this wave printed `lib/scoring-v4.js`:

```
guards  : news2, mews, mods, meows
does not: sirs, cam
```

`sirs` takes **four booleans**. It has no measurement to guard. It was matched by
`READS_A_NUMBER` because of the phrase in its own band:

> SIRS-**positive (**3 of 4 criteria) per Bone 1992

The heuristic was tested against the raw source, so a word inside a string
counted as a call. Comments and string literals are prose; only code is a call,
so the source is stripped of both before the test. `scoring-v4.js` and `cam` drop
off, correctly — and this is the same defect class the whole run has been about,
in a script written the day before: **a pattern matched against text that was
never code.** [spec-v1193](spec-v1193.md) is the same sentence about
`asking-language.js`.

The second was a name that should never have been on the list. `num(` is
`lib/num.js`'s **output** guard — it is what keeps a `NaN` off the screen — so a
function calling it may read no input at all. `nacseldAclf` counts four booleans
and passes the total through it, and was reported for having no input guard. Off
the list; every other name there is an input parser. That one correction moved
**21 more siblings** into the skipped count, which is why the reach line prints
it: a finder that gets shorter should say whether it found something or stopped
looking.

## Measured

| | before | after |
|---|---|---|
| `probe-unguarded-sibling` | 13 modules, 41 functions | **7 modules, 13 functions** |
| `probe-envelope-unbounded`, second list | 92 | **89** |

Six modules left the list. **Four are fixes and two are the finder being wrong**,
and the two are worth separating because a count that falls for the second reason
is not progress. The reach line carries the skipped total for the same purpose.

Lint, 13,498 unit tests, 448 MCP tests and four browser sweeps pass.
