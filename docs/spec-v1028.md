# spec-v1028 — The two withdrawal scales opened already scored

## The defect

CIWA-Ar and COWS are the scales that time a medication. A symptom-triggered alcohol-withdrawal
protocol gives a benzodiazepine when CIWA-Ar reaches 8; a buprenorphine induction waits for COWS to
reach 5. Both tiles rendered their items with `value: '0'`, so opening either one showed a completed
assessment nobody had performed:

| Tile | What an untouched form said |
| --- | --- |
| `ciwa-ar` | `CIWA-Ar: 0 — Mild withdrawal (<8): supportive care` |
| `cows` | `COWS: 0 — No active withdrawal` |

Both sentences are instructions to *withhold*. A prefilled zero is not a rating of "no tremor"; it
is the absence of a rating, and these scales are observations — a nurse looks at the patient and
scores each item. Nothing had been observed.

## The fix

`ciwaAr` and `cows` in `lib/scoring-v4.js` now take undefined defaults and count their unrated
items. Below the treatment threshold they refuse the reassuring band and say what is outstanding:

> CIWA-Ar is at least 3 from 2 of 10 items. Rate the remaining 8: each can only add points, so a
> partial score cannot support the mild-withdrawal reading.

Above it they answer, and note the footing they answered on — "Scored from 6 of 10 items; the rest
can only raise it." This is the monotone-score rule from `docs/incomplete-input-program.md`: every
item adds points or leaves them alone, so a partial total is a **lower bound**, safe to rule in and
never to rule out.

`views/group-g.js` renders `placeholder: '0'` in place of `value: '0'` and reads with `nvOrNull`, so
a field the reader never touched stays empty on screen as well as in the arithmetic.

## The tests that asserted the defect

Three unit tests pinned the old behavior — `ciwaAr({})` was expected to read *Mild*, `cows({})` to
read *No active withdrawal*. That is the third time in this program a defect was written down as an
expectation (spec-v1007, spec-v1016). They now assert the rule instead, and a fully rated calm
patient — all ten or eleven items explicitly scored zero — still reads mild and still reads no
active withdrawal. The distinction the tile now draws is exactly the one those tests could not see:
**rated zero is not unrated**.
