# spec-v1012 — "The page never states a number that does not exist" — while stating 1e+308

## The finding

`test/integration/no-impossible-number.spec.js` opens with that sentence and drives every tile's
number fields to `1e308`, `-1` and `0`, asserting no `NaN` and no `Infinity` reaches the reader. It
passed.

It passed while 87 of 1,704 tiles read `1e+308` out loud:

> BMI: 2.2857142857142856e+70 kg/m^2 (Obesity class III)
> Creatinine clearance: -6.805555555555556e+129 mL/min
> MAP: 2.3333333333333336e+120 mmHg
> Anion gap: 7e+140

`1e+308` is a number that exists, so the gate had nothing to say about it. Neither is any of those
a number a nurse can act on.

## Why this is not an exotic input

An `<input type="number">` accepts scientific notation. A reader whose cursor is at the start of a
field holding `70` and who types `7e` has entered **7 × 10<sup>70</sup>**, and nothing about the box
looks wrong — the browser reports the field as valid, because it is a valid number.

That is how the exponents above were produced: not by pasting `1e308`, but by two ordinary
keystrokes in the wrong place.

## The fix

Every field has a ceiling whether it says so or not. No quantity this site measures — a lab value,
a pressure, a dose, a count, a duration — reaches **a billion** in its own unit; the largest bound
any tile declares is 100,000. So a magnitude at or above 1e9 joins spec-v1009's warning even where
the field declares no bounds at all:

> Check the highlighted value: Weight (kg) is 1e+308, far beyond any value this tool can be
> measuring.

## The gate, rewritten to ask the right question

The sweep now also asserts that **an exponent never reaches the answer silently**. Not "never print
an exponent" — a tile that echoes back what was typed is being honest, and suppressing that would
hide the reader's own typo from them. The assertion is that when an exponent does reach the answer,
the implausible-value warning is on screen saying where it came from.

Verified both ways, which is the only way to trust a gate: with the ceiling removed the new
assertion fails with **81 tiles printing an exponent with nothing saying why**; with it, clean.

## Left open

The site still prints a value it was handed. `-6.8e+129 mL/min` now arrives with a warning above
it, but a creatinine clearance cannot be negative and the tile says it anyway. Teaching each
renderer which of its own outputs are physically impossible is a per-tile job, and the sweep above
is the place a future spec would tighten.
