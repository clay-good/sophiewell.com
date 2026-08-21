# spec-v769 — a prefill must never blank the field it was aiming at

## What was wrong

Assigning a `<select>` a value none of its options carries does not fail and does
not fall back. It deselects **every** option, and the field reads empty.

`helsinki-ct-score` renders "Mass lesion type" as a select of `0 / 2 / -3`. The
field registry describes it as a plain number, because that is what the
calculator's argument is. So "helsinki ct score mass lesion type 5" put a 5 into
a select that has no 5 — the field went blank, the reader's stated value was
discarded, and the tile printed a Helsinki score anyway, computed from an empty
string. Nothing on screen said any of that had happened.

This is the failure the prefill was built to avoid: a wrong prefill is worse than
no prefill, and a blank field that still produces a number is the worst version
of it — it looks answered.

Both write paths had it: `applyHashState` (the shard path, and every shared deep
link) and `fillFromDom` (the no-shard fallback).

## What it does now

Neither path assigns a select a value it cannot hold. The field keeps its own
default, which is visible, editable, and carries no "from your question" caption
claiming otherwise. The value that could not land moves from *filled* to
*missing*, so the ask card asks for it rather than the reader discovering a
silently dropped number.

## What counts as unanswered

An unticked checkbox and a select showing its first option are **answered**. Both
carry a value, both are visible, and neither claims to have come from the
reader's question. `qbl-pph` marks "Vaginal birth" required and unticked means a
caesarean — a real answer, not a gap. Only an empty text or number input, or a
select with no option selected, is genuinely unanswered.

## Proof

`test/integration/partial-answer-safety.spec.js` states the values a tile's
required *numeric* fields want, leaves everything else unsaid, and asserts the
reader never sees a confident number while a required input is genuinely unset
and nothing is asking. `PARTIAL_SAMPLE` sets the breadth; the default is 40.
