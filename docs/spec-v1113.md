# spec-v1113 — the denominator was computed and never shown

The top of `probe-omitted-item.mjs`'s remaining backlog is five questionnaires —
`pfiq7` (21 fields), `pfdi20` (20), `cbi` (19), `fabq` (11), `oswestry-odi` (10):
**81 of its 226 rows.** They are flagged because dropping one item moves the
score without the tile saying so.

For four of the five that is exactly right. For the fifth it is a false positive,
and the difference between them is the whole spec.

## The mean is correct; the silence is not

These are **mean-scored** instruments. Each subscale is the average of the items
that were answered, which is the published rule — so the score moving when an
item is dropped is the instrument working, not a bug. Rule 10 is the one that
applies: *a sum and a mean fail differently.*

But a mean of two items and a mean of seven print identically. Each of these
tiles **computed the denominator, stored it in an `answered` field, and never
rendered it**:

```
pfiq7 → { uiq: 33.33, answered: { uiq: 2, craiq: 7, popiq: 7 } }
        "UIQ-7 33.33 of 100"
```

`oswestry-odi` is the exception, and it is what the other four should have looked
like all along:

> Raw 27 of 45 across **9 answered sections**.

So the fix is not arithmetic. Each of the four now leads its detail line with the
denominator, and says nothing when every scale is complete:

> **Scored from UIQ-7 over 6 of its 7 items, CRAIQ-7 over 6 of its 7 items.**
> Each scale is the mean of its answered items multiplied by 100 divided by 3 …

This is [spec-v1044](spec-v1044.md)'s rule — *a rating scale must say how many
items it scored* — on four tiles that already had the number to hand.

`cbi` is the closest of the four to right already: it refuses a scale below three
answered items (four on the work scale) with *"too few items answered"*. What it
did not say is the denominator of the scales it **does** report — and three, the
minimum it accepts, printed exactly like six.

## `fabq` is not a mean, and needed more than a count

FABQ is a **sum**: physical activity is items 2, 3, 4, 5 out of 24; work is seven
items out of 42. So a subscale missing an item is not an average over fewer
items — it is a **floor**, and *"physical activity 16 of 24"* over three of its
four items understates by up to six.

It already computed `complete: { physicalActivity: false, work: true }` for
exactly this and printed neither flag. It now reads:

> FABQ — physical activity **at least 12 of 24 over 3 of its 4 items**, work 28
> of 42.

The complete subscale is left alone, and an unanswered item among the **five that
count toward neither subscale** does not make anything partial.

Rule 13 exempts nothing here: the 1993 source publishes no cutoff, so there is no
alarming band a missing item could already have reached. Every partial subscale
is a floor and says so.

## What the probe was telling us

The four were invisible to every gate in this programme because they **refuse an
empty call** — `"Answer at least one UIQ-7 question"` — which satisfies the
empty-form sweep, and because their disclosure lived in a structured field the
prose-matching `DISCLOSING` vocabulary never sees.

That is worth stating on its own: **disclosing in data is not disclosing.** A
count in the returned object is available to an agent that thinks to look and to
nobody reading the page. The rule the programme has been applying — say what you
scored over — is about the sentence, not the payload.

`oswestry-odi` stays flagged by the probe and is correct; it is recorded here
rather than in a ledger, since the probe asserts nothing.
