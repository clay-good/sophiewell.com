# v12 audit - phases

- Auditor: CG
- Date: 2026-06-19
- Citation re-verified against: Greving JP, Wermer MJH, Brown RD Jr, et al. Development of the PHASES score for prediction of risk of rupture of intracranial aneurysms: a pooled analysis of six prospective cohort studies. Lancet Neurol. 2014;13(1):59-66 (re-fetched; the original Table 4 point table and Figure 3 risk lookup read directly, cross-checked with PMC8059702 which reproduces the point table verbatim).

`lib/neuro-v118.js phases()` sums Population (NA/European 0, Japanese +3, Finnish
+5), Hypertension (+1), Age >= 70 (+1), Size (< 7.0 mm 0, 7.0-9.9 +3, 10.0-19.9
+6, >= 20 +10), Earlier SAH (+1), and Site (ICA 0, MCA +2, ACA/Pcom/posterior +4)
for a total of 0-22, then maps the total to the published 5-year cumulative
rupture risk. Class A (fixed point weights; journal+author citation, no
ISSUER_PATTERN trip -- no docs/citation-staleness.md row).

## Boundary worked examples added
- missing age/size -> complete-the-fields fallback.
- lowest-risk profile -> 0/22, ~0.4%.
- Greving worked example (NA, no HTN, no prior SAH, 8 mm posterior aneurysm) ->
  7 points, ~2.4%.
- size banding 7.0 -> +3, 10.0 -> +6, 20 -> +10.
- high-risk band-flip (Finnish + HTN + age>=70 + 12 mm + earlier SAH + posterior)
  -> 18, ~17.8%.
- the 12-point boundary maps to the >= 12 stratum (17.8%).

## Cross-implementation differential
- Reference: Figure 3 risk lookup is verbatim -- <= 2 -> 0.4%, 3 -> 0.7%,
  4 -> 0.9%, 5 -> 1.3%, 6 -> 1.7%, 7 -> 2.4%, 8 -> 3.2%, 9 -> 4.3%, 10 -> 5.3%,
  11 -> 7.2%, >= 12 -> 17.8%. The paper's own narrative worked example (55-yo NA,
  8 mm posterior = 7 points -> 2.4%) reproduces exactly. Match. PASS.

## Edge-input handling notes
- Age and size require non-negative numbers (else a complete-the-fields / reject
  fallback); the total is clamped 0-22. A scalar / non-object fuzz arg yields the
  invalid-input fallback, never a NaN.

## A11y / keyboard notes
- Two labeled number inputs, two labeled selects, two labeled checkboxes; output
  aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
