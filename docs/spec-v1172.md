# spec-v1172 — the clock the reader could not read

Five bedside timers take their timestamps from a `datetime-local` control. That
control emits **no UTC offset**: `2026-05-19T12:00` is a wall clock, the one on
the wall of the room. Each tile added its interval and wrote the result out with
`toISOString()`.

So a restraint ordered at noon printed, on the page:

> Next renewal: **2026-05-19T21:00:00.000Z**

The CMS renewal is four hours after noon — **16:00 on the reader's own clock**.
A nurse reading 21:00 renews five hours late on a clock 42 CFR 482.13(e) counts
in hours, and a late renewal is a survey deficiency.

**Every worked example on all five tiles uses the offset-less form**, so this was
what the page opened on, not an edge case an agent had to reach for.

| Tile | Entered | It printed | It meant |
| --- | --- | --- | --- |
| `restraint-timer` | order 12:00 | `2026-05-19T21:00:00.000Z` | 16:00 |
| `code-blue-clock` | code start 12:00 | `2026-05-19T17:08:00.000Z` | 12:08 |
| `ews-escalation` | vitals 14:00 | `2026-05-19T20:00:00.000Z` | 15:00 |
| `sepsis-bundle-clock` | T0 12:00 | `2026-05-19T18:00:00.000Z` | 13:00 |
| `device-day-counter` | insertion 08:00 | `2026-05-15T13:00:00.000Z` | 08:00 |

The ACLS one is the sharpest. During a resuscitation the next rhythm check is two
minutes away, and the tile gave it as an ISO-8601 instant with milliseconds, in a
timezone nobody in the room is using.

## Why the unit tests were green

They pass a **zoned** timestamp:

```js
const T = '2026-05-19T12:00:00Z';
assert.equal(r.nextRenewalIso, '2026-05-19T16:00:00.000Z');
```

Zone in, zone out — internally consistent, and correct. The defect is only on the
offset-less path, which is the only path the browser can produce and the only one
every worked example uses. **A test that supplies a fuller input than the control
can emit is testing a call the reader cannot make.**

## The rule

An instant in, an instant out; a wall clock in, the same wall clock out.

`parseStamp` ([spec-v1171](spec-v1171.md)'s strict parser, now returning
`{ date, zoned }`) already knew which it had been given; the flag was simply
thrown away. `stampOut(dt, zoned)` writes it back in the same frame, and
`wallClock(dt)` emits the exact shape a `datetime-local` control produces — so a
tile's answer round-trips back into its own input.

Every pre-existing test passes unchanged, because they all supply a zone.

## And the loose parse, on four more tiles

[spec-v1170](spec-v1170.md) fixed bare `new Date(x)` on `restraint-timer` and
`bristol-girth` and stopped there, because those were the two the probe had
named. `ews-escalation`, `sepsis-bundle-clock`, `code-blue-clock` and
`device-day-counter` read their timestamps the same way and were not looked at —
**the same defect, on the tiles next to the ones in the report.** All five now
parse strictly and refuse in the reader's words.

`ews-escalation`'s timestamp is optional, and the two cases are not the same: a
**blank** means no due time, and a timestamp that was entered and could not be
read is a gap. Dropping the second silently leaves the observation interval on
screen with no clock beside it and no sign that anything was ignored — a value
entered and discarded, which is the worse of the two failures.

## The test that sat beside it

`mcp-compute`'s worked call for this tile asserted:

```js
// The order-relative reassessment is 15 minutes after the order.
assert.match(rt.nextReassessIso, /:15:/);
```

`/:15:/` matches the old UTC rendering `2026-05-19T17:15:00.000Z` exactly as
happily as the `12:15` it meant. **A test written to check the minutes could not
see a four-hour error in the hours**, and it is the only test that fed this tile
the offset-less form the browser actually sends. It asserts the two times exactly
now.

That is also how the fix was caught: the loose regex depended on a trailing
seconds field the wall-clock form does not carry, so it failed on the shape while
having nothing to say about the value.

## Verification

`npm run release:check` green. `test/unit/bedside-clock-frame.test.js` pins each
tile to the wall-clock answer and to its instant answer, asserts that
`wallClock` round-trips through `parseStamp`, and asserts that **every worked
example on these five tiles is offset-less** — which is the fact that made this
reader-facing rather than theoretical. All five renderings were then read off the
page in a browser, not off the return value.
