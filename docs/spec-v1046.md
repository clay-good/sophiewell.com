# spec-v1046 — Money from a blank field, and a note that fooled the gate

## The two billing tiles

`rvu-payment` multiplies each RVU component by its geographic index and a conversion factor to
produce a dollar allowance. A component left blank was counted as **0 RVUs** — correct for a code
that genuinely carries none, wrong for one nobody filled in, and the difference is a figure on a
claim. Clearing just the work RVU still produced "Non-facility allowed: $53.37".

`cob-calc` reads the billed charge as **$0** when it is blank. Under the lesser-of method that
charge caps what the secondary pays, so a blank one makes the patient's residual look smaller than
it is.

Both now ask. The rule is the program's first one, applied to money: **a typed 0 still means zero**,
and that is how you say a code carries no malpractice RVU.

## The note that fooled the gate

My first attempt at `rvu-payment` kept the answer and added a line beneath it:

> the work RVU is blank and was counted as 0 RVUs. **Enter** 0 to say the code carries none…

The sweep stopped flagging the tile — because its asking-list matches the word *"enter"*, and the
note contained it. The tile still printed a dollar allowance computed from a blank field.

This is spec-v1039 arriving from the other side. There, the danger was *adding a phrase to the
exemption list* that a defective tile happened to use. Here it was *adding the exemption's phrase to
a defective tile* — same hole, entered from the tile end rather than the list end, and this time by
me, in the same session that wrote the warning.

**A gate that recognises refusals by their words can be satisfied by a tile that says the words and
answers anyway.** The fix is not to soften the gate; it is to make the tile actually refuse, which
is what it now does.

Ledger: 18 → 15, and `corrected-ca-na` leaves it too — spec-v1045 removed the `required` flags that
put it there, so there is no longer a required field for the sweep to clear.

## What remains

Fifteen lines, all category 3: seven sums over things that are present or absent, five partial
scores that state their own footing, a one-way conversion, a modifier ordering, and WAT-1 — the only
one still blocked, on a control change its sliders need.
