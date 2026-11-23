# spec-v1774 — The same inputs, a different answer on a different machine

> Status: **SHIPPED (2026-11-23)**: 10 tools. The catalog stays 2,390.

Every worked example in the catalog was driven under four time zones -- UTC, the two extremes of the offset
range (+14 and -11) and one that observes daylight saving. Nine answers moved.

All ten tools are deadline clocks, and each had written its own "today":

```js
Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
```

That reads the **local** calendar date out of `now` and then calls it UTC. Fourteen hours east of UTC it is
already tomorrow, so the day count shifts by one, and a verdict can go with it:

| Tool | On a UTC server | Fourteen hours east |
|---|---|---|
| `cs-theft-loss-clock` | "Notice was due 41 days ago; Form 106 due in 0 days" | "Form 106 was due 1 day ago" |
| `psychotropic-prn-clock` | "Ended 40 days ago" | "Ended 41 days ago" |
| `dea-registration-renewal` | "the renewal window opens in 68 days" | "in 67 days" |

`todayUtc` in `lib/pa/date.js` is this project's rule and about fifty libraries use it; `lib/deadline.js`
already imported it. It now also exports `clockToday(now)`: the same UTC calendar date, with the null
contract these ten branch on -- no clock, no day count. The eleven hand-written copies are gone.

Which answer is right is not a matter of taste here. A day count that depends on the reader's machine cannot
be reproduced, cannot be pinned by `SOPHIEWELL_NOW`, and already disagreed with the fifty libraries that
count from the UTC date.

| Fixed | |
|---|---|
| `cs-theft-loss-clock`, `cs-biennial-inventory`, `dea-registration-renewal`, `dea-222-validity` | a local copy named `todayUtc`, now the shared one |
| `cs-disposal-clock`, `mat-injection-admin-deadline`, `psychotropic-prn-clock` | the expression inline in a day count |
| `ind-safety-report-clock` (two sites), `ind-annual-report-due`, `fda-adverse-event-report-clock` | the same, with their own fallbacks kept |

`check-helper-drift.mjs` now also refuses a re-declaration: `todayUtc` belongs to `lib/pa/date.js`, and a
library that writes its own is the defect however that copy behaves. The gate used to read only `views/` and
only `function NAME(` declarations, which is why ten `const todayUtc = ...` copies in `lib/` were invisible
to it.

The other gate: `test/unit/time-zone-independent.test.js` drives all 2,346 worked examples in four zones and
fails on any answer that moves. A tool that reads the real clock could straddle midnight between two reads,
so a difference counts only when a second UTC read reproduces the first exactly. Negative-tested by putting
one of the ten back.

## The rest of the family, swept and clean

Time zone was the one that moved. The other ways an answer could depend on something other than its inputs
were swept the same day, and are recorded here so the next session does not sweep them again:

| Swept | Result |
|---|---|
| Locale: a `toLocaleString` or `toLocaleDateString` with no locale argument | none in `lib/`, `views/`, `mcp/` or `app.js`; every call names `en-US` |
| Environment: a `process.env` read inside `lib/` | one, `SOPHIEWELL_NOW` in `lib/pa/date.js`, which exists to pin the date |
| Input order: every example driven again with its keys reversed | 0 of 2,004 answers moved |
| Repetition: every example computed three times in one process | 0 of 2,346 answers moved |
| Mutation: the inputs object after the call | 0 of 2,346 were touched |
