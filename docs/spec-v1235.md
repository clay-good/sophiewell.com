# spec-v1235 — a file-level filter for a per-function defect

[spec-v1227](spec-v1227.md) fixed every library file that shares the dead-end
helper, mechanically. Its filter was:

> has a `missing` list, reads `pos(o.arg, MAX)`, **and does not already mention
> `gradeFault`**

`lib/gaps-v185.js` fails that last clause. It already imported `gradeFault` and
three of its functions already used it — so the file was skipped whole, and six
functions in it kept the defect:

| tile | impossible input | what it said |
| --- | --- | --- |
| `fick-cardiac-output` | haemoglobin 250 g/dL | *"Enter the hemoglobin (g/dL)."* |
| `matsuda-index` | fasting glucose 20000 | *"Enter the fasting glucose (mg/dL)."* |

**A file-level filter is the wrong granularity for a per-function defect.** That
is the correction spec-v1227's ledger needed, and the reason its "ten files"
count was never the population.

## And the scope bug

`fickCardiacOutput` has two methods, *measured* and *estimated*, and checks its
`missing` list separately inside each arm. The transformer matched the first
`missing.length` it found — the one in the **estimated** arm — so the range check
landed where a **measured** Fick, which is the default, never reaches it.

It is hoisted above the branch here, because the two fields it reads,
haemoglobin and BSA, are the ones **both** methods use. The test drives both
arms.

The general form is worth keeping: a mechanical insertion anchored on "the first
occurrence of X" is correct only while X occurs once. Neither the unit suite nor
the probe would have caught it — the probe drives one path, and it is the path
that was fixed.

## Ledger

`probe-envelope-unbounded`, second section: **55 rows → 51.** Six functions
fixed; four of them (`gorlin`, `lvotStrokeVolume`, `leanBodyWeight`, and the
measured arm of `fick`) were never on the probe's list, because the probe reaches
only a field whose quantity `BOUNDS` names. They are the same dead end.
