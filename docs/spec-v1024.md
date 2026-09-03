# spec-v1024 — An answer that changes with the clock, from inputs that did not

## The finding

spec-v1018 found four readings that had drifted away from the examples that pin their dates: a
due-date tool reporting *"gestational age: 87 weeks"*, a code clock reporting 107 days of CPR, and a
pregnancy-dating comparison whose 172-day discordance was an artifact of how long ago the example
was written. Its closing line said what was missing: **those were found by eye, and nothing fails
when a new one is added.**

This is that check, and it is cheap because Playwright can lie about the time. Every tile is
rendered, nudged into recomputing, read; the clock is moved a year forward; the tile is nudged again
and read again — with its inputs untouched in between. A tile whose output differs is measuring
time.

## What the catalog actually does

**Eight tiles, out of 1,704.** All eight are accounted for:

| Tile | Why it moves |
| --- | --- |
| `appeal-deadline`, `timely-filing`, `pa-turnaround`, `overpayment-60day` | a filing or decision window counting down — that *is* the tool |
| `device-day-counter` | device-days since insertion, which is the measurement |
| `due-date`, `preg-dating`, `code-blue-clock` | spec-v1018 made these **say** they depend on the clock (*"the LMP entered is 87 weeks ago"*) instead of quietly answering from it |

The ledger beside the test carries all eight with those reasons. A new entry is a question rather
than a defect: is the clock what this measures, or has an example been left to rot?

## One thing worth knowing about the sweep

Navigating to a tile again does **not** re-render it, so moving the clock and reloading proves
nothing — the first version of this sweep found zero differences for exactly that reason, including
on the tiles spec-v1018 had just fixed. The tile has to be nudged with an input event after the
clock moves. A sweep that reports clean because it never triggered the code is the failure mode this
repo keeps a note about.

## Proof

Four shards, **1.3 minutes** for the catalog. Verified both ways: with `timely-filing` removed from
the ledger the sweep fails and names it, with both readings printed; restored, it passes.
