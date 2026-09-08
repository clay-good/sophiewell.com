# spec-v1150 — four declarations and one inflated anion gap

Fourth batch out of [spec-v1146](spec-v1146.md)'s backlog: the group triaged as
*"declared required, documented optional"*. Four of the five were exactly that.
The fifth was not, and the difference is worth the wave.

## Four fields the tile already called optional

| Tile / field | What the tile says | What the agent surface did |
| --- | --- | --- |
| `osmolal-gap` / EtOH | label: *"EtOH (mg/dL, **optional**)"*, and [spec-v1103](spec-v1103.md) recorded that the ethanol stays optional | `MISSING_INPUT` |
| `winters` / measured PaCO2 | label: *"Measured PaCO2 (mmHg, **optional**)"* | `MISSING_INPUT` |
| `anion-gap` / albumin | summary: *"with **optional** albumin correction"*; label: *"Albumin (optional)"* | `MISSING_INPUT` |
| `anion-gap-dd` / albumin | same | `MISSING_INPUT` |

Each is an **addition** to a formula that stands without it: the standard
calculated osmolality plus an ethanol term for a known ingestion; the expected
PaCO2 from the bicarbonate, with the measured one only for the comparison that
names a secondary disorder; the uncorrected anion gap, with the albumin
correction on top.

So the browser was right every time, and the agent surface had been refusing
calls it could answer — in `winters`' case, refusing to give the expected PaCO2
range unless you already had the measured one.

That is [spec-v1148](spec-v1148.md)'s lesson at scale: the sweep's disagreement
says *the two surfaces differ*, not *the browser is lax*.

## The fifth: `corrected-anion-gap`

Not a declaration. AG = Na − (Cl + HCO3), so the bicarbonate is a **term of the
gap** — and a blank one read as zero does not soften the reading, it inflates it:

```
Na 140, Cl 104, HCO3 24, albumin 4.0
  Measured AG 10, Corrected AG 15

the same patient with the bicarbonate left blank
  Measured AG 34, Corrected AG 39
```

Both readings land on *"Elevated (>12): consider HAGMA workup (MUDPILES /
GOLDMARK)"*, so the band hid it — 34 mEq/L is simply a much more alarming number
than 10, and rule 6 says an alarm from nothing is not the safe direction either.
Its three electrolytes are asked for by name now; a typed 0 still answers.

The albumin on this tile stays required, and so does the one on
`corrected-calcium`: on both, the correction **is** the tile.

## Backlog

**40 → 35.** Left: criteria that are present or absent (`truelove-witts`, `niss`,
`vent-sbt-peep`, `nutric`), the suites of independent readings
(`ecmo-titration`, `abg`, `digoxin`, `o2-cylinder-duration`,
`infusion-time-remaining`, `rosendaal-ttr`), and eleven singles.
