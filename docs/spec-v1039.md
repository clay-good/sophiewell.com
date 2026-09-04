# spec-v1039 — The gate almost learned to ignore its own defect

## What happened

`required-field-agreement.spec.js` skips a reading that contains **asking language** — "enter a
weight", "choose a severity" — because a tile that asks is not a tile that answered. While draining
the ledger in spec-v1038 I extended that list, and one of the additions was **`not reached`**.

It came from `hys-law`, which with a blank bilirubin reads:

> One lab criterion is not met: the bilirubin threshold. **The rule is not reached.**

That is not asking. It is the exact defect this sweep exists to catch — a criterion nobody measured,
reported as one that was not met, in the same words the tile uses when a real bilirubin comes back
below the threshold. Adding the phrase would have exempted every tile that phrases a rule-out that
way, silently, for as long as the string stayed in the list.

`docs/gate-self-review.md` says a gate that reports clean while its defect is present is worse than
no gate. This is the mechanism by which that happens in practice: **the exemption list grows toward
whatever the offending tiles happen to say.**

## The correction

`not reached` is out, with a comment saying why so it does not come back. The bare word `rate ` is
also out — it was there for the rating tiles ("Rate vascularity on the 1-10 scale") and would have
swallowed any tile printing "heart rate 80". It is now the pattern
`(?:rate|score) <words> (from|on the) <digit>`, which matches the ask and not the measurement.

## Ledger correction

Re-running the sweep with the ledger ignored showed eight lines that no longer correspond to
anything: `abc-scale`, `arc-hbr`, `ascvd`, `cows`, `posas-observer-scar`, `posas-patient-scar`,
`prevent`, `rudas`. Each was seeded before the asking-list recognised its refusal, so each was a
tile exempted from the gate for no reason. They are removed.

One went the other way: `oxytocin-titration` converts in both directions, and after spec-v1038 it
prints only the direction it has a number for — which the sweep sees as an answer, correctly. It
gets a ledger line saying so.

51 → 44, and every remaining line now corresponds to a reading the sweep actually produces.

## The rule

**Before adding a phrase to a gate's exemption list, check which of the tiles it currently flags
would stop being flagged.** If the answer includes one you have not looked at, the phrase is doing
more than you think.
