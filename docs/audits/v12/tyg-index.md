# v12 audit - tyg-index

- Auditor: CG
- Date: 2026-06-21
- Citation re-verified against: Simental-Mendia LE, Rodriguez-Moran M, Guerrero-Romero F. The product of fasting glucose and triglycerides as surrogate for identifying insulin resistance in apparently healthy subjects. Metab Syndr Relat Disord. 2008;6(4):299-304.

`lib/endo-v136.js tygIndex()` returns the TyG index. Class A (fixed published formula; journal+author citation - no docs/citation-staleness.md row).

## Source-governance / formula note
- TyG = ln[(fasting triglycerides mg/dL x fasting glucose mg/dL) / 2], the fasting-insulin-free insulin-resistance surrogate.
- Higher = greater insulin resistance; no universal diagnostic cut-point (reported as framing).

## Boundary worked examples added
- TG 150 / glucose 100 -> ln(7500) = 8.92; the higher-is-more-resistant direction.

## Edge-input handling notes
- Requires triglycerides > 0 and glucose > 0; zero/negative/blank surfaces valid:false (no ln(0) = -Infinity leak). Joined the spec-v59 fuzz harness (zero non-finite leaks).

## A11y / keyboard notes
- Two labeled number inputs; output aria-live="polite". 320px sweep, no hscroll; renders the clinical-posture note.

## Defects opened
- none
