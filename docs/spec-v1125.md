# spec-v1125 — the open question from four days ago, answered

[spec-v1124](spec-v1124.md) fixed SCORAD's six intensity selects and gave it its
own copy of the shared `SEV4` option list rather than changing the list, because
PASI and EASI read `''` as `0` and **had not been measured**. It recorded them as
the open question instead of guessing.

They have it. In twelve items and sixteen.

## The footing was there, and keyed on the wrong thing

Both tiles already carry a `regionFooting` — [spec-v1092](spec-v1092.md)'s work
— and both compute it from whether each region's **area** was entered:

```js
if (!anyEntered(o, [r.key + 'Area'])) pasiMissing.push(r.label);
```

So with the four areas entered and the twelve intensity selects left where they
open — on `"0"` — `pasiMissing` is empty, the footing is `null`, and the tile
reads:

> PASI 0/72 — **mild** psoriasis (< 10).

PASI is the usual gate for systemic and biologic therapy, and **mild against
moderate (≥ 10) is which side of that gate a patient is on**. Twelve ungraded
signs, and the tile that already knew how to say *"scored from 3 of 4 regions"*
said nothing.

The denominator is now every gradable slot: four areas plus their intensity
items, sixteen for PASI and twenty for EASI.

## And the shared list, on the second pass

With all three consumers footing their intensity items, the blank option goes
into `SEV4` itself and SCORAD's private copy is gone.

That is what [spec-v1110](spec-v1110.md)'s *"a shared control is a shared
decision"* is for, done in the order that keeps it true: **measure the other
consumers, then change the shared thing.** spec-v1124 could have added the blank
to `SEV4` in one line four days ago and would have handed PASI's and EASI's
readers a way to reach a defect the browser was hiding — the fix and the
regression in the same edit.

The private copy was the right call at the time and the wrong thing to leave
behind. **A deferral is only honest if something comes back for it.**
