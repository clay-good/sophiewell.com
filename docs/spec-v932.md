# spec-v932 — The unit is the whole trap

## Why

`hepatic iron index` and `hemochromatosis` were zero-hit across the 1709 tile names. `tsat`
covers the blood work; nothing covered the biopsy.

## What it does

**HII = hepatic iron concentration (µmol/g dry weight) ÷ age (years)**

At or above **1.9** is the level Bassett associated with homozygous hemochromatosis.

## The three things it is for

**The units are the trap, and they are why this tile is worth having.** Laboratories report
hepatic iron concentration in **µmol/g** or in **µg/g**, and the index is defined on the
micromolar figure. Iron weighs 55.845 µg per µmol, so a microgram figure used directly overstates
the index about **fifty-six-fold** — a normal liver reads as florid hemochromatosis. The tile asks
which unit the number is in, converts, and then says which one it used *and what the other would
have given*. The worked example is a µg/g figure, so the conversion is the first thing a reader
sees.

**It divides by age on purpose.** A homozygote accumulates iron progressively, so the same
concentration means more in a young patient than an old one — and a young homozygote can sit
below the threshold for that reason alone. The result says so.

**It has largely been superseded.** HFE genotyping and MRI-based iron quantification answer the
question without a biopsy, and the 2011 AASLD guideline treats the index as a supporting
measurement rather than the diagnostic test it was in 1986. A value below the threshold does not
exclude iron overload from another cause.

An unrecognized unit falls back to **micromolar** — the unit the index is defined on — rather
than to whichever was passed.

## Files

New: `lib/hepatic-iron-index-v932.js`, `views/group-v932.js`,
`mcp/adapters/hepatic-iron-index-v932.js`, `test/unit/hepatic-iron-index.test.js`, this file.
Wired: `app.js`, `mcp/catalog.js`, `lib/meta.js`, `test/unit/fuzz-tools.test.js`,
`test/mcp/mcp-search-relevance.test.js`, `docs/mcp-coverage.md`, `data/synonyms.json`, and the
count surfaces.

## Sourcing

Bassett 1986 (*Hepatology*) for the index and its threshold, and the 2011 AASLD hemochromatosis
practice guideline for where it now sits. Neither issuer is in `ISSUER_PATTERN`, so no
`docs/citation-staleness.md` row is owed.

Catalog 1709 → 1710.
