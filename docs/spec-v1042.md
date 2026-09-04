# spec-v1042 — The instrument that is one number

Five more from the required-field ledger, in two shapes.

## A scale whose whole instrument is a single count

`groningen-frailty-indicator`, `rivermead-mobility-index` and `roland-morris-disability` each take
one field: *how many items were positive*. `Number('')` is 0, so an untouched form scored zero items
and the tile answered:

> Groningen Frailty Indicator **0 of 15 — not frail (< 4)**
> Roland-Morris **0 of 24** — no disability
> Rivermead Mobility Index **0 of 15** — which on that scale is the worst mobility there is

The last one is worth noticing: the same blank produces the reassuring end of two scales and the
alarming end of the third, purely because of which direction each runs. Neither is a reading. Each
now asks for the count, in the words on its own label — *"a count nobody has taken is not a count of
none."*

## A partial total that ruled out

`niss` squares the three worst AIS severities. With two entered it printed the sum of those two
beside **"Major trauma: no"** — a lower bound presented as a verdict. It now reads "NISS at least
13" and "Major trauma: not yet determined", and it still says **yes** as soon as the entered values
reach 16, because the score only rises.

## And the trap again, in the gynaecology module

`popq-staging` refuses unless all five prolapse points are entered. It was not refusing, because its
`fin()` helper is `Number.isFinite(Number(v)) ? … : null` and **`Number(null)` is 0** — and 0 cm is
a real POP-Q measurement, the hymen itself. So an unmeasured point was placed exactly at the hymen
and the prolapse was staged from it.

That is the third module to lose a working guard this way (`hacor` and `lis-murray` in spec-v1040
and spec-v1041). The pattern in `scripts/probe-blank-coercions.mjs` finds these; what it cannot tell
you is which ones a renderer actually feeds `null` to, which is why the gate that catches them is
the outside one.

Ledger: 34 → 29.
