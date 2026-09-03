# spec-v1008 — An example value the reader has not replaced is still ours

## The finding

Every tile with a worked example loads with that example in its fields and one sentence under the
answer: *"These are example values. Replace them with your own."*

That sentence was removed on the **first edit anywhere in the form**, on the reasoning written into
the code: *"after the first keystroke the values are theirs, not ours"*. That is true of the field
they touched and false of every field they did not.

The NIH Stroke Scale shows what it costs. Its 13 items are **range sliders**, so there is no empty
state to return one to and no way to say "not scored". A reader who scores their own patient's
motor leg as 3 is then shown:

> NIHSS total: 8 (Moderate stroke)

Five of those eight points belong to the example patient — level of consciousness 1, facial palsy
1, motor arm 2, language 1 — and the sentence that would have said so had just been removed by the
reader's own keystroke. The number reads as their patient's score. It is a score for a patient who
does not exist.

## Why this is not a new lesson

spec-v754 found exactly this mixing on the other prefill path: a question that arrived with three
of the reader's Wells criteria had four more topped up from the worked example and scored 6 instead
of 3. The fix there was to stop topping up a partly answered question. This is the same defect on
the path a reader takes **by hand**, and the pattern that was already right sits a few lines away
in the same file: `markAutofilled` marks each query-filled field and drops the mark **per field**,
because a field the reader has not touched is still not theirs.

## The fix

The sentence now tracks the example's own fields:

| State | What the reader sees |
| --- | --- |
| Nothing touched | *"These are example values. Replace them with your own."* |
| Some replaced, some not | *"4 fields below still hold example values, not yours. Replace them before reading the answer."* |
| All replaced | nothing — the values really are theirs |

A field counts as the reader's when its value no longer matches what the example put there, which
also makes the sentence immune to the example re-apply that `watchRestore` performs: a re-fill
dispatches input events, and events are no longer what the sentence listens to for meaning.

## Proof

- `test/integration/example-values-are-not-yours.spec.js` — scores one NIHSS item, asserts the
  total is 8 **and** that the form says four fields are still the example's; then replaces all four
  and asserts the sentence goes away and the total is the reader's 3. A second case covers the
  singular wording on `ich-score`.
- `test/integration/smoke.spec.js` already holds the untouched wording and the query-path case
  where no example hint may appear; both still pass.

## Scope

This is the wording and lifetime of one sentence. It does not change any calculation, and it does
not give sliders an empty state — a reader still cannot mark an NIHSS item unscored, and the 40
slider-rendered instruments in the catalog still start at a default. What changed is that a form
holding values from two different patients now says so.
