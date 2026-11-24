# spec-v1783 — A ceiling that discarded, and a sentence asking for a box that is not there

> Status: **SHIPPED (2026-11-23)**: 2 tools fixed, 4 rows judged, a ninth finder under the ledger gate. The
> catalog stays 2,390.

Two finders had short lists nobody had read to the end: `probe-impossible-as-zero` with five rows, and
`probe-unsupplied-input` with four. Reading them produced one real defect in each, and both are the same
kind of thing -- a value that never reaches the formula -- seen from opposite ends.

## The ceiling that was written where it discards

`pk-suite` reads its dosing interval as `pos(o.tau, 1000)`. `pos()` returns null for a blank, for a
non-number **and for a value above its ceiling**, and every caller reads null as absent. So a τ of 999,999
hours gave exactly the answer a blank τ gives: no maintenance dose, no word about why. That is
[spec-v1201](spec-v1201.md)'s dead end, the one `inputFault` and `gradeFault` exist for, and the tool
already had a `gradeFault` row for τ from spec-v1744 -- with a ceiling of `Infinity`, guarding the negative
end only.

The fix is one argument: the row now reads `['the dosing interval', o.tau, 0, 1000]`. **The ceiling is not a
new claim.** It is the one that reader already had, moved from where it discards a number to where it
refuses one. 1,000 hours is accepted, 1,001 is refused by name, and a blank τ is still optional.

## A refusal that asked for a box nobody has

`spetzler-ponce` accepts either a Spetzler-Ponce class or a Spetzler-Martin grade to derive it from, and no
surface offers the grade: the page has one select and the agent field list has one entry.
`probe-unsupplied-input` has reported that since October 17, 2026, and
`test/unit/probe-unsupplied-input.test.js` judges it by design -- "an alternate route from a Spetzler-Martin
grade; both surfaces ask for the class itself."

That judgement is about the missing **input**. Nobody had read what the tool **tells a reader**, and with the
class left blank it said:

> Select the Spetzler-Ponce class (A, B, or C), or enter a Spetzler-Martin grade (1-5).

There is no such box, on either surface. The reader is sent looking for an input that does not exist, which
is the shape [spec-v1403](spec-v1403.md)'s vein is named for, reaching the reader instead of the arithmetic.
The sentence now asks for what is there. The `smGrade` route stays for a caller of the module, and the
by-design ledger carries the lesson in a comment: **when a row is judged by design, read the tool's own
refusal as well.**

## The four that are right

`probe-impossible-as-zero` drives an impossible value on the library path -- the path the page takes -- and
reports a field that scores it exactly as 0. Its remaining four rows are now judged, in two kinds:

| Row | Why the row is not a defect |
|---|---|
| `cluster-headache-ichd3` attack duration | ICHD-3 3.1 asks for attacks of 15 to 180 minutes. 999,999 minutes fails that criterion exactly as 0 does, and "criteria not met" is right for both. A domain for the field would have to be WIDER than the criterion -- otherwise no reader could enter a duration that fails it -- and ICHD-3 states none. |
| `migraine-ichd3` headache duration | The same, against criterion B's 4 to 72 hours. |
| `du-bois-ipf` 24-week FVC change | The change scores by category, and +999,999% falls in the model's "greater than 0" band exactly as 0 does. The score is right for both; a ceiling on the change is a claim du Bois does not make. |
| `o2-cylinder-duration` flow rate | The clamp is in the adapter's own `compute` wrapper, where it exists to pass 0 for an absent optional field. The field declares a minimum of 0, so `validateInputs` refuses a negative before that wrapper runs, and the page reaches the library directly, where `num('flowLpm', …, { min: 0, max: 100 })` refuses it. No surface reaches the clamp. |

The first three share a shape worth naming: **an instrument whose own criterion fails an absurd value
exactly as it fails zero**. The verdict is right, so the row is not a wrong answer; what it is, is an entry
nobody could have made going unremarked. Bounding the field needs a domain the instrument does not give, so
it is a decision to take rather than a fix to make, and it is written down instead of re-read every run.

`probe-impossible-as-zero` joins `test/unit/finder-ledgers.test.js`, which now holds **nine** finders to
their ledgers in both directions.
