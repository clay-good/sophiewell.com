# spec-v1095 — an unmeasured input read as its most benign value

Five tiles, one shape, from the finder's remaining list. Each takes a field
nobody filled in and treats it as the *best* thing it could have been.

| Tile | A blank read as | The reading it produced |
|---|---|---|
| `icans-grade` | an ICE score of **10** | "No ICANS (ICE 10 and no consciousness, seizure, motor, or raised-ICP findings)" |
| `gold-abe` | **0** moderate exacerbations | "Group B … low future-exacerbation risk (0 moderate exacerbations, none hospitalized in the past year)" |
| `isgps-dge` | all three time criteria **passed** | "No DGE — no delayed gastric emptying" |
| `simon-broome-fh` | a lipid **below** threshold | "cholesterol criterion not met — FH not classified" |
| `gardner-robertson` | the missing measure at **class 0** | "class II — serviceable. Serviceable hearing." |

## Asserting the measurement is worse than assuming it

Three of these do not merely *use* a benign default — they **print** it. `icans-grade`
says "ICE 10" and `gold-abe` says "0 moderate exacerbations, none hospitalized in
the past year", both about a patient nobody asked. A silent zero is a bug in the
arithmetic; a stated value is a fabricated observation in the record, and a
reader has no way to tell it from one that was taken.

`icans-grade` is the sharpest. An ICE of 0–2 is grade 3 on its own, the ICE is
the domain the whole instrument is built around, and the patient is under CAR-T
neurotoxicity monitoring where catching the change early is the entire purpose.
It now refuses: *"ICANS cannot be excluded: the ICE score was not entered."*

## Each tile keeps what it legitimately knows

None of these became a blanket refusal. Every one of the five grades on a
**maximum** over domains, so a domain that *was* assessed still sets a floor:

- `icans-grade` keeps a grade driven by consciousness or motor findings, and
  adds that the ICE can only raise it — unless the grade is already 3 or more,
  where the ICE cannot change the management line.
- `gold-abe` keeps group A or B from the symptom axis, and names the
  exacerbation history as the thing that could move it to E.
- `gardner-robertson` says nothing when the class is already non-serviceable:
  that rests on a measure that was taken, and the missing one can only confirm it.

Ruling **in** is untouched in all five.

## `gardner-robertson` contradicted its own printed sentence

`Math.max(ptaClass || 0, sdsClass || 0)` makes a missing measure class 0, so the
poorer of the two can never be the one that is absent. Directly beneath that
result the tile prints its own rule: serviceable hearing needs a pure tone
average of 50 dB or better **and** a discrimination of 50% or better, *"both
rather than either"*. Dropping the discrimination took a patient from class V
(none) to class II (serviceable).

## The headline and the detail must agree

`isgps-dge` puts its message in `detail` and its headline in `bandLabel`. Fixing
only the detail would have left "**No DGE**" in large type above a paragraph
saying the course was never recorded — two disagreeing statements on one page,
and the headline is the one that gets read. Both moved.

## Result

The finder read 20 fields across 15 calculators after
[spec-v1094](spec-v1094.md) and reads **13 across 10** now.

`gardner-robertson`'s two fields remain, in the weaker second section: they are
class refinements *within* non-serviceable (III → V), where the verdict a reader
acts on does not move. That is the disclosure being correctly withheld, not a
defect left behind.
