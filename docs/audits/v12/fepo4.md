# v12 audit - fepo4

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Walton RJ, Bijvoet OL. Lancet. 1975;2(7929):309-310 (the fractional-excretion form cross-read against StatPearls/NIH NBK493172 and the UW HIVPrep FEPO4 calculator; both reproduce (urine PO4 x plasma Cr)/(plasma PO4 x urine Cr) x 100 identically).

`lib/renal-v128.js fepo4()` computes FEPO4 (%) = (urine PO4 x plasma Cr) / (plasma PO4
x urine Cr) x 100, the same structure as FENa. Class A (fixed arithmetic identity;
journal+author citation, no ISSUER_PATTERN trip -- no docs/citation-staleness.md row).

## Boundary worked examples added
- urine PO4 30, plasma PO4 1.5, matched creatinines -> 33.3% (renal wasting).
- low FE (urine PO4 2, plasma PO4 3.0) -> 0.8% (appropriate conservation).
- exactly 5.0% does not flip (strict greater-than).
- zero/missing denominator term -> valid:false (no divide-by-zero); scalar -> valid:false.

## Source-governance / threshold note
- The hypophosphatemia-workup flip is the StatPearls/NIH 5% cutoff (the primary
  source-stated value). A higher ~20% cutoff appears in general / non-hypophosphatemic
  framing; it is referenced in the note but is NOT the band flip. Normal excretion is
  ~10-20%, so the band text frames the value against the plasma phosphate.

## Edge-input handling notes
- pos() guards each of the four inputs; the denominator (plasma PO4 x urine Cr) is
  guaranteed positive before the division. Output rounded to one decimal; band
  classified on the rounded value so the shown FE matches the band.

## A11y / keyboard notes
- Four number inputs each with a real <label for>; output aria-live="polite". 320px
  sweep, no hscroll.

## Defects opened
- none
