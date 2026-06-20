# v12 audit - brighton-gbs

- Auditor: CG
- Date: 2026-06-19
- Citation re-verified against: Sejvar JJ, Kohl KS, Gidudu J, et al. Guillain-Barre syndrome and Fisher syndrome: case definitions and guidelines for collection, analysis, and presentation of immunization safety data. Vaccine. 2011;29(3):599-612 (re-fetched; the original is paywalled, so the criteria table reproduced verbatim in Fokke C, et al, Brain 2014;137(1):33-43 Table 1 and the independent reproductions in PMC9387192 and PMC11674199 were cross-read).

`lib/neuro-v121.js brightonGbs()` grades diagnostic certainty by the features met:
three core clinical features (bilateral and flaccid limb weakness; decreased or
absent deep tendon reflexes in weak limbs; a monophasic course with onset-to-nadir
12 h-28 d) plus the absence of an identified alternative diagnosis, and two
paraclinical supports (CSF albuminocytologic dissociation -- cells < 50/uL with
elevated protein -- and nerve-conduction studies consistent with a GBS subtype).
Level 1 needs all core features + absence-of-alternative + BOTH CSF dissociation AND
consistent NCS; Level 2 needs the core + EITHER a supportive CSF (cells < 50,
protein elevated or normal) OR consistent NCS; Level 3 needs only the core with CSF
and NCS not done; Level 4 = a reported case with insufficient evidence to meet the
definition. Class A (fixed case definition; journal+author citation, no
ISSUER_PATTERN trip -- no docs/citation-staleness.md row).

## Boundary worked examples added
- core + CSF dissociation + consistent NCS -> Level 1.
- core + consistent NCS only (CSF not done) -> Level 2.
- core + supportive CSF only (cells < 50, normal protein) -> Level 2.
- core only, CSF/NCS not done -> Level 3.
- a missing core feature (monophasic absent) -> Level 4 (insufficient evidence).
- scalar fuzz arg -> valid Level 4, never NaN.

## Cross-implementation differential
- Reference: the level logic matches Fokke 2014 Table 1 and the two validation
  reproductions. The footnote rule "if CSF is not collected or unavailable, the
  nerve electrophysiology must be consistent" is honored: Level 2 is reached by
  either a supportive CSF or consistent NCS, and Level 1 requires both. The notation
  difference between Fokke ("+/-") and PMC9387192 ("-") for Level 3 paraclinical
  cells encodes the same meaning (not required for Level 3). Match. PASS.

## Edge-input handling notes
- Four booleans (the core + absence-of-alternative), one CSF select (not-done /
  dissociation / cells-normal-protein), one NCS boolean. A missing core feature
  short-circuits to Level 4. A scalar fuzz arg yields a valid Level 4, never NaN.

## A11y / keyboard notes
- Four labeled checkboxes, one labeled select, one labeled checkbox; output
  aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
