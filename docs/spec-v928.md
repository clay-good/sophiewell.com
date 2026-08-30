# spec-v928 — A measured zero is not an absence

## Why

`auto-peep`, `intrinsic peep` and `gas trapping` were zero-hit across the 1708 tile names. It
sits directly beside the airway resistance shipped in spec-v927: one is why the peak is high, the
other is why the next breath cannot start.

## What it does

**Auto-PEEP = total PEEP from an end-expiratory hold − PEEP set on the ventilator**

Give it a plateau as well and it reports the driving pressure both ways.

## The four things it is for

**The hold measures it only in a passive patient.** Expiratory muscle activity raises the
pressure read and inspiratory effort lowers it, so on an actively breathing patient the number is
not auto-PEEP. That is the commonest reason a measurement is wrong, and the result says so
whenever "passive" is not recorded.

**A measured zero does not exclude gas trapping.** Where airways collapse during expiration, the
trapped gas behind them never reaches the circuit during the hold. So a zero returns *"no
auto-PEEP measured, which is not the same as no gas trapping"* — and names the sign that survives
it, the expiratory flow failing to return to zero before the next breath. A measured value is
reported as a **floor, not a ceiling**, for the same reason.

**It puts an error into the driving pressure.** Driving pressure is the plateau minus the
**total** PEEP. Subtracting the set PEEP overstates it by exactly the auto-PEEP — so the tile
prints both numbers and says which is real, rather than describing the error in prose.

**It raises the trigger threshold.** The patient has to generate the whole auto-PEEP before any
flow reaches the sensor, which is where missed triggers come from.

A total PEEP **below** the set PEEP is refused, with a message that names expiratory effort as
the likely reason.

## Files

New: `lib/auto-peep-v928.js`, `views/group-v928.js`, `mcp/adapters/auto-peep-v928.js`,
`test/unit/auto-peep.test.js`, this file.
Wired: `app.js`, `mcp/catalog.js`, `lib/meta.js`, `test/unit/fuzz-tools.test.js`,
`test/mcp/mcp-search-relevance.test.js`, `docs/mcp-coverage.md`, `data/synonyms.json`, and the
count surfaces.

## Sourcing

Pepe and Marini 1982 (*Am Rev Respir Dis*), the paper that named the effect, and Blanch 2005
(*Respir Care*) for the measurement technique and its limits. Neither issuer is in
`ISSUER_PATTERN`, so no `docs/citation-staleness.md` row is owed.

Catalog 1708 → 1709.
