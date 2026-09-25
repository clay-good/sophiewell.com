# spec-v1443 — de Winter pattern

Found with [spec-v1441](spec-v1441.md): `de winter` matched nothing. Wellens marks a stenosis in a
pain-free patient; de Winter marks an occlusion happening now, without the ST elevation a STEMI
alert waits for.

## Sources, read 2026-09-24

- de Winter RJ et al, *N Engl J Med* 2008;359:2071-2073 (PubMed 18987380): the description.
- The features, stated consistently in open reports (Cureus 2026, PMC13222104; JACC Case Reports
  2026, PMC13198112; Brazilian chest-pain guideline 2025, PMC12981354): upsloping ST depression of
  more than 1 mm at the J point in the precordial leads, tall symmetrical T waves, no contiguous ST
  elevation, and often 0.5-1 mm ST elevation in aVR.
- Status and timing (PMC13222104): classified as a STEMI equivalent by the 2022 ACC Expert Consensus
  Decision Pathway and the 2025 ACC/AHA ACS guideline; about 2% of proximal LAD occlusions;
  typically evolves to overt ST elevation within a median of 114 minutes.

## Behavior

Four findings, all required (a blank "ST elevation" read as absent would call the pattern).
Contiguous precordial ST elevation routes the answer to STEMI criteria, still flagged. Upsloping
J-point depression with tall symmetrical T waves and no ST elevation is the pattern; aVR elevation
supports but is not required. A miss names the missing feature and says it does not rule out an
occlusion.

## Tests

`test/unit/de-winter-pattern.test.js`: the pattern with and without aVR, the STEMI route, a named
missing feature, and blanks.
