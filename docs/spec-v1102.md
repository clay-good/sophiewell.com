# spec-v1102 — the finder was only looking at numbers

[spec-v1101](spec-v1101.md) built a finder for "one tile, two gaps, one
guarded" and tested `kind === 'number'` fields only. That is **3,563 of the
9,039 fields in the catalog**. Applying [spec-v1099](spec-v1099.md)'s rule to it
— *a finder's reach is part of its result* — the obvious question was what the
other 61% hides.

**Booleans stay excluded, on purpose.** Rule 4 of this programme says an unticked
checkbox is a real "no", so a missing boolean is an answer rather than a gap.
**Enums are different**: a `<select>` always has a value, so the browser never
sends a blank one — but an API caller omits keys by default. That is exactly the
surface split [spec-v1073](spec-v1073.md) is about.

Adding enums took the finder from **8 calculators to 26**.

## `nichd-fhr` graded a tracing nobody described

Every fallback in the tile is the **normal** value — moderate variability, no
decelerations, no sinusoidal pattern. With a baseline alone it answered:

> **Category I**: a baseline of 140 beats per minute, which is normal, moderate
> variability, and neither late nor variable decelerations.

Three findings asserted from one number, in the category that means no action is
needed. And omitting the variability took a genuine **Category III** tracing down
to **Category II** — expedited delivery to continued surveillance.

The fix took two attempts, and the existing suite caught the first one. Refusing
whenever *anything* was missing was too strict: minimal variability with
recurrent late decelerations cannot be Category I (minimal, and lates present)
and cannot be Category III (which needs *absent* variability), whatever the
variable decelerations are. The rule that survives:

- **III** turns on the variability. Observed and not absent, III is impossible.
  Observed as absent, III depends on decelerations, so unobserved ones leave it
  open.
- **I** is a conjunction of four normal features, so it needs all four observed.
- **II** is safe only once I is ruled out by something **observed** — returning
  "II" because a feature is merely unrecorded asserts "not Category I", which an
  unobserved feature cannot support.

Nine existing tests were written against the fallbacks, several with a name
claiming features the call did not pass (*"a normal baseline with moderate
variability and no decelerations"* calling `nichdFhr({ baseline: 140 })`). Each
now passes the features its own name claims.

## `kings-college` and the default that fired too early

```js
inr, pt, creatinine, creatinineUnit = 'mg/dl', encephalopathy = 'no',
```

A destructured default fires when the argument is **absent**, so it erased the
difference between "nobody said" and "observed absent" before any guard could see
it — and `'no'` is what makes the three-part limb fail. An agent omitting the key
turned *"Meets King's College Criteria: poor prognosis — refer/list for
transplant"* into *"Does not meet"*.

This is [spec-v930](spec-v930.md) from the other side. That wave found a blank
**string** walking *past* the default; this is the default firing when it should
not. Both leave the same wreckage.

The limb already had an INCOMPLETE state for a missing INR or creatinine. The
encephalopathy was kept out of it by a comment:

> (encephalopathy comes from a select and is always known)

True of the browser. False of every API caller. **An assumption about one surface,
written down as a justification, is how the other surface gets missed.**

## Two more found, one fixed elsewhere

`mchat-rf` was flagged and is **correct**: it already says *"8 of the 20 items are
unanswered … and an unanswered item scores nothing."* The shared `DISCLOSING`
list matched `of \d+ items` and not `of **the** 20 items`, though the house
writes both in 7 files. The article is now optional — a generalisation of the
pattern already there rather than a new phrase, moving exactly one tile from
flagged to exempt.

`euroscore2` remains open: dropping the NYHA class moves predicted mortality from
10.66% to 8.15%. A regression with a missing covariate is a different shape from
the threshold rules this programme has been working, and it deserves its own
reading rather than a footing bolted on.

## What is left

The finder reads 26 calculators. The high-stakes ones have been read:
`spetzler-martin` is correct (the core grade does not move and it says so),
`ipss`, `mayo-uc` and both `posas` tiles were cleared in
[spec-v1101](spec-v1101.md). The remainder are unread, and that is stated here
rather than left to look like a clean sweep.
