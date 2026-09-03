# spec-v1015 — Refusals written in the words of a stack trace

## The finding

The spec-v1014 sweep turned up something that was not the defect it was looking for. Dozens of
tiles refuse an implausible value **correctly** — and say so like this:

> weightKg out of range [0.3, 500]
> gcs: GCS must be 3-15
> temp out of range [20, 46]
> altUln out of range [1, 500]
> hct out of range [1, 70]

That is an exception message, printed into the answer region of a site whose whole product claim is
plain language. Every view wraps its renderer in a `safe()` that prints `err.message` where the
answer goes, so the developer's argument name and a bracketed interval are what a nurse reads when
a value is out of bounds.

The refusals themselves are right. Only the language was wrong.

## The fix

`num()` in `lib/num.js` is the single guard behind roughly 800 of these, and it now writes a
sentence:

| Before | After |
| --- | --- |
| `weightKg out of range [0.3, 500]` | `weight kg must be between 0.3 and 500. Check the value entered.` |
| `gcs must be a finite number` | `gcs must be a number.` |
| `deductibleRemainingCents out of range [0, Infinity]` | `deductible remaining cents must be at least 0. Check the value entered.` |

The name is the caller's argument name and there are **695 distinct ones**, so it is spaced at
camelCase boundaries rather than translated — `weightKg` becomes "weight kg". Imperfect for an
acronym (`scr` stays `scr`), never misleading, and the sentence around it now carries the meaning.
The reader also has spec-v1009's warning above the answer, which names the field by its own
on-screen label.

A further 67 hand-written messages across 17 libraries got the same spacing (`astUln must be
positive` → `ast uln must be positive`).

The thrown **types** are unchanged. The suites assert `RangeError` and `TypeError`, not the
wording, which is what made this safe to do at all.

## What it cost, and the two things worth writing down

- **A mechanical rewrite mangles units.** Spacing camelCase turned `mL/min` into `m L/min` and
  `mg/dL` into `mg/d L` in four messages. Found by grepping the diff for the unit fragments, not by
  a test — no test asserted those strings.
- **A test that asserts a message can assert the wrong half.** 22 unit tests matched the developer
  name verbatim (`/weightKg/`) and were updated to the readable form. One more — `/Dialysis/` on a
  message this spec never touched — was rewritten by the same script and had to be put back. A
  script that edits assertions must be checked against the messages that did **not** change.

## Left open

`safe()` still prints whatever an exception says. A library that throws prose written for a
developer will still reach the reader; this pass fixed the central guard and the messages it could
find, not the pattern. The stronger fix is for the view to catch and say something in its own
words, with the detail going to the console — worth doing when a tile's refusal needs to name a
field the way the label does.
