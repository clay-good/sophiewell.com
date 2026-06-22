# v12 audit - afi

- Auditor: CG
- Date: 2026-06-22
- Citation re-verified against: Moore TR, Cayle JE. The amniotic fluid index in normal human pregnancy. Am J Obstet Gynecol. 1990;162(5):1168-1173 (re-fetched; the four-quadrant summation method and the ACOG oligo/poly cut-points cross-read across the primary record and ACOG antenatal-surveillance guidance).

`lib/ob-v138.js afi()` sums the deepest vertical pocket (cm) of each of the four
quadrants and applies oligohydramnios < 5 cm, polyhydramnios > 24 cm, and a 5-8 cm
low-normal band. Class B (the ACOG thresholds are revisable -> docs/citation-staleness.md
row; the citation names ACOG, which is in the issuer acronym set, so the row is
gate-forced).

## Source-governance notes
- The strict ACOG cut-point > 24 cm is used for polyhydramnios; some references use > 25,
  noted in the tile text and the staleness row (not silently dropped).
- The four-quadrant summation method itself is fixed (Moore & Cayle 1990).

## Boundary worked examples added
- four 1 cm pockets -> AFI 4.0 cm, oligohydramnios (flagged).
- 5/4/4/5 -> AFI 18.0 cm, normal (not flagged).
- 2/2/1.5/1 -> AFI 6.5 cm, low-normal (not flagged).
- 8/8/7/6 -> AFI 29.0 cm, polyhydramnios (flagged).
- a negative or missing pocket -> valid:false.

## Edge-input handling notes
- Four non-negative number inputs (a zero pocket is valid); a negative or blank quadrant
  surfaces a complete-the-fields fallback.

## A11y / keyboard notes
- Four labeled number inputs; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
