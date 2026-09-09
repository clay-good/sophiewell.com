# spec-v1163 — the band said "not entered" and the row beneath it said "not met"

The first of the two rows [spec-v1162](spec-v1162.md) left to read.

## One screen, contradicting itself

`tls-cairo-bishop` had already been taught to disclose. Clear enough labs and its
band reads:

> Laboratory TLS is not met **by what has been entered** (1 of 2 criteria assessed;
> 2 are required). **Not entered: potassium, phosphate.**

Which is right. And directly underneath it, on the same screen:

```
Potassium ≥ 6 (or +25%):  not met
```

The band says the potassium was not entered; the row says the criterion failed. A
*"not met"* for a lab nobody ran is a fabricated observation (rule 11), and the
contradiction is worse than either statement alone — a reader who scans the rows
rather than the band gets the wrong one.

`criteria` is tri-state now: `true` met, `false` not met, **`null` not measured**,
rendered as *"not entered"*. A criterion reached through the 25%-rise baseline
counts as assessed, because that is a real reading.

## And the denominator moved with it

```
Metabolic criteria met: 3 of 4
```

read as three met and one **ruled out**. It is *"3 of the 3 assessed (of 4)"*.

## What did not change

The arithmetic. `metCount` and `labTls` are computed from the same booleans as
before — Cairo-Bishop needs 2 or more criteria, so a missing lab leaves the count a
floor that can rule in and never out, which the band already said. The booleans the
arithmetic used are exposed separately as `criteriaMet`, so nothing downstream has
to re-derive "met" from a tri-state.

## The other row

`mtp-tracker` was the second, and it stands. A blank platelet count becoming *"0
units transfused"* looks like the same shape, but the tile is a **running tally of
products given**, not a measurement of the patient — zero given is the state every
massive transfusion protocol starts in, and the reader fills it up as products go.
Rule 4 in a different costume: this is a count of things done, not an observation
withheld.
