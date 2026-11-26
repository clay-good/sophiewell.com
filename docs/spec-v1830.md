# spec-v1830 — The range the sentence always stated

> Status: **SHIPPED (2026-11-26)**: six tools stop answering an impossible value with the sentence an empty
> box gets, where the range was **in that sentence all along**; three of them were accepting a value their
> own sentence excludes. The "entered, and asked for again" category goes from **8 to 2**, and 14 more
> declarations land. 6 library files, 11 adapters, no new number from outside. The catalog stays 2,390.

## The test spec-v1829 arrived at, applied

> *Is the bound already written somewhere in this tool* — in a regex, a reader's literal, a label's
> parenthetical — before asking whether it needs a source?

Six of the eight remaining rows **state their range in the refusal sentence itself**:

> "Enter the days supplied, from 1 to 365." · "Enter the sampling rate in samples per second (Hz), from 16
> to 20,000." · "Enter the Breslow thickness in mm (greater than 0, at most 100)."

None of the six declared that range on the agent surface, and none gave an out-of-range value its own
sentence. Driving each at its stated edges turned up something better than a tidy-up.

## Three tools accepted a value their own sentence excludes

`acute-opioid-rx-limit`, `pmp-check-required` and `tx-aprn-pa-controlled-delegation` all say **"from 1 to
365"** and all took `days <= 0 || days > 365` — so a days-supplied of **0.95** was accepted by a tool whose
own refusal says the floor is 1. The generated guard above it said `0, Infinity`, which is why nothing
caught it.

The correct form was already written **twice in this repo**: `adherence` and `pdc-star` both read
`!Number.isInteger(days) || days < 1 || days > 365` for the same quantity. So this is
[duplicated-rule drift](spec-v1211.md) with the right version already present — the three guards are now
`gradeFault([..., 1, 365, true])`, whole numbers included, because a prescription is dispensed in whole days.

## And an assumption of mine that cost nothing to test

`eeg-band-power` and `qrs-detect-trace` refuse at their stated ceilings (20,000 Hz, 10,000 Hz), and I had
written in [spec-v1822](spec-v1822.md) and [spec-v1827](spec-v1827.md) that such an edge **cannot be
declared**, because `declared-cap-honest` requires the library to answer there.

It can. Those tools refuse at 20,000 Hz because the worked example's **128-sample trace** is too short for
one window at that rate — *"the recording has 128 samples; one 3.277-second window needs 65536"* — and the
gate already ignores a refusal that is not a range sentence: `if (!RANGE.test(message)) continue; // refused
for some other reason`. The distinction I described as missing had been in the gate since
[spec-v1777](spec-v1777.md).

Testing it took half a minute and turned up **eight more declarable sides**, including four fields the
envelope finder never listed — `iv-iron-course`'s hemoglobin and hematocrit, `digoxin-label-dose`'s
creatinine and age. 2,826 number fields now declare a bound.

Six sides came back off, named by `probe-declared-cap-configs` — a GFR ceiling and a creatinine pair that
hold only in some branch — and that is the loop working as designed rather than a surprise.

## What is left: two

`dose-index`'s FEV1 percent predicted and yearly exacerbation count, which share one refusal that lists
four fields. [spec-v1826](spec-v1826.md) settled that the FEV1 half has no published maximum and needs none.
The exacerbation count is the last row in this category that genuinely wants a source.
