# spec-v1043 — Two more, and a ledger that says why

## The two

`restraint-timer` sets renewal and re-assessment intervals from the patient's **age band** — 4 hours
at 18 and over, 2 hours from 9 to 17, 1 hour under 9 for a violent restraint. A blank age read as 0
years, so the tile issued the under-9 intervals for whoever was in the restraint. It now asks.

`em-time` selects an evaluation-and-management code from the total time on the date of the
encounter. A blank time read as 0 minutes and the tile answered *"Below the 15-minute floor for
outpatient new-patient E/M (99202)"* — a coding verdict about an encounter whose time nobody had
entered.

## The ledger

Seventy-five tiles answered without a required field when spec-v1037 measured it. Forty-eight are
fixed. The remaining 27 were a bare list of ids, which is a list of tiles somebody once looked at
rather than a list of decisions — so each now carries the reason it is there, grouped by which of
the ledger's three categories it falls into:

| Group | Count | Why |
| --- | --- | --- |
| A sum over things present or absent | 7 | a blank drug is a drug not running |
| A partial score that states its footing | 5 | "Scored from 9 of 10 items" is the honest answer |
| A one-way conversion | 1 | it prints the direction it has a number for |
| Rating scales that do not say how many items they scored | 9 | truthfulness fix; none crosses a treatment threshold on a blank item |
| Blocked on a control change | 1 | WAT-1's items are sliders, which cannot be blank |
| Probably an over-strict `required` declaration | 4 | the billing tiles; read the declaration against the formula |

Two things fall out of writing it down. The nine rating scales are one wave, not nine judgments —
they all need CIWA's "Scored from N of M items" and none of them is a safety defect. And four lines
may not be browser defects at all: if `cob-calc` answers correctly without a field the agent surface
demands, the **declaration** is what is wrong, and an agent is being refused an answer it could have.

## And a debug spec

`test/integration/zz-trace.spec.js` was committed on 2026-08-21 beside the aria-live fix it was
written to debug. It loads two tiles, prints a trace, and asserts `expect(true).toBe(true)`. It has
run on every push since, in three browsers, and can never fail. Removed.
