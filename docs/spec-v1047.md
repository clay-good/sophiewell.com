# spec-v1047 — The sibling that needed a different control

`ciwa` and `cows` were fixed in spec-v1028: both opened already scored, saying "mild withdrawal" and
"no active withdrawal" before anyone had rated anything. **WAT-1 is the paediatric version of the
same instrument**, it had the same defect, and it kept it for nineteen more specs.

> WAT-1 0 of 12: **no significant withdrawal** per Franck 2008

That is the reading a bedside nurse uses to leave an opioid or benzodiazepine wean where it is, and
a child nobody had assessed produced it.

## Why it was left

CIWA and COWS render their items as number inputs, so the fix was a placeholder and a null-aware
read. WAT-1's ten items were **sliders**. A slider cannot be blank — it sits at its minimum and
looks exactly like a rating somebody made — so no amount of null checking in the library could have
fixed it. spec-v1029 recorded that and moved on, which was the right call then and would have been
the wrong one to leave standing.

## The fix

The ten items are now number inputs with a `0` placeholder, the same control its two siblings use.
The library treats an unrated item as absent rather than as a zero, and applies the monotone rule:
below the threshold it says what is outstanding —

> WAT-1 is at least 0 from 0 of 10 items (the recovery time is not entered either). Rate the
> remaining 11: each can only add points, so a partial score cannot support the no-withdrawal
> reading per Franck 2008 (>=3 indicates withdrawal).

— and at or above it, it answers and states its footing: *"Scored from 3 of 10 items; the rest can
only raise it."*

## The ledger is now all category 3

`required-field-ledger.js` holds 15, and none of them describes a defect any more. WAT-1 keeps a
line, but a different one: with one item cleared it now reads *"WAT-1 4 of 12: iatrogenic withdrawal
present … Scored from 9 of 10 items"* — the rule-in direction on a monotone scale, stated with its
own footing, which is exactly why CIWA is on that list. It moved from "blocked on a control change"
to "answers about what was entered, and says so".

What remains is seven sums over things that are present or absent, six partial scores that state
their footing, a one-way conversion, and a modifier ordering.

Seventy-five tiles answered without a required field when spec-v1037 measured it. Sixty-one are
fixed.

## The rule this one adds

**A control that cannot express "not answered" will be read as an answer.** Where the value matters,
the control has to be able to be empty — which is a design constraint on the input, not only a
guard on the reader.
