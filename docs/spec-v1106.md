# spec-v1106 — the gate was already there, asking a third of the question

[spec-v1105](spec-v1105.md) ended by naming a gate it thought should be built:
something to catch a `values` list the on-screen picklist does not offer.

It was already built. `test/integration/field-values-match-dom.spec.js`
([spec-v770](spec-v770.md)) has held declared lists to rendered options **in both
directions** for a long time, and it was green while `cauchy-frostbite` was
wrong.

So the work was not a new check. It was finding out why the existing one had
nothing to say — and the answer is [spec-v1099](spec-v1099.md)'s rule, three
times over: **a check's reach is part of its result.**

## Three ways it was not looking

**1. It filtered on `kind === 'number'`.** 645 fields carry a declared list on a
number field. **2,341 carry one on an enum**, and none of those had ever been
compared. `cf-bone` is an enum. This is [spec-v1102](spec-v1102.md)'s finding —
*the finder was only looking at numbers* — arriving independently at a different
check one wave later. Two things in this repo have now been narrowed the same
way by the same reflex.

**2. The perturbation skipped number inputs.** The gate's own header says why the
perturbation exists:

> Read under perturbation, because some selects are repopulated by another field
> (`rucam-course` changes with the RUCAM scale)

The RUCAM scale is chosen by an R ratio computed from **four number inputs**, and
the loop moved selects and checkboxes and did `else continue` on everything else.
So the mechanism never did the thing it was documented to do, and spec-v770's
write-up hand-waived the two cholestatic values it therefore could not see:
*"the two `rucam` values belong to the cholestatic scale."* True, and checked by
a person once, in 2026 — which is what a gate is for.

**3. The empty option was filtered out of one side only.** `read()` dropped `''`
from the *offered* list and nothing dropped it from the *declared* one, so ten
tiles that declare `''` were reported as short by exactly that.

## What that was worth

| | disagreements |
|---|---|
| as it stood, over number fields only | 0 |
| widened to enums | 29, across 8 tiles |
| after the `''` fix | 19 |
| after the perturbation reached numbers | **1** |

The one is `rvu-payment | rvu-loc`, and it is real but small: a Medicare-locality
select whose options are loaded from bundled GPCI data, which fills the three
GPCI boxes as a convenience and which `toArgs` then drops on the floor. Its
`values: ['manual']` is the adapter saying *the only mode an agent has is to pass
the triplet itself*. It is ledgered in the spec file with that sentence, and with
what would resolve it: teaching the adapter the locality table, which is a
feature rather than a fix.

## Verified by reintroducing the defect

The `cauchy-frostbite` option split from spec-v1105 was reverted and the sweep
re-run. It now fails with `cauchy-frostbite | cf-bone` unoffered `["normal"]`,
where before this wave it passed. The fix was then restored.

The gate also asserts its **reach** — that the registry carries declared lists on
more than 800 tiles, where the number-only filter saw 108 — so a future narrowing
cannot quietly turn "clean" back into "looked at almost nothing".

## The rule

**A gate reporting clean is a claim about its reach, not about the catalog.**
Every one of the three narrowings here was invisible in the only place anyone
looks: a passing test. The programme has now written this down for a finder
(spec-v1099), for a probe (spec-v1102) and for a gate, and the shape is identical
each time — a filter that was reasonable when it was written, over a question
that had since grown.

The practical form: **a check that filters its subjects should print or assert how
many it kept.** All three of these were found by counting, not by reading.

## And a near miss worth recording

The first attempt at this wave was a **new** gate, written from scratch, with its
own ledger and its own probe. It passed, it caught the cauchy defect on a
negative test, and it was a second copy of a rule this repo already had — found
only by grepping CONTRIBUTING.md for how to document it. That is
`[[project_duplicated_rule_drift]]` almost happening again, and it argues for the
same habit in reverse: **before building a check, grep for the one that already
exists and ask why it is quiet.** The answer to that question was this whole
spec.
