# spec-v1494 — Kotlow ankyloglossia classes

The catalog had no tongue-tie tool. Kotlow (1999) classes ankyloglossia by the free tongue length, measured from the frenum insertion to the tip.

## Inputs

`ka-length` (mm, required, 0-40).

## What it does

Over 16 mm is not short; 12-16 mm Class I (mild), 8-11 mm Class II (moderate), 3-7 mm Class III (severe), under 3 mm Class IV (complete). The classes are whole-mm ranges, so a length such as 11.5 mm is reported as between two classes rather than rounded into one.

## Sources

Kotlow LA. Quintessence Int 1999;30(4):259-262. Classes as tabulated in Cureus 2026 (PMC13202495); the 16 mm line as used in Laryngoscope 2025 (PMC12913740).

## Tests

`test/unit/kotlow-ankyloglossia.test.js`: the worked example, the categories, blanks and bounds.
