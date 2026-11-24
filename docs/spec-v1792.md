# spec-v1792 — Batch three, and the contract a codemod walked into

> Status: **SHIPPED (2026-11-24)**: 8 more tools fixed, 19 left, and one rule written down the hard way. No
> arithmetic changed; the catalog stays 2,390.

[spec-v1791](spec-v1791.md) left 113 refusals across 27 tools. Two shapes accounted for most of them, and
both are fixed here:

**A builder that feeds a message from somewhere else.** Nine files assemble `missing` with
`.map((x) => x.m.key)` and join it further down. Worth noting: every one of those files **already** passes
`m.text` to its range helper, so the reader's wording was in the table the whole time, and only the
missing-field list used the key.

**camelCase literals pushed straight into the list.** Fourteen of them, now in the reader's words:

| Before | After |
|---|---|
| `missing.push('cnsManifestation')` | "a central nervous system manifestation" |
| `missing.push('allThreeColorectal')` | "all three relatives have colorectal cancer" |
| `missing.push('intubationBand')` | "the time to intubation" |
| `missing.push('ageAtLeast55')` | "age 55 or over" |

**113 refusals across 27 tools became 58 across 19.**

## The rule this batch cost: a structured field keeps its keys

"Follow the variable" is the right idea and it was too loose. Several of those arrays feed a **structured
output field** as well as a sentence:

```js
unmetRequirements: unmet.map((r) => r.key),      // what an agent branches on
metFeatures: met,                                 // likewise
weightedComponentsPresent: weightedComponents,    // likewise
majorCriteriaMet: majorMet,                       // likewise
```

Turning those into prose changes what every caller receives. `unmetRequirements: ['fapExcluded']` is a
machine-readable answer to "which requirement is unmet"; `['Familial adenomatous polyposis excluded in the
colorectal cancer family']` is a sentence pretending to be one.

**Three tests caught it.** `amsterdam-ii`, `arc-hbr` and `sternbach` all pin those arrays with `deepEqual`,
and failed immediately. **Two did not**: `jta-thyroid-storm`'s `metFeatures` and
`lupus-nephritis-indices`' `weightedComponentsPresent` are unasserted, and would have shipped silently. They
were found by reading the whole diff for the pattern the three failures named, rather than trusting the
green suite around them.

That is the lesson worth keeping from this spec: **a passing suite proves no ASSERTED contract broke, not
that none did.** When a mechanical change touches a shape, grep for every instance of that shape and read
them, even the ones no test mentions.

So the rule is now explicit, and `save-score` is its clean illustration in one file: `missingFlags` feeds a
message and uses `text`, while the criteria lists beside it keep their keys.

## What the finder cannot see

19 tools remain, each a shape of its own -- "Check: lateralE", "Answer fixedFee with yes or no",
"Select a valid score (0-2) for iadlHelp", "Still needed: afcCutoff". Six of them carry only a `label` on
the item and six carry no item prose at all, so each needs a read rather than a pattern.

And one limit is deliberate. The finder reports **camelCase** names only, because an interior capital is the
one thing that cannot be ordinary English or an instrument's published notation. A single-word key is
invisible to it: `myxedema-coma` now says "Still needed: temperature, cns, gi, bradycardia, a precipitating
event, Other ECG changes (QT prolongation, low voltage, bundle branch block)", where the last two entries
are this batch's and the bare ones pre-date it. `cns` and `gi` are abbreviations a clinician reads without
trouble, which is exactly why no machine can sort them from the ones that need rewording.
