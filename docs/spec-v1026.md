# spec-v1026 — The gate was reading tiles before they had finished answering

## Why this was looked at

spec-v1025 fixed four tiles that were still listed in the empty-form ledger as tiles that answer.
A ledger keeps its meaning only while every line is still true, so the obvious move was to make the
sweep fail on a line that has gone stale.

Building that check found something more important about the sweep itself.

## The finding

The sweep cleared a tile's fields, waited **25 ms**, and read the result region. A tile that
computes behind an `await` — a picklist arriving from a data shard, a lazily imported module — had
not finished, so the sweep read a half-rendered region and reached a verdict from it.

Two runs of the same commit disagreed about four tiles. Probed directly, all four answer stably;
the disagreement was the sweep's, not theirs.

That is the failure mode this repo already has a rule about: **a gate that reports clean while the
defect is present is worse than no gate** — and one that reports differently on two runs of the same
commit is the same defect wearing a different hat, because the first red run teaches everyone to
re-run it.

## What shipped

- **120 ms, not 25.** Three consecutive runs of the full sweep now agree.
- **"outstanding" joins the words a refusal uses.** Eleven libraries phrase one as *"not met —
  outstanding: the age; at least 4 months of amenorrhea"*, and at 25 ms the sweep had been reading
  those tiles before that sentence existed. With the longer settle it saw them and, not knowing the
  word, called them answers.
- **Nine stale ledger lines removed** — every one a tile fixed between spec-v1013 and spec-v1025
  whose line nobody went back to delete. They were exempt from the gate that was meant to protect
  them; they are now covered.

## What did not ship, and why

The stale-line check itself. It has to distinguish "this tile no longer answers" from "this tile did
not answer *yet*", and at any settle time the second is a race. With the check in place the sweep
reported `midas` on one run and `sea-guideline` on the next, on an unchanged commit.

Shipping it would have meant adding a flaky gate in the same week as writing that a flaky gate is
worse than none. The nine stale lines are removed by hand instead, and the way to find them again is
recorded here: run the sweep, and read which ledger ids never produced an answering reading.

## Proof

Three consecutive runs of the four-shard sweep pass, at 33 seconds each. The ledger is nine lines
shorter and every removed id is covered by a named test from its own spec.
