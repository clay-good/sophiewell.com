# spec-v885 — NIOSH lifting equation

## What this gives you

The recommended weight limit and the lifting index — and the three things a lifting index is not.

## §1 The equation

`RWL = 51 lb × HM × VM × DM × AM × FM × CM`

| Multiplier | From |
|---|---|
| HM | 10 / horizontal distance (ankles to hands), inches |
| VM | 1 − 0.0075 × abs(vertical height − 30), inches |
| DM | 0.82 + 1.8 / vertical travel distance, inches |
| AM | 1 − 0.0032 × asymmetry angle, degrees |
| FM | published frequency table, by lifts per minute, duration, and vertical band |
| CM | published coupling table, by grip quality and vertical band |

`Lifting index = load weight / RWL`.

## §2 The lifting index is a design number, not a prediction about a person

This is why the tile exists. Above 1.0 says the task exceeds what the equation recommends for
most healthy workers. It does not say this worker will be injured, and at or below 1.0 does not
say that nobody will be. On every result.

## §3 A limit of zero means "outside the equation", not "lift nothing"

A horizontal distance above 25 inches, a vertical height above 70, or an asymmetry angle above
135 degrees each set their multiplier to zero by the published rules, which drives the whole
limit to zero. The tile names which measurement did it and says plainly what that means.

## §4 It covers two-handed, smooth, unhurried lifts only

Carrying, pushing, pulling, one-handed lifts, lifting while seated or kneeling, lifting in a
constrained space, unstable loads, poor footing and hot or humid conditions are all outside it —
and the equation gives **no signal of its own** when they apply. On every result.

## §5 The frequency table is not flat

The two vertical bands are identical up to 8 lifts per minute and **diverge above it**: at 13
lifts per minute in a short-duration task the multiplier is 0.34 with the hands at or above 30
inches and 0.00 below. Eleven published spot-checks across all three durations and both bands are
asserted in `test/unit/niosh-lifting.test.js`, along with the worked example from the applications
manual.

## §6 Sourcing (spec-v97 gate)

- Waters TR, Putz-Anderson V, Garg A, Fine LJ. *Revised NIOSH equation for the design and
  evaluation of manual lifting tasks.* Ergonomics. 1993;36(7):749-776.
- Waters TR, Putz-Anderson V, Garg A. *Applications Manual for the Revised NIOSH Lifting
  Equation.* DHHS (NIOSH) Publication No. 94-110; 1994.

The citation names NIOSH under the CDC issuer-acronym pattern, so a `docs/citation-staleness.md`
row is owed and added.

## §7 Posture

Decision support, not a verdict. It computes a published equation from measurements already
taken. It does not decide whether a task is safe for a particular person.

Catalog 1675 → 1676.
