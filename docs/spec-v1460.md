# spec-v1460 — HINTS: a blank step is not a reassuring step

Found with a probe written after [spec-v1459](spec-v1459.md): for every optional select field an
agent can leave out, compare the answer with the field blank to the answer under each option. A
blank that silently gives the same answer as exactly one option, with nothing on screen saying so,
is a default posing as a finding. 51 fields matched; this is the one that did the most harm.

## What was wrong

A peripheral (benign) HINTS pattern needs all three bedside steps reassuring together: an abnormal
head impulse, direction-fixed nystagmus and no skew. The tool treated any step that was not
entered as reassuring. An agent sending only `headImpulse: "abnormal"` (the one required input) got
**"a peripheral (benign) pattern -- an abnormal head impulse, direction-fixed nystagmus, no skew,
and no new hearing loss"**, which describes two findings nobody examined. On the page, the three
selects had no blank option, so the form opened with every step already set to its peripheral
choice. A unit test pinned this behavior, asserting that an empty input returned "a valid
Peripheral default".

## The fix

- Any one central feature is still enough to call the pattern central, whatever else is blank.
- If there is no central feature and any of the three steps is blank, the tool asks for the missing
  ones: "Choose the test of skew: no central feature was entered, and a peripheral pattern needs all
  three steps reassuring."
- The page's three selects open on "— choose —", and the page shows the tool's question in place of
  an answer.

The worked example (a normal head impulse, which is central) is unchanged.

## Tests

`test/unit/hints.test.js`: a non-object input asks for all three steps; two peripheral findings and
a blank ask for the third; each central feature alone still reads central. The test that asserted
the peripheral default was rewritten to assert the question.
