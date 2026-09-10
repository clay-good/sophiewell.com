# spec-v1215 — a probe that checks its own reach

[spec-v1213](spec-v1213.md) shipped `probe-optional-read-as-zero` reporting
**0 rows against a reach of 15 view modules**. There are 781 view modules.

The reach line was honest about what it matched and silent about what that
matched *of*. So it got asked directly.

## The answer, in two halves

**Helpers: 15 of 781, and that is the whole population.** A scan for any
module-level reader that turns an element's value into a number without asking
whether the field was blank finds exactly fifteen, and all fifteen have the
one-line shape the probe already matched. The other 766 modules read a blank
correctly — `optNum` and its siblings, the canonical pair
[spec-v1065](spec-v1065.md) hoisted. That half of the reach was complete and
nobody had said so.

**Inline reads: eleven, and four of them in modules the probe never opened.**
A renderer can write the coercion in place:

```js
const dose = Number(document.getElementById('st-dose').value);
```

which bypasses the module's reader entirely. Eleven such reads with a static id
exist across four modules, and `views/group-b.js` is one of them — it carries no
helper, so the probe's outer loop skipped the file before reading a line of it.

None of the eleven reads an optional-labelled field. Three are `<select>`s, which
always have a value, and the rest are required-shaped fields that belong to the
blank-form and one-field-short sweeps, not to this question. **So the count did
not move**, and that is the point worth writing down: the finding here is not a
defect, it is that the previous run's zero was a claim about fifteen modules
wearing the clothes of a claim about the catalog.

## What changed

The probe scans every module, matches inline reads alongside helper calls, applies
the same optional-label and call-site-guard filters to both, and reports:

```
0 optional-labelled fields read as zero
  (reach: 15 view modules carry the helper; 11 inline reads bypass it and were checked too)
```

Negative-tested the way [spec-v1202](spec-v1202.md) requires, and specifically
against the new half: rewriting `salicylate-toxicity`'s guarded `optNum('sal-ph')`
as an inline `Number(...)` produces exactly one row — a defect the shipped version
of this probe would have reported clean.

## Why this is the whole wave

It is one sentence of behaviour and no fix. It is here because a gate reporting
clean is a claim about its reach, and the cheapest way for this program to fool
itself is a probe whose population is its own match set. Two of the last three
waves found their defect by asking a finder what it could not see
([spec-v1212](spec-v1212.md)'s six wrong answers,
[spec-v1214](spec-v1214.md)'s two), and the honest version of that is to ask
before something forces the question.

## Proof

Lint (19 gates) passes. No library, view or test changed, so the unit and MCP
suites are untouched by this wave; the count the probe prints moved from
"15 modules" to "15 modules and the 11 reads that bypass them", and the planted
inline defect is caught.
