# spec-v1067 — the one-blank-field gate

Four waves of fixes ([v1063](spec-v1063.md) → [v1066](spec-v1066.md)) came out of
a probe that nothing enforced. This turns it into a gate.

## What it asks

Fill a calculator from its own worked example — a complete, correct patient —
then clear a **single** field and read the answer. Only fields whose label names
a quantity that cannot be zero in a living patient are touched, because for those
a blank read as `0` is never a value the reader could have meant.

A calculator fails when clearing such a field **changes the answer** and the new
answer neither asks for the value (`ASKING`) nor says what it is missing
(`DISCLOSING`). Dropping the dependent line entirely also passes — then the
number computed from a zero is not on screen at all.

Runtime is 1.6 minutes across four shards, chromium only.

## Why it is not the sweeps we already had

The two existing sweeps clear **every** field. That is the easy half, and worse,
it can only ever point at one field per calculator: the tile stops answering as
soon as a single guard fires, so the sweep goes quiet while every other field on
it stays unguarded. Three waves of half-fixed calculators came out of that blind
spot, and in each the neighbouring fields had been live for weeks or months.

## The ledger is keyed by FIELD

`test/integration/one-blank-field-ledger.js` is keyed `tileId|fieldId`. The
empty-form ledger beside it exempts a whole calculator, and spec-v1029 found five
scores whose checkbox exemption had been quietly covering a measurement too — a
tile-level line cannot say "these seven fields are criteria and that one is a
measurement". Here, exempting one field leaves the rest of that calculator
guarded. This closes the oldest open item on the programme page.

25 lines, in four groups: it drops the dependent output (9), it drops a note
written about the entered value (4), the field takes a genuine zero (8), or it
rules **in**, where a floor owes no caveat (4).

### Seeding a ledger from memory is how you get a quiet gate

The first draft of this ledger was written from notes, before the gate had ever
printed a key. Several of the guessed `fieldId`s happened to be right — so those
calculators were silently exempted, and the gate reported **16 offenders where
there were 24**. `truelove-witts` and `modified-marshall` disappeared from the
output not because they passed but because a guess had matched.

Emptying the map and re-running produced the real list. **If this ledger is ever
re-seeded, empty it first.** A ledger written ahead of the run does not document
a gate's exceptions; it decides them.

## Two corrections to earlier waves

**`abi`** was found by the gate rather than the probe, and was a real defect.
With only one ankle pressure entered it printed the surviving leg's index as
"(lower index governs)" — a comparison that had not been made — and where that
leg was normal the headline read "normal (1.00-1.40)" for a patient whose other
leg nobody had measured. Peripheral artery disease is frequently one-sided. It
now says "the only leg calculated", names the missing side, and adds that this
does not exclude disease in it when the calculated leg is normal.

**`shock-index`** was over-guarded in v1063. That wave required a systolic, a
diastolic and a heart rate before printing anything — but the shock index is
HR/SBP and has no diastolic term in it at all. The over-guard broke the search
template `shock index hr 110 sbp 90`, a query naming exactly what the shock index
needs, and CI's `inline-compute-agreement` caught it. Each of the tile's four
outputs is now guarded by its own inputs: MAP and pulse pressure need both
pressures, the shock index needs HR and SBP, the modified index needs all three.

The lesson is narrower than "do not over-guard". **A tile that prints several
results is several calculators, and the panel-wide ask is only right when the
outputs genuinely share a panel.** `apache2` does; this one does not.

## Coverage

The gate starts from a worked example, so a calculator without one is invisible
to it. Measured: **five** of the catalog have no `META.example.fields` —
`co-cn-antidote`, `tetanus`, `rabies-pep`, `bbp-exposure`, `sti-screening`. All
five are protocol checklists driven by selects and checkboxes rather than
measurements (`co-cn-antidote` has **zero** number inputs), and none is exposed
on the agent surface either. There is nothing for this gate to ask them.

So the gate covers every calculator that has both a worked example and a field
whose label names a quantity that cannot be zero — which is the whole population
the question applies to.

## Verification

Negative-tested by removing the `egfr` age guard from spec-v1064 and confirming
the gate fails with `egfr|age`, then restoring it. `ASKING` was not touched:
`DISCLOSING` is a separate export in `test/lib/asking-language.js`, because a
tile that answers an *empty* form has not been excused by disclosing — with
nothing entered there is nothing to disclose about, and merging the two would
exempt every tile that says "scored from 0 of 6" and then prints a total.
