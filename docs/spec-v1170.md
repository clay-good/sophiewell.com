# spec-v1170 — 30 February

`new Date(2026, 12, 45)` is 2027-02-14. `Date.UTC(2026, 1, 30)` is 2026-03-02.
Neither fails; both roll over. So a parser that tests the **shape** of a date
string and then hands the components to one of those constructors accepts every
impossible date there is, and answers from a different one.

Four such parsers are in this repo. One of them, `lib/deadline.js`'s
`parseIsoStrict`, round-trips the components back out of the `Date` and throws
when they do not match. **The other three did not** — the shape was the whole
test.

This is [the duplicated-rule shape](spec-v1155.md) again, and the expensive half
of it: the copy that is right is no help to the copies that are wrong, and
nothing here ever compared them.

## What it cost, on two tiles

### `rosendaal-ttr` — time in therapeutic range

The whole input is one textarea of dated INR values, and **both ways of getting a
line wrong were silent.**

| The record | What the tile said |
| --- | --- |
| `2026-01-01 1.5` / `2026-01-11 2.5` / `2026-01-21 2.8` | TTR **80%** — 16 of 20 days in range |
| the middle line typed `2026-02-30` | TTR **88.3%** — 53 of **60** days in range |
| the middle line typed `2026-1-11` | TTR **65%** — 13 of 20 days in range |

The first is the rollover: 30 February became 2 March, and a twenty-day record
became a sixty-day one. The second is the other half — the shape test wanted two
digits, so an ordinary way of writing an unambiguous date was **dropped**, and
the reading was rebuilt from two of the reader's three measurements. It landed on
65%, which is the good-control threshold this tile exists to compare against.

Neither said anything. The band read "16 of 20 days" and "13 of 20 days" with
nothing to distinguish a reader who took two measurements from one who took three
and had one thrown away.

TTR is not a curiosity: below 65% is the number that argues for tighter
monitoring or a different anticoagulant.

### `preg-dating`

An LMP of `2026-13-45` passed the shape test, became 14 February 2027, and gave
an EDD of 2027-11-21 with a 421-day discordance against the ultrasound —
`discordant: true`, which reads as *redate by the ultrasound*.

## And two clocks parsed with `new Date(x)`

`restraint-timer` and `bristol-girth` take timestamps, and both read them with
bare `new Date()`, which will parse most things an engine feels like. The browser
renders `datetime-local`, so a reader could never send anything else — **an agent
could**, which is [rule 18](incomplete-input-program.md) from the usual
direction: the control was the guard.

`restraint-timer` took `3/14/2026` and answered with a face-to-face deadline of
`2026-03-14T06:00:00Z` — an hour after a **time of day nobody entered**, on a
clock that 42 CFR 482.13(e) counts in hours. That is
[rule 11](incomplete-input-program.md): a stated value is a fabricated
observation, not a silent zero. Its old refusal, for a genuinely absent
timestamp, was `restraint-timer: valid order timestamp required` — a
[spec-v1015](spec-v1015.md) stack-trace refusal that had survived that wave.

`bristol-girth` uses the interval as the denominator of the cm/h girth rate that
raises its abdominal-compartment-syndrome banner.

## The fix: one rule, in `lib/num.js`

`isRealYmd(y, mo, d)` counts the days in the month, leap years included, and
constructs nothing. `ymd(iso)` is the strict `YYYY-MM-DD` form of it, and
`localTimestamp(s)` is the same question for a moment in time — the shape
`datetime-local` produces, the calendar checked, the clock in range, and no zone
guessing (an offset-less string stays local, which is what the bedside reader
typed).

All four parsers now go through it:

| | before | now |
| --- | --- | --- |
| `lib/deadline.js` `parseIsoStrict` | round-tripped the `Date`; correct | same behaviour, shared rule |
| `lib/pa/date.js` `parseDate` | rolled over | `null`, which every caller already handles |
| `lib/clinical-v4.js` `parseISO` | rolled over | throws, in the reader's words |
| `lib/gaps-v185.js` `parseSeries` | rolled over, and dropped what it could not read | returns the bad line numbers |

`rosendaal-ttr` refuses rather than re-scoring, and names the line and its text:

> Could not read one line of the INR record — line 2 ("2026-02-30 2.5"). Enter
> one date and one INR per line, as "YYYY-MM-DD INR", using a real calendar
> date. Nothing is scored until every line reads, because a skipped line changes
> the time in range without saying so.

Refusing is the right side of [rule 12](incomplete-input-program.md) here: the
reader *typed* that line, so its absence is not what a normal record looks like.
A single-digit month is now read rather than skipped — dropping it was the bug,
not the leniency.

## What holds it

`test/unit/impossible-date.test.js`: the rule itself (every month length, 1900
and 2000 against 2024), then each of the six entry points, each pinned to the
number it used to give. The TTR cases carry the 80 / 88.3 / 65 from the table
above, so a regression is a changed percentage rather than a changed exception.

## Verification

`npm run lint`, `npm test`, `npm run test:mcp` and `npm run build` all green.
`audit-pa`'s 46 golden reports are unchanged, which is the check that `parseDate`
returning `null` for an impossible day moved nothing real.
