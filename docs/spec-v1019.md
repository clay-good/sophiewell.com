# spec-v1019 — Nothing stopped the next calculator from doing it again

## The finding

spec-v1006 through spec-v1018 fixed thirty-odd tiles that answered a form with nothing in it, one
judgment at a time, and every fix is pinned by a named test.

None of that stops the next calculator. Those tests name the tiles they fixed, and a tile that does
not exist yet is in no list — so the whole program protects the past and nothing else. That is the
shape the house has a rule about: **a gate that reports clean while the defect is present is worse
than no gate**, and a rule with no gate is a rule until the next contributor.

## The gate

`test/integration/no-answer-from-nothing-sweep.spec.js` asks the question of the whole catalog. For
every tile it clears every number field, text field and textarea — the way a reader does before
typing their own values — and fails on any tile that still produces a reading.

Sharded four ways like `example-correctness`, for the same reason: the serial loop over 1,704 tiles
is long enough to fight a timeout, and `fullyParallel` turns four shards into about a quarter of the
wall clock. **15 seconds** for the catalog.

A tile counts as *asking* rather than answering if its output uses any of the words a refusal uses
— "enter", "choose", "missing", "must be", "not scored", "blank". A refusal that says none of them
is a refusal the reader cannot act on, which is its own defect (spec-v1015).

## The ledger

`test/integration/empty-form-ledger.js` carries the 95 tiles that still answer, seeded from the
sweep the previous specs worked through. It is a **debt ledger, not a list of approvals**, and its
header says so.

The great majority are legitimate: a checklist instrument nobody has ticked really does score 0 —
the Edmonton symptom assessment, the Roland-Morris, the Groningen frailty indicator — and a timer
or a document generator has nothing to measure from a number field at all.

Removing a line is a fix and needs nothing. **Adding** one needs a sentence in the pull request
saying which of the two cases it is: a criterion the clinician answered "no" to, or a measurement
nobody took. The failure message asks that question directly, with the reading the tile produced.

## Verified both ways

With `esas-symptom-assessment` taken out of the ledger the sweep fails and names it, with the
sentence it printed. Restored, it passes. That is the only way to know a gate is doing anything.

## What it does not cover

The sweep asks whether a tile answers an **empty** form. It says nothing about the likelier case —
a form with one value in it, which is where `lrinec` said "low risk" from a single CRP (spec-v1006).
Checking that means knowing which single value each tile would be given, and that is a per-tile
judgment rather than a sweep.
