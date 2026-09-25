# spec-v1426 — ISAKOS classification of meniscal tears

From the classification-gap queue. The knee had cartilage (`outerbridge-cartilage`) and
multiligament dislocation (`schenck-knee`) but no standard way to record a meniscal tear, the most
common arthroscopic finding.

## Sources

- Anderson AF, Irrgang JJ, Dunn W, et al, *Am J Sports Med* 2011;39:926-932 (DOI confirmed via
  Crossref): the original ISAKOS system and its interobserver study (8 surgeons, 37 videos).
- Sayegh ET, Matzkin E, *Classifications in Brief: The ISAKOS Classification of Meniscal Tears*,
  Clin Orthop Relat Res 2022;480:39-44 (open access, PMC8673961), read 2026-09-24. Its Description
  is the rule this tool applies:

| finding | categories |
|---|---|
| tear depth | partial (superior or inferior surface) / complete (both surfaces) |
| rim width | zone 1 < 3 mm / zone 2 3 to < 5 mm / zone 3 >= 5 mm; the outermost zone involved |
| radial location | posterior / middle / anterior third; a tear may involve several |
| popliteal hiatus | lateral tears only: central if it extends in front of the hiatus |
| tear pattern | longitudinal-vertical (bucket-handle is its extension), horizontal, radial, vertical flap, horizontal flap, complex |
| tissue quality | degenerative / nondegenerative / undetermined |
| tear length, % excised | measured at surgery |

## Behavior

ISAKOS is a descriptive record, not a graded scale, so the tool writes the standard sentence (the
same shape as the review's Fig. 2 captions) and derives the Cooper zone from the rim width. The
popliteal hiatus is required for a lateral tear and dropped, with a note, for a medial one. A
complex pattern recorded in nondegenerative tissue is flagged, because the review lists multiple
tear patterns as a feature of degenerative tissue. Tear length and percentage excised are not taken:
the note asks for them as measured. Every answer carries the reliability the original reports (rim
width kappa 0.25, hiatus 0.36, pattern 0.72).

## Tests

`test/unit/isakos-meniscal.test.js`: both Fig. 2 examples read back verbatim; each rim-width zone;
the medial-hiatus and complex-pattern notes; the reliability note; every refusal.
