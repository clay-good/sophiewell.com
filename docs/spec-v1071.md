# spec-v1071 — a calculator that refuses must take its working with it

121 calculators ship a live "show your work" panel that re-fills whenever the
inputs change. Separately, the blank-field waves ([spec-v1063](spec-v1063.md)
onward) taught a growing number of them to **refuse** when a measurement they
need is missing.

Those two features met badly, and nothing was looking.

## What was on screen

The refusal path is an early `return`, and it returned before the call that
re-fills the panel. So the answer refused while the panel underneath went on
displaying the last complete calculation — including, every time, the number the
refusal existed to withhold:

| Calculator | The answer said | The panel below still said |
|---|---|---|
| `cockcroft-gault` | Enter an age to calculate. | `CrCl = (140 - 60) × 80 kg / (72 × 1 mg/dL) = 88.89 mL/min` |
| `egfr` | Enter an age to calculate. | `eGFR = 142 × … = 64.5 mL/min/1.73 m²` |
| `corrected-sodium` | Enter a measured sodium to calculate. | `Corrected Na = 130 + 1.6 × (600 - 100)/100 = 138 mEq/L` |
| `winters` | Enter a bicarbonate to calculate. | `Expected PaCO2 = 1.5 × 14 + 8 ± 2 = 27 to 31 mmHg` |
| `burn-fluid` | weight kg must be between 0.1 and 400. | `Parkland = 4 mL × 70 kg × 20% = 5600 mL/24h` |

`cockcroft-gault` is the clearest: the panel still shows **the age that had just
been cleared** (`140 - 60`), in the working for a creatinine clearance the
calculator had refused to give.

**Twenty calculators**, by three routes: an explicit `needValues`/`needPanel`
return (10), an `r.score == null` early return (6), and a range check in the
library that **throws**, caught by `safe()` (4 — `mgap`, `gap`, `burn-fluid`).
Sixteen of the twenty pre-date the blank-field waves; those waves added four
more and are what made the class visible.

## Two live regions, one page

The programme so far has been about two *surfaces* disagreeing — the browser and
the agent surface (spec-v1037), or a tile and the search listbox
(spec-v1067's `shock-index`). This is the same defect inside a single page: the
live region says one thing and the disclosure below it says another, and the one
that is wrong is the one showing a number.

## A raw TypeError, in the answer

Chasing the same fields turned up something worse on the two early-warning
scores. With any observation missing, `mews` and `news2` printed:

> Enter systolic BP, pulse, respiratory rate and temperature to score.**Cannot
> read properties of undefined (reading 'sbp')**

The library returns no score *and no per-parameter breakdown* when an observation
is missing; the renderer read `r.parts` anyway, threw, and `safe()` printed the
exception message into the live region. Both tiles, on every field. Two of the
four paths pre-dated this session; the other two became reachable when
spec-v1064 made a blank **temperature** produce a null score for the first time.

## The second consumer of the same null score

Fixing `r.parts` was not enough. The optional trend widget on both tiles takes
the score too, and `renderEwsTrend` passed a null one straight to `trend()`,
which throws `current must be a number` — printed, again, as the answer:

> Enter systolic BP, pulse, respiratory rate and temperature to score.**current
> must be a number.**

It only fires when the reader has filled the optional prior-score and hours
fields, which is why the first pass missed it. The lesson generalises:
**when a guard newly makes a result null, grep the renderer for every consumer
of that result, not the one the bug report named.** There were two.

## The fix and the gate

`lib/derivation.js` gains `clearDerivationSteps(detailsEl, message)`, called on
every refusal path. For the two modules where the refusal is a *throw*, `safe()`
now takes the derivation element and clears it in the `catch`, so any future
throwing path is covered without being found first.

`test/integration/derivation-agrees.spec.js` clears one filled field on every
calculator that has a steps panel and fails when the tile refuses in its answer
while the panel still shows what it showed before. Two shards, **13 seconds**.
Negative-tested by removing the `egfr` guard's clear and watching it fail with
`egfr|scr`.

That sweep already clears a field on 121 calculators and reads the answer, so it
also now asserts — free of charge — that **no JavaScript runtime error ever
reaches the live region**. `safe()` catches exceptions and prints `err.message`
as the answer, so a renderer reading a property of a result the library withheld
shows the reader a `TypeError`. Both early-warning tiles carry named regression
tests in `no-answer-from-nothing.spec.js`, with and without the trend fields
filled.

A whole-catalog probe (`js-error-probe.spec.js`) then cleared every field on all
1,706 calculators looking for the same thing. **Zero** — the two early-warning
tiles were the only ones, and they are fixed.

It did catch me, though. The first word list included `is not defined`, which is
how a `ReferenceError` reads and is also ordinary English: `rope-score` refuses
with "The score **is not defined** without it, and age supplies up to 5 of its 10
points". A sweep using that phrase reports a crash where there is none, and the
same pattern had already gone into the gate, where it would have failed a build
on correct copy. Both now match only unambiguous V8 runtime errors; `no-undef`
(spec-v1067) catches undefined identifiers statically anyway.

One exception, keyed `tileId|fieldId` like the ledger beside it: **`centor`**
scores its four criteria on its own and asks for an age only to add the McIsaac
modifier. Clearing the age leaves a real Centor score on screen beside the
prompt, and the working shown is that score's working — correct, and it must not
be cleared.
