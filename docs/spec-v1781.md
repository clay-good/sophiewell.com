# spec-v1781 — Declared, and what "documented" means to a finder

> Status: **SHIPPED (2026-11-23)**: 818 more fields declare their range, and two finders learned to read a
> declaration. No tool's arithmetic changed; the catalog stays 2,390.

[spec-v1777](spec-v1777.md) declared the caps that were two-sided and on a required field, 285 of them, and
left 1,004. [spec-v1779](spec-v1779.md) added `bound:` so a cap that IS one of the 45 `lib/bounds.js`
envelopes could name it instead of freezing a copy. This finishes the sweep -- the one-sided caps and the
optional fields -- and then asks what the older finders should now say about a cap that is written down.

| | before | after |
|---|---|---|
| Number fields declaring a range | 1,321 | **2,139** of 5,189 |
| ...as a literal `min`/`max` | 894 | 1,351 |
| ...as `bound:` naming an envelope | 424 | 788 |
| `probe-undeclared-cap` DECLARABLE | 1,004 | **106** |
| `probe-envelope-inside` | 213 | **48** |
| `probe-declared-cap-configs` reach | 1,304 fields / 11,342 configurations | 2,122 fields / 17,982 configurations, 0 open and 1 judged |

## What the finders now know

**`probe-envelope-inside` reads declarations.** It drives a value just inside an envelope and reports a tool
that refuses it, and its header always said most rows were not defects -- "a value the tool itself treats as
out of its validated population can rightly be narrower; read each row." That judgement is now machine-
readable. A field whose own range (resolved through `fieldRange`, so a named envelope counts) already
excludes the value being driven is a cap the tool STATES: it is in the published input schema, and an agent
reading `describe_calculator` is told before it calls. **116 of its 213 rows were that**, which was most of
what a reader had to re-decide every run. 48 are left, and every one is the thing the finder was written
for: a narrower cap nothing declares.

**`probe-undeclared-cap` learned two things about envelopes**, both of them from being wrong first.

A **ceiling alone** is still the envelope when the envelope's floor is 0 or below. Nothing can be probed
under such a floor -- the decade walk downward is never refused -- so the ceiling is the only edge this
finder can find, and requiring both sides routed `BOUNDS.wbc` x1000 and `BOUNDS.ageYears` into the
declarable list to be frozen as literals. Two tests caught it where no probe did: CPIS's leukocyte count
asserts `Leukocyte count (per mm^3) must be between 0 and 2000000` and SMART-COP's age asserts
`plausible range for age (0 to 130 yr)` -- the envelope's own sentences, which a literal pre-empts and a
named envelope leaves alone. That one correction moved **656 fields** out of "freeze a literal" and into
"name the envelope".

An **ambiguous match is not an envelope**. Four pairs of envelopes share their edges exactly, and two of
those pairs are round numbers that any number of quantities stop at on their own: 0 to 100
(`percentWeightLoss` and `spo2`) and 0 to 2,000 (`wbc` and `sixMinuteWalkM`). A percentage capped at 100 is
the field's own domain, and calling it an envelope declares a reference that would follow the wrong number
if either envelope moved. So an ambiguous match counts only where the field names which quantity it is --
`alt` against `ast`, `eGFR` against `esr` -- and otherwise it is the tool's own cap and gets a literal.

## 75 reverted, and why the probe has to run after every batch

The codemod wrote 893 declarations. **75 of them documented a range the library keeps only on some
branches**, and `probe-declared-cap-configs` named every one across 19,057 configurations -- renal-dose
checks whose kidney function is unread on dialysis, controlled-substance checks with a path that never looks
at the age. All 75 were reverted. That is the third batch in a row where this check earned its place: 4 in
spec-v1777, 4 in spec-v1779, 75 here.

Two bugs in the codemod are worth recording, because both would have shipped quietly:

* It appended to the **first line of a multi-line descriptor**, which the single-line pattern also matches.
  `billing-v82.js` ended up with a broken string literal.
* `String.replace` with a replacement **string** expands `$'`, and `unit: '$'` is a real label in the
  billing tools. The dollar sign swallowed the rest of the file. A replacement function never substitutes.
  The two earlier batches never touched a `$`-bearing line, which is why this surfaced only now.

## What is left

* 106 declarable caps, 99 on fields a unit select rescales (which need a declaration that can move with the
  toggle), and 81 whose cap moves with another input. Every one of the 106 was offered to the codemod and
  turned down by the configuration probe, so each needs the branch read rather than another batch.
* 124 envelope rows: 39 on fields another row already ranged, 36 whose edges would not re-prove by
  computation, and 26 in a descriptor spread over several lines, which the codemod will not touch after what
  it did to `billing-v82.js`. Those 26 are a hand edit each.
* 48 `probe-envelope-inside` rows: a narrower cap nothing declares.
