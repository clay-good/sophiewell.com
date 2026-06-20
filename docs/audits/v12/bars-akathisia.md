# v12 audit - bars-akathisia

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Barnes TRE. A rating scale for drug-induced akathisia. Br J Psychiatry. 1989;154:672-676 (re-fetched; the four components and the verbatim global anchors cross-read from multiple independent reproductions and clinical-trial protocols; the short-label global set was confirmed over a mis-mapped longer-criteria reproduction).

`lib/psych-v123.js barsAkathisia()` scores objective restlessness, subjective
awareness, and subjective distress (each 0-3, summed 0-9), plus the global clinical
assessment 0-5 (0 absent, 1 questionable, 2 mild, 3 moderate, 4 marked, 5 severe).
Class A (fixed ordinal scale; journal+author citation, no ISSUER_PATTERN trip -- no
docs/citation-staleness.md row).

## Boundary worked examples added
- all absent -> global 0, subtotal 0, not flagged.
- global 1 (questionable) -> below the mild flag.
- objective 2 + awareness 2 + distress 1 + global 3 -> subtotal 5/9, moderate akathisia.
- global 5 -> severe akathisia.
- subtotal caps at 9.
- scalar fuzz arg -> valid 0s, never NaN.

## Cross-implementation differential
- Reference: the short-label global anchors (0 absent ... 5 severe) are confirmed
  across multiple sources; a Scribd reproduction's longer descriptive criteria appear
  mis-mapped and were NOT used. The global rating is the headline; objective+subjective
  subtotal (0-9) supports it. Match. PASS.

## Edge-input handling notes
- Three 0-3 selects plus a 0-5 global select; subtotal clamped via per-item clamp. A
  scalar fuzz arg yields valid 0s, never NaN.

## A11y / keyboard notes
- Four labeled selects; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
