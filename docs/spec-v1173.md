# spec-v1173 — the exemption that answered half its own question

`clock-dependent-ledger.js` closes with the right question:

> A new tile on this list is a question, not a defect: is the clock what it
> measures, or has an example been left to rot?

**Those are two questions, and a tile can answer yes to both.**
`device-day-counter` was exempted on the first — *"device-days since insertion,
which is the measurement"*, which is true — and nobody asked the second. Its
worked example pins an insertion of 2026-05-15, so today the page reads:

> **Device-days: 117 d 0 h**
> Insertion: 2026-05-15T08:00
> No CDC SHEA 2014 indication checked: **remove Foley today.**
> Device-day 117: re-verify daily-removal criterion (CDC NHSN 2024 CAUTI Ch 7).

A 117-day Foley with a removal prompt is not a scenario anyone wrote. It is the
same defect [spec-v1018](spec-v1018.md) found on `code-blue-clock` — *"Code time:
154215.8 min"*, 107 days of CPR — and that wave fixed the neighbour and not this
one. [spec-v1172](spec-v1172.md) hit the same pattern from the other side: four
tiles left alone because the probe had only named two.

## The note, and what it deliberately does not claim

Unlike a resuscitation, **a long dwell is genuinely possible** — chronic
indwelling catheters and tunnelled lines exist — so this claims no clinical
implausibility and sets no threshold the sources do not carry. CDC NHSN publishes
no maximum dwell, and inventing one would be this project putting a number in a
guideline's mouth.

What the reader cannot see is where the number came from: the count moves every
day while the insertion time on screen does not. So that is what it says, past 30
days and only when counting to *now*:

> Counted to now: the insertion time entered is 117 days ago. Check it if that is
> not what you meant — the count moves with the clock, the insertion time does
> not.

A pinned `asOf` says nothing (it is not a reading from the clock), and an
ordinary dwell says nothing (it is the case the tile is for). The note leads,
above the count, for the reason [rule 14](incomplete-input-program.md) gives: the
headline is what gets read.

## Read at the same time, and left

All eight tiles on the ledger were rendered and read. Three open on a blown
deadline:

| Tile | Opens on |
| --- | --- |
| `appeal-deadline` | Past due by 117 day(s) as of today |
| `overpayment-60day` | Past due by 71 day(s) as of today |
| `pa-turnaround` | Past due by 93 day(s) as of today |

These are **not** the same defect, and the difference is worth writing down. Each
is arithmetically right, and each names the day it is speaking from — *"as of
today"* — which is the disclosure this programme asks for. What they cannot do is
avoid it: a static example date against a window of 120, 60 and 7 days rots by
construction, and `pa-turnaround`'s rots within a week of whatever date anyone
picks. Moving the dates buys 7 to 120 days and changes nothing else.

`timely-filing` reads *"173 day(s) remaining"* only because its window is 365
days. It is the same tile with more runway, not a better-behaved one — which is
the clearest evidence that the example date is not what distinguishes these from
`device-day-counter`. What distinguishes `device-day-counter` is that it said
nothing at all.

`due-date` and `preg-dating` already carry their spec-v1018 notes and read
correctly.

## Verification

`npm run release:check` green. `test/unit/device-day-counter.test.js` covers the
note firing on a long dwell counted to now, and staying silent for a pinned
`asOf` and an ordinary dwell. The rendering was read off the page in a browser,
before and after.
