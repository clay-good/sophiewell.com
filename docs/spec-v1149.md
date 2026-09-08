# spec-v1149 — three that needed the instrument read

Third batch out of [spec-v1146](spec-v1146.md)'s backlog: the rows where the
pattern does not tell you the answer.

## `saps-ii` — a level the table cannot produce

SAPS II scores oxygenation only in a ventilated patient, and the code said:

```js
// When ventilated but the gas values are blank, the term is treated as
// not-measured (0).
```

`pfPts` is `v < 100 ? 11 : v < 200 ? 9 : 6`. **It cannot return 0.** A ventilated
patient scores at least six points for oxygenation, always — so "not measured" was
scored at a level the instrument does not contain, and the total came out low:

| | Points | Predicted hospital mortality |
| --- | --- | --- |
| blood gas entered | 64 | 75.3% |
| blood gas blank | 55 | 57.5% |

Nine points and eighteen percentage points of predicted mortality, silently. The
score is monotone in its items, so the total is a **floor**: it may rule in and
never out (rule 3), and it says so now — *"SAPS II at least 55 points … that term
scores 6, 9 or 11 in a ventilated patient and never 0, so both figures are floors
and can only rise."* A patient who is not ventilated is untouched: there the term
is genuinely zero.

## `lvh-criteria` — one lead is a floor, not a total

Sokolow-Lyon is SV1 + the **larger** of RV5 and RV6. The library has always formed
the sum from either lead, which is right — but read as a total it ruled **out**:

```
SV1 20, RV5 10, RV6 not entered
  "No LVH voltage criterion met by the entered amplitudes."   (sum 30)

the same patient, with RV6 16
  "Voltage criteria for LVH positive: Sokolow-Lyon."          (sum 36)
```

The lead nobody measured may be the larger one, so a partial sum below 35 is a
criterion still being formed, not one that failed. At or above 35 the reading
stands whatever the missing lead turns out to be ([rule 13](product-decisions.md)),
so only the negative waits — and it names the gap and the distance:

> *…but RV6 is not entered, and Sokolow-Lyon uses SV1 + the LARGER of RV5 and RV6,
> so 30 mm is a floor: 5 mm more in RV6 would meet it.*

**An existing unit test asserted the defect.** `Sokolow-Lyon 35 mm edge is met`
checked `sokolowMet === false` for `{ sV1: 16, rV5: 18 }` — RV6 left out. It now
asserts both halves: undecided on one lead, negative on two.

RV5 and RV6 were also both declared `required` to agents, though the library needs
either. That is rule 27 — **optional one at a time, required as a set** — and the
declaration has been refusing agent calls the browser answers.

## `vanc-auc` — a timestamp that was never taken

All seven inputs read through `val()`, which is `Number('')` — zero. The
elimination constant is `ln(peak/trough) / (tTrough − tPeak)`, so a **draw time**
nobody recorded read as *"at the end of the infusion"* and the whole AUC moved with
it. A vancomycin dose built on a zero. All seven are asked for by name.

## The sweeps were reading half the vocabulary

With `saps-ii` fixed, the probe still flagged it — because both sweeps filtered on
`ASKING` alone, and *"the PaO2/FiO2 is not entered"* is `DISCLOSING`. That is the
distinction [test/lib/asking-language.js](../test/lib/asking-language.js) draws,
and its own rule says which side these two are on:

> Only the one-blank-field gate, which starts from a complete example, accepts a
> disclosure as sufficient.

Both of these start from a complete worked example and clear **one** field. So a
tile that answers with its footing has done what this programme asks, and counting
it as an offender is the gate arguing with the rules it enforces.

Measured before changing it, as the house rule requires: accepting `DISCLOSING`
moves exactly **two** rows, and both are the `saps-ii` pair above. The filter now
lives in `test/lib/required-fields.js` as `refusedOrDisclosed()`, one copy for
both.

## Backlog

**45 → 40.** The "number that is not a measurement" group is drained. What is left
is the four groups triaged in [spec-v1146](spec-v1146.md): declared-required but
documented optional, criteria that are present or absent, suites of independent
readings, and eleven singles.
