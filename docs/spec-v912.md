# spec-v912 — NICHD fetal heart rate categories

## Why

The catalog had a biophysical profile, an amniotic fluid index and an estimated fetal weight, and
nothing at all for the tracing a labor nurse reads all shift. `fetal heart rate`, `nichd` and
`category ii` were zero-hit across the 1700 tile names.

## What it does

| Category | Rule |
| --- | --- |
| I | **all** of: baseline 110–160 bpm; **moderate** variability; late decelerations **absent**; variable decelerations **absent** |
| III | **absent** variability with recurrent late decelerations, recurrent variable decelerations or bradycardia — **or** a sinusoidal pattern |
| II | everything else |

Early decelerations and accelerations may be present or absent and change nothing.

## The three things it is for

**Category III needs *absent* variability, not minimal.** Minimal variability with recurrent late
decelerations is Category II. Reading minimal as absent is the most common way this system is got
wrong, so when the decelerations would otherwise have reached Category III the result says which
one was entered, in those words. The worked example is exactly that case.

**Category II is a residual, not a middle severity.** It is defined as every tracing that is
neither I nor III, it covers an enormous range, and most tracings fall in it. The result names
what specifically kept the tracing out of Category I rather than leaving "II" to stand as a
finding on its own.

**The category describes the tracing at a point in time.** It is not a prediction, tracings move
between categories, and none of the three is a management algorithm.

Tachycardia is never on its own a route into Category III — only bradycardia is — and the tests
pin that.

## Files

New: `lib/nichd-fhr-v912.js`, `views/group-v912.js`, `mcp/adapters/nichd-fhr-v912.js`,
`test/unit/nichd-fhr.test.js`, this file.
Wired: `app.js`, `mcp/catalog.js`, `lib/meta.js`, `test/unit/fuzz-tools.test.js`,
`test/mcp/mcp-search-relevance.test.js`, `docs/mcp-coverage.md`, `data/synonyms.json`, and the
count surfaces.

## Sourcing

Macones 2008 (*Obstet Gynecol*), the NICHD workshop report, cross-checked against ACOG Practice
Bulletin 106, which carries the same three-tier definitions. Neither issuer is in
`ISSUER_PATTERN`, so no `docs/citation-staleness.md` row is owed.

Catalog 1700 → 1701.
