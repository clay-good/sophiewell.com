# spec-v1441 — Wellens syndrome criteria

Found by the gap finder: `wellens` and `de winter` matched nothing. The catalog reads a paced or
LBBB tracing for infarction (`sgarbossa`) and risk-stratifies chest pain (`heart`, `edacs`), and had
nothing for the T-wave pattern that marks a critical proximal LAD stenosis in a patient who is,
often, pain-free when the tracing is taken.

## Sources, read 2026-09-24

- de Zwaan C et al, *Am Heart J* 1982;103:730-736: the description.
- Rhinehardt J et al, *Am J Emerg Med* 2002;20:638-643 (abstract, PubMed 12442245; DOI checked on
  Crossref): "T-wave changes plus a history of anginal chest pain without serum marker
  abnormalities; patients lack Q waves and significant ST-segment elevation; ... normal precordial
  R-wave progression. The natural history of Wellens' syndrome is anterior wall acute myocardial
  infarction."
- The criteria as commonly listed (World J Cardiol 2023, PMC10600782), the type A/B split and type
  B's roughly 75% share (Clin Case Rep 2025, PMC12067551), and a 2025 review (PMC12342681) stating
  there is no consensus on whether markers must be normal, and that the pattern can progress to
  meet STEMI criteria.

## Behavior

Seven findings, all required: T waves in V2-V3 (biphasic = type A, deep inversion = type B),
ST segment (< 1 mm), precordial Q waves, R-wave progression, recent angina, pain-free tracing, and
markers. Every failed criterion is named. **Mildly elevated markers count, with the disagreement
printed**; clearly elevated markers do not. A miss caused by ST elevation or clearly raised markers
stays flagged, and every miss says it does not rule out an acute coronary syndrome.

## Tests

`test/unit/wellens-criteria.test.js`: both types, named failures, the marker disagreement, the
flag on a non-reassuring miss, and blanks.
