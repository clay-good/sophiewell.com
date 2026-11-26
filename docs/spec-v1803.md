# spec-v1803 — Three finders that were reading one surface

> Status: **SHIPPED (2026-11-26)**: three more finders become gates at zero, taking the suite to **18**.
> Two of them were reporting rows that no longer existed, because each was reading a narrower slice of the
> catalog than the thing it asks about. One real fix: an agent asking for a DAS28 was given the ESR formula
> without being told. No tool's arithmetic changed; the catalog stays 2,390.

With the envelope family closed ([spec-v1802](spec-v1802.md)), the remaining hand-run finders were swept.
Three of them share a shape worth naming: **the finder knew one surface and the question spans several.**

## `probe-unsupplied-input`: the upload is a surface

It asks which inputs a library READS that no surface can SUPPLY — because whatever branch sits behind such
a key is either dead or decides the answer for everyone who could not say it. [spec-v1403](spec-v1403.md)
found `ireton-jones` falling back to "obese" when the height was blank, so every blank height lost a
609 kcal/day term.

It compared each library against its **adapter's fields**, and reported three: `mpr-gap-days`'s `fillRows`,
`med-sync-plan`'s `medicationRows`, `chair-day-planner`'s `apptRows`. A reader supplies all three by
dropping a CSV on the page — `lib/upload-worker.js` maps a parsed file's rows onto exactly those keys, and
calls the library with them. The finder now reads that map out of the worker's own source, so a tool added
there is covered the day it is added.

Its fourth row, `spetzler-ponce`, is judged: a Spetzler-Martin grade is an alternative to the class the
adapter asks for and gives the same tier. And the probe's own note had claimed a **fifth** accepted row,
`peds-bmi-percentile` — the finder no longer reaches it, and the ledger said so on its first run, which is
what a ledger is for.

`test/unit/probe-unsupplied-input.test.js` carried the same by-design list the ledger now holds, which is
one rule written twice. It keeps instead the invariant no ledger can state: the worker must still hand
those keys over, and each library must still fall back to the text field beside it — because losing either
makes the branch unreachable again **and** the finder, reading the same map, fall silent about it.

## `probe-default-in-answer`: a default the surfaces always override

It asks whether a function prints a **defaulted** parameter's value into its own answer — a fabricated
observation, from [spec-v1131](spec-v1131.md)'s ROX index naming "12h" that nobody entered. It reported 19.

Nine of them cannot happen. `vis` takes six vasoactive doses, each defaulted to 0 in its signature, and its
adapter marks **all six required** — so `validateInputs` refuses an agent that omits one and the page sends
every box. The default is unreachable. The same for `free-water-deficit`'s target sodium and replacement
hours, and `digoxin`'s indication. The finder reads the adapters now.

One was a row about a **brace**: the signature parser reads to the first `}`, so an object default splits
in the middle and produced `buildHash(state = {)`. An object default is not a value printed into prose.

Eight are judged, each with the disclosure its control already makes — `ndc-hcpcs-units`'s label reads
*"Rounding: up, down, or nearest (default up)"*, `heatstroke-decision`'s reads *"unchecked = anhidrotic /
classic"*, and `mppr` has no adapter entry by design, so no surface supplies or is told a mode.

**And one was real.** `das28` takes an optional `form`, ESR or CRP, and the two have different formulas and
different thresholds. On the page the select shows *"ESR (DAS28-ESR)"* as its first option, so a reader sees
which is in use. An agent that omitted the field was given the ESR formula and told nothing. The field now
says `(default esr)`, which is the disclosure `ndc-hcpcs-units` already had.

## `probe-optional-read-as-zero`: the guard is at the call site

It asks where a field the page CALLS optional is read with `Number()`, so a blank arrives as a measurement
of zero ([spec-v1213](spec-v1213.md)). Its one remaining row, `pregnancy-dating`'s crown-rump length, is a
suspect it cannot rule out from the `num()` line alone: the call site reads the **raw** value to decide
whether the field was entered, a blank never reaches `gaFromCrl`, and a typed 0 is refused against the
1 to 120 mm range. Judged, with that guard named.

| Finder | Was | Now |
|---|---|---|
| `probe-unsupplied-input` | 4 | **0**, 1 judged |
| `probe-default-in-answer` | 19 | **0**, 9 judged, 9 unreachable |
| `probe-optional-read-as-zero` | 1 | **0**, 1 judged |

Each of these three says in its own header that a row is a **suspect, not a defect**. That is honest and it
is also a trap: a suspect that has been read, and read again, and read again is noise that hides the next
real one. A ledger is what turns a standing suspect into a decision taken once.
