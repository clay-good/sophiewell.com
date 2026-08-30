# spec-v934 — 272 citations a reader cannot click

## The measurement

Every one of the 1710 tiles carries a citation. **272 of them carry no `citationUrl`**, and that
field is the only thing standing between a citation and a link a reader can follow:

- `scripts/build-tool-pages.mjs` appends **"Read the source ↗"** to the static page when it is
  set, and nothing when it is not.
- `app.js` does the same in the browser app.
- The MCP surface returns `citationUrl` on `describe_calculator` and `compute_calculator`, so an
  agent asking where a number came from gets `null` for these 272.

So a reader on Wells PE or BMI sees a citation they cannot click, while a reader on the tile
beside it can. Nothing is wrong with the citations themselves — they are complete and correct.

## Where they are

| Group | Tiles without a source link |
| --- | --- |
| G — clinical scoring & risk | 141 |
| E — labs & formulas | 41 |
| F — dosing & infusions | 28 |
| H — communication & workflow | 22 |
| I — field & EMS | 17 |
| N, J, C, A, P | 15 combined |

**198 of the 272 cite what looks like a journal article** — a year with a volume, the shape that
has a DOI. `bmi`, `bsa`, `anion-gap`, `cockcroft-gault`, `winters` and `pf-ratio` are among them.
The other 74 cite guidance, a definition or a reference table, where a permanent link may not
exist at all.

## Why this is a measurement and not a fix

A `citationUrl` is meant to be a permanent DOI or the publisher's canonical page. Producing 198
of them means looking each one up. **Writing a DOI from memory is fabricating a source, which is
worse than having none** — a wrong link under "Read the source" is an active misdirection, where
a missing one is merely an absence. So this spec measures the gap, names the blocker, and stops.

The work is well shaped for whoever can resolve the identifiers: the list is mechanical to
regenerate (`META` entries with a `citation` and no `citationUrl`), the 198 journal-shaped ones
are the high-value half, and each addition is independently verifiable.

Every tile added in this session's program (spec-v859 onward, 21 checked) carries a
`citationUrl`, so the gap is not growing.

## Files

This file. No code change.
