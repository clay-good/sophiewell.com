# spec-v1455 — Hakki simplified valve area

A companion to `gorlin`: `hakki` matched nothing. The Gorlin equation needs the heart rate and the
ejection or filling period; the Hakki formula needs only the cardiac output and the gradient, and is
what many readers reach for at the catheterization table.

## Source, read 2026-09-25

Hakki AH et al, *Circulation* 1981;63:1050-1055 (abstract, PubMed 7471364; DOI checked): "cardiac
output (l/min) divided by the square root of pressure differences across the valve". In 100
consecutive patients it agreed with Gorlin in aortic stenosis (r 0.96, unchanged with the peak
instead of the mean gradient) and in mitral stenosis (r 0.94).

## Behavior

Valve, cardiac output and gradient, all required. The limits are the ones the Gorlin tool already
applies (cardiac output above 0 and up to 20 L/min, gradient above 0 and up to 200 mmHg), so the two
tools refuse the same values. The answer gives the area and the valve-specific agreement with
Gorlin. No severity band is printed: none is stated in the source.

## Tests

`test/unit/hakki-valve-area.test.js`: two worked areas, the valve-specific note, and refusals.
