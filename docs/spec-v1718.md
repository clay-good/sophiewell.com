# spec-v1718 — The six whole-catalog sweeps that were red on main

> Status: **SHIPPED (2026-11-14)**. The catalog stays 2,387; no tool's answer changes.

The `ci` run on the spec-v1717 push went red. Two of its three jobs passed; the end-to-end job
reported six chromium failures, 1,030 passes and seven firefox flakes that cleared on retry. The six
are below, each reproduced locally before it was touched and re-run green after.

## A source with a re-read date is a clock-dependent tile

Three tiles failed `clock-dependent.spec.js`: `spo2-arms-accuracy`, `cyp-list-check` and the new
`kdri-kdpi`. The sweep reads each tile today and a year from today and fails on any that answers
differently without a ledger line.

All three are the same case, and it is the one `cpic-gene-drug` was already in. A tile that holds a
source read on a date — a fetched table with a check date, a transcribed guide with a re-read date —
stops computing once that date passes and says which source went stale, by the fail-closed rule of
spec-v1622 and spec-v1628. A year with no refresh and no re-reading is precisely the case that rule
exists for. The reading they change to is a refusal naming the source, never a different number.

| Tile | What it holds | What it says past the date |
|---|---|---|
| `spo2-arms-accuracy` | the typical-accuracy figures from FDA's pulse oximeter guidance | the guidance is due to be read again |
| `cyp-list-check` | FDA's drug-interaction examples table, fetched with a check date | the table has passed its check date |
| `kdri-kdpi` | the OPTN KDRI-to-KDPI mapping table, republished each spring | points at the OPTN calculator instead of mapping from a stale reference year |

All three are now in `test/integration/clock-dependent-ledger.js`, under one paragraph naming the
class rather than three unrelated lines, so the next tile with a re-read date has somewhere to go.

## A label naming a range that the input did not enforce

`dose-history-level`'s oral bioavailability field is labelled "F (0 to 1)" and carried no `min` or
`max`, which `label-states-a-range.spec.js` reads as a promise the browser does not keep. The MCP
adapter already declared 0 to 1 and the library already refuses anything outside it; only the input
element was silent. `numField` in `views/group-v1699.js` takes an optional range now, and the field
passes it.

## tPA eligibility is a checklist, not a calculation

`no-answer-from-nothing-sweep.spec.js` clears every number, text and textarea field and fails on any
tile that still reads as an answer. It left `tpa-eligibility`'s two required selects set, as it leaves
every select, and the tile answered.

It is right to. The verdict comes from those selects and from Table 8 rows the clinician ticks, where
an unticked row is the criterion answered "no" — what a checklist means by blank. Every number field
is a measurement, and each one left blank is named in the answer rather than read as a value: "No
coagulation results were entered", "Blood pressure was not entered", "Glucose was not entered", each
with the guideline section that asks for it. Nothing is computed from a zero. It is in
`test/integration/empty-form-ledger.js` with that sentence.

## A gate that knew one of the ways the house declines

`partial-answer-safety.spec.js` flagged `fmcsa-bp-certification` for showing a number while a required
enum was unset. The number was in its refusal: "The systolic pressure must be between 60 and 300 mmHg.
Check the value entered."

That sentence is the house's envelope refusal, written once in `inputFault` and `rangeFault` in
`lib/num.js` and reaching seventeen library files. The gate recognised one refusal shape — a reading
that opens on an imperative — and this one opens on an article and carries its bounds as digits. It is
the drift of [[project_duplicated_rule_drift]]: one rule, two hands, one phrasing known.

The tile was never the defect, and it was not flagged last week either. The sweep samples every Nth
risky tile, so which tiles it reaches moves every time the catalog grows; shipping `kdri-kdpi` changed
the step and walked `fmcsa-bp-certification` into the sample, refusing correctly, for the first time.

The vocabulary was a third copy, inline in the spec file, beside the two in
`test/lib/asking-language.js` that exist to stop exactly this. It lives there now, as
`saysIncomplete`, and pulling it into the light cost three more findings:

| | Was | Now |
|---|---|---|
| the house's envelope refusal | read as an answer | a reading that ENDS on "Check the value(s) entered." declined |
| "Say whether the patient is on dialysis" (59 uses across `lib/`), "Grade the ..." (8) | read as an answer; `dofetilide-dose-algorithm` had never been sampled | `say` and `grade` join the opening imperatives |
| "... this is not a missing measurement." | the bare word `missing` inside a DENIAL excused the whole reading | a sentence saying a thing is not missing is not a tile saying it is |

The end anchor on the first row is the whole care in it. `outOfRange` in
`lib/critcare-severity-v200.js` prints that same sentence ABOVE an answer (spec-v1203,
`declared-ranges.spec.js`), where the tile does answer and must stay flaggable — and it was that tile
which showed the third row's hole. `stage` and `check` were looked at as imperatives and left out: a
real answer opens "Stage 3 hypertension", and "Check the value entered." is already safe at the end
anchor.

`test/unit/asking-language-v1718.test.js` pins both directions, because no end-to-end sweep can see the
one that matters: a pattern that excuses too much makes the gate quiet, not red.

The sample itself was the fourth finding. At 40 tiles it had been reaching neither of the two tiles
above. It runs 120 now, about 80 seconds, after a 400-tile run that is green.

## And then the tool the red build shipped

Three of the six failures came from `kdri-kdpi`'s arrival, so it was read again while it was in hand. The
guide's Table 1 was transcribed exactly — the unit tests reproduce its printed Xβ and KDRI_RAO to 1e-12 — but
its **extreme-value rule was not**: a serum creatinine above 8 mg/dL enters the KDRI as 8, so 8, 9, 15 and 25
all give the same KDRI, and OPTN's own calculator prints a note when the cap applies.

That is not a tidy-up. The two creatinine terms sum to a slope of 0.2128 − 0.2199 = −0.0071 per mg/dL above
1.5, so the published formula **falls** as creatinine rises, and uncapped it falls without end:

| Donor creatinine | KDPI shipped in spec-v1717 | KDPI now |
|---|---|---|
| 1.7 mg/dL | 67% | 67% |
| 8 mg/dL | 63% | 63% |
| 15 mg/dL | 57% | 63% |
| 20 mg/dL | 54% | 63% |

The guide's own example donor was being reported as a *better* kidney the sicker the creatinine — a donor in
dialysis-dependent acute kidney injury reading nine points more favorably than the same donor with a
near-normal creatinine. Wrong, and in the unsafe direction.

The cap is in `xBeta`, so every caller gets it, and the page names it when it bites. The creatinine fence also
moves to the guide's own entry range, 0.01 to 40 mg/dL, from the 0.1 to 20 that shipped: with the cap nothing
between 8 and 40 changes an answer, so that fence only decided whether a value OPTN accepts was refused. A
µmol/L reading typed as mg/dL (150) is still well outside it.

The cap was confirmed from two independent readings of the cited guide. The PDF was not opened directly —
the host refuses a scripted fetch, which is why spec-v1717 was built from a copy saved by hand — so the exact
wording of that section, and whether a cap is stated for any variable other than creatinine, are written into
the change's `design.md` as the thing to confirm on the next hand-read.

## A finder for the shape, and the one more tile it caught

The KDPI defect has a shape, and the shape is findable without reading a source: a piecewise formula with
a correction term is monotone over most of its range, then turns **once**, and keeps going to the fence.
`scripts/probe-reversal.mjs` sweeps every numeric field across its range and reports that.

Its own negative test first, which is the rule for a new finder: with the cap removed, it reports
`kdri-kdpi`'s creatinine at an 88% retrace on four separate outputs; with the cap in, it reports nothing.

**2,894 field sweeps, 404 of them over a range the tool declares. 93 rows across 37 calculators, every
one read. One defect.**

`bess-balance-error`. Its `errs()` returned `0` for any value it did not like — blank, negative, a word,
and anything above 10:

| Errors recorded on one stance | BESS total (others at 3 each) |
|---|---|
| 8 | 23 |
| 10 | 25 |
| **11** | **15** |
| 150 | 15 |

A rater who recorded 11 errors scored that stance as if they had recorded **none**, and the total fell by
ten. A silent zero in the reassuring direction, on a concussion measure, from a plausible typo — and it
reached the browser, where the input's `max="10"` only marks a typed 12 invalid rather than blocking it,
as well as every agent, where nothing declared the range at all.

It is refused by name now, in the library both surfaces share, with `min` and `max` on the adapter fields.
Capping an 11 at 10 was the other reading and is worse: the trial is scored out of 10, so a count above it
is a recording error, and quietly rewriting a recorded observation is what
[[project_silent_substitution_vein]] is about.

**The defect had a passing unit test guarding it**, called `bess: caps each stance at 10`, whose body
asserted that 99 errors score zero, with a comment reading `// out of range -> 0`. The name claimed the
cap; the body pinned its absence. That is worth more than the tile: a test whose name and body disagree
is worse than no test, because it answers the question nobody re-asks.

### The other 36, and an honest false-positive profile

They are faithful instruments, and saying so is the point. A severity score gives points for a sodium that
is high *or* low, so APACHE II, SAPS II, NEWS2, MEWS, REMS, LODS, OASIS, PIM3, FGSI, MEOWS and psofa all
turn once by design. `predicted-spirometry` peaks in the early twenties because lungs do. `palbi` is
quadratic in log platelets because its published formula is. `adult-appendicitis-score` really does score a
CRP over 152 *lower* than one of 50 after 24 hours of symptoms, as Sammalkorpi 2014 prints it. NNT and the
percent-difference tools turn where their denominator crosses zero.

One sharper-looking signature was tried and dropped. The BESS series returned to *exactly* its starting
value (15 → 25 → 15), which reads like a discarded input. Across the catalog 37 rows do that, and 36 are
symmetric severity scores where an extreme high and an extreme low are the same points on purpose.

### What the probe does not reach

Only 573 of the catalog's 13,230 fields declare both bounds. A field without them is swept around its own
worked example over a guessed band and reported separately, as a weaker row; a field with neither a
declared range nor a positive numeric example cannot be swept at all. "Clean" here is a claim about 2,894
sweeps, not about the catalog.

## Not fixed here

- The scheduled `data-refresh` run is red on `pgx-label-dose-limit: example expected numbers not in
  result: 62.5, 50`. That is the fail-closed rule firing as designed on refreshed DailyMed data: the
  label edition the tool read was superseded, so the tool withholds its dose statements and its example
  stops producing numbers. It needs the new label edition read by a person, not a code change, and it
  does not fail on the data in the repository.
- The end-to-end job runs 2.7 hours. Nothing in it is failing for time, but `every-tool-is-wired`
  (11.3 minutes) and the four `example-correctness` shards (9.3 to 9.5 minutes each) carry most of it.
