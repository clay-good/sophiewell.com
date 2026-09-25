# spec-v1425 — Ellman classification of partial-thickness rotator cuff tears

From the classification-gap queue. The catalog grades the cuff's fatty infiltration
(`goutallier`), the arthropathy that follows a massive tear (`hamada`) and the superior labrum
(`snyder-slap`, a different Snyder classification), and had nothing for a partial-thickness tear.

## Sources

- Ellman H, *Clin Orthop Relat Res* 1990;(254):64-74 (PubMed 2182260; no DOI registered): the
  original.
- Bi AS, Verma NN, *Classifications in Brief: The Ellman and Snyder Classifications of
  Partial-thickness Rotator Cuff Tears*, Clin Orthop Relat Res 2025;483:411-414 (open access,
  PMC11827997), read 2026-09-24. Its Table 1 is the rule this tool applies:

| grade | depth | type | side |
|---|---|---|---|
| 1 | < 3 mm | A | articular |
| 2 | 3-6 mm | B | bursal |
| 3 | > 6 mm | C | intratendinous |

## Behavior

The type comes from the side and the grade from the measured depth; exactly 3 mm and 6 mm are
grade 2. A full-thickness tear is accepted and reported as outside the partial grades (the one use
the review supports is telling full from partial). A depth over the 10 to 12 mm Ellman assumed for
the whole tendon is flagged; blank, zero, negative and over-30-mm depths are refused (30 mm is a
sanity envelope, not a criterion). Notes carry the measuring advice, the unsupported mm-to-percent
conversion, and the reliability figures (grade kappa 0.19 at arthroscopy, -0.11 on MRI).

**Snyder's grading is not built.** The same review's Table 2 grades by size (< 1 cm; > 1 and
< 2 cm; 2 to 3 cm; > 3 cm), which leaves exactly 1 cm in no grade, and the review says it is not
clear what dimension the sizes measure. A size field would have to guess both.

## Tests

`test/unit/ellman-partial-rc.test.js`: each side's type; the depth boundaries; the band wording;
the full-thickness path; the thickness flag and reliability note; the refusals.
