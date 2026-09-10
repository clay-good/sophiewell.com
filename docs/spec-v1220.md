# spec-v1220 — a field labelled as an override that overrides nothing

[spec-v1217](spec-v1217.md) triaged `timely-filing` and `pa-turnaround` out of its
findings and said why:

> **correct computation, questionable label.** Medicare's 365 days is statutory
> (42 CFR 424.44) so a custom limit rightly cannot override it — but the field says
> "overrides the payer default" and the reading says nothing when the value is
> ignored. A disclosure question, ledgered rather than fixed here.

This is the ledger line, drained.

## Two fields, and where each is wrong

Neither computation changes. Both windows are set by rule and both rules are
right: Medicare is one calendar year after the date of service, and CMS-0057-F
sets the standard and expedited prior-authorization windows. A plan cannot
shorten either by typing a number.

What was wrong is that a caller who typed one got the statutory answer back with
**no acknowledgement that their entry had been discarded** — and, on the agent
surface, a field description that had promised the opposite:

| field | said | does |
| --- | --- | --- |
| `tf-limit` | "Custom filing limit in days (overrides the payer default)" | ignored entirely when the payer is Medicare |
| `pat-days` | "Custom window in days (overrides the default)" | read only on the `custom` branch |

## Which surface

**Browser: already correct, and worth saying so.** The page labels the fields
"Plan limit in days (non-Medicare)" and "Plan-specified window in days", and the
renderer passes `undefined` when the field does not apply — so the situation
cannot arise there. This was an **agent-surface defect**, the mirror of
[spec-v1037](spec-v1037.md)'s: there the browser answered what agents were
refused; here the agent was told something about a field that the page never
claimed.

The adapter's `label` is the agent's documentation of that field, so both were
rewritten to say what actually happens. The result now carries `unusedLimitNote`
/ `unusedWindowNote`, `null` unless a value was given and not used:

```
The filing limit of 90 days entered was not used: the Medicare limit is one
calendar year after the date of service and is set by 42 CFR 424.44, not by the plan.
```

The two renderers print the note when it is present. That is inert on the page
today, for the reason above; it is there so the disclosure cannot be lost if the
renderer ever stops passing `undefined`, and so both surfaces read the same
sentence.

## Why a note and not a refusal

Refusing would be wrong. Entering a plan's filing limit and then selecting
Medicare is a reasonable thing for a biller to do — the limit is real, it is just
not the one that governs this claim. The reader wants the statutory answer *and*
to be told their number was not it. That is rule 21's disclosure design rather
than [spec-v1207](spec-v1207.md)'s refusal, and the distinction is which one
leaves the reader better informed.

## Proof

Both new tests fail on the old behaviour and pass on the new, and each pins the
silent half too: nothing is disclosed when nothing was given, and nothing is
disclosed on the branch where the value **is** honoured (`type: 'custom'` still
returns a 14-day window from a 14-day entry, with a null note).
`probe-impossible-changes-nothing` drops from 6 rows to 4, since both of these
were on its list.

Lint (19 gates), 13,577 unit tests and 449 MCP tests pass.
