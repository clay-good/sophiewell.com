# spec-v1196 — the gates learn the movement rule

[spec-v1193](spec-v1193.md) found the hole and built the finder;
[spec-v1194](spec-v1194.md) and [spec-v1195](spec-v1195.md) emptied it from
seventeen rows to six by fixing tiles and teaching the vocabulary two phrasings
it did not know. This is the change the whole run was for: **the gates now ask
the finder's question.**

## The rule

`test/lib/asking-language.js` has said since [spec-v1056](spec-v1056.md) that a
phrase is matched against the whole reading. What it never said is where the
words come from. A tile carries standing explanatory notes, an option label read
back, a formula written out — text that is the same whatever was entered — and
any of it can contain a phrase from the list.

Where a sweep starts from a complete worked example and clears **one** field, it
has a before-reading, and:

> a sentence identical in both cannot be a statement about the field that was
> dropped, because it was written before anyone left anything out.

So the vocabulary is matched against what the reading **added**. Two new exports,
`addedText` and `ownsTheGap`, and one copy of the rule — the browser sweep gets
it through `page.exposeFunction` rather than restating it in the page.

**Nothing added means nothing to check.** A reading that only *loses* a sentence
has fabricated nothing: every sentence still on screen was true with the field
present. `constrictive-pericarditis-echo` is that case — clearing the lateral
annular velocity drops one educational note about annulus reversus and moves no
criterion, because that velocity is not one of the three.

## Where it applies, and where it must not

| gate | starts from | movement rule |
|---|---|---|
| `one-blank-field.spec.js` | the worked example, one field cleared | **yes** |
| `required-field-agreement.spec.js` | the worked example, one required field cleared | **yes** |
| `scoring-select-probe.spec.js` | the worked example, one select dropped | **yes** |
| `no-answer-from-nothing-sweep.spec.js` | an empty form | no |
| `rated-items-are-required.test.js` | an empty form | no |

The last two are the same split `asking-language.js` already draws for
`DISCLOSING`: with nothing entered there is no before-reading to compare
against, and nothing to disclose about. `refusedOrDisclosed(text)` keeps its old
one-argument behaviour for exactly those callers.

## Two phrasings, arriving with the rule and not before it

`no <thing> is/was entered|recorded` (13 uses across `lib/`) and `what was
entered` (19) close four of the six rows the finder still printed — "No
first-tier result is entered", "no qualifying urine culture is recorded", "No
LCBI is met by what was entered".

[spec-v1195](spec-v1195.md) measured them and deliberately left them out, because
two of the three rows they move are `sea-guideline`, exempted by

> **No fever was entered**

while the field the sweep dropped was the **ESR** and then the **white cell
count**. Added alone they buy two false exemptions to fix four true ones. Added
with the movement rule they buy none: that sentence is in the reading whether or
not the ESR is dropped, so it is static prose about this row and the rule ignores
it.

## What the stricter gate found

Across the whole catalog, on every required field of every tile, tightening the
question produced **one** new offender — and it is real.

`breach-clock` computes the HIPAA breach-notification deadlines. `Number('')` is
0, so a blank affected count read as a breach affecting **nobody**:

```
Affected: 0 (<500 individuals: annual log to HHS)
HHS notice deadline: 2027-03-01
```

Zero is under 500, and 500 is the line: at or above it the media and HHS are
notified inside the same 60 days as the individuals; below it HHS is told through
next year's annual log. A count nobody had taken picked the slower route and
printed a date ten months later.

`lib/regulatory.js` has always refused a non-number — `affectedIndividuals must
be a non-negative integer`. Only the browser coerced one. A zero someone actually
types is a real count and still answers.

## `diabetes-diagnosis`

The other tile the tightened gate reached, and a smaller thing. It was honest
about having one result —

> Meets a diabetes threshold, not yet confirmed — an A1C of 7.2 percent, **a
> single abnormal result**

— and never said what the other three tests were, so a reader could not tell
whether the fasting glucose was normal or simply not drawn. The same sentence
carried the reassuring branch ("no value in the prediabetes or diabetes range").
Both now name the tests not entered, and say that the second result the Standards
ask for can come from any of them.

## Proof

`probe-static-exemption` reads **17 → 2** rows across the four waves, and neither
survivor is a gate hole any more: both are vocabulary-matching-prose collisions
that the movement rule now ignores. Lint, 13,480 unit tests, 448 MCP tests and
the four browser sweeps pass — `required-field-agreement` cleared 550 of 1,121
declared required fields on its widest shard with the stricter question and found
nothing but `breach-clock`.

Four unit tests pin the rule itself, including the two cases that are easy to get
backwards: static prose must **not** buy an exemption, and a pure removal must.
