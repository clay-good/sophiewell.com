# spec-v863 — CDC Blood Lead Reference Value

## What this gives you

A blood lead result read against the value that is current, with the band the old one hides
called out by name.

## §1 The value

| Micrograms per deciliter | |
|---|---|
| Under 3.5 | Below the reference value |
| 3.5 and above | At or above it — find and remove the source |
| 45 and above | The level at which chelation is considered |
| 70 and above | A medical emergency |

## §2 It is 3.5, not 5

This is why the tile exists. The reference value was lowered from 5 in 2021. A result read
against the old line leaves every child between 3.5 and 5 looking normal, and that whole band is
what the change was made to find. When a result lands in it, the tile says so and says what the
old line would have called it.

## §3 It is not a safe level, and not a treatment threshold

Stated on every result. The reference value is the 97.5th percentile of the blood lead
distribution among young children in the United States — a statistical marker for identifying
the children with more exposure than most. No level of lead in blood is known to be without
effect.

At or above it the response is to find and remove the source, not to give a drug. Chelation
belongs to a different number, and that decision is made with a specialist rather than from a
threshold.

A result below the value is returned as "below the value", never as "no exposure".

## §4 A capillary result is not a diagnosis

Lead on the skin contaminates a fingerstick, so an elevated capillary result is confirmed on a
venous sample before it is acted on. The tile says this when the sample is capillary **and** when
the sample type was left blank, because an unstated sample is the one most likely to be a
fingerstick.

## §5 The value moves

It has been lowered from 10 to 5 and then to 3.5, and it falls as exposure in the population
falls. Every result carries a line saying to check that the value being read against is current.

## §6 Sourcing (spec-v97 gate)

- Centers for Disease Control and Prevention. *Blood Lead Reference Value.* Atlanta: CDC; 2021.

CDC is a tracked issuer, so `docs/citation-staleness.md` carries a row.

## §7 Posture

Decision support, not a verdict. It reads a result against the published reference value. It
does not schedule confirmatory testing, choose a chelating agent, or replace the local health
department, the regional poison center, or a lead program.

Catalog 1654 → 1655.
