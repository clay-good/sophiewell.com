# v12 audit - forrest

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: Forrest JA, Finlayson ND, Shearman DJ. Endoscopy in gastrointestinal bleeding. Lancet. 1974;2(7877):394-397 (cross-verified against the Forrest-classification review PMC9139956 and GrepMed; ≥ 2 sources, spec-v97).

`lib/suites-v155.js forrest()` maps the endoscopic finding of a bleeding peptic
ulcer to its Forrest class and rebleed-risk tier. A deterministic input → class
mapping (spec-v100 §2 classification clarification). Group G, Class A.

## Source-governance notes
- Ia active spurting, Ib active oozing, IIa non-bleeding visible vessel — all
  high-risk stigmata that warrant endoscopic haemostasis. IIb adherent clot is
  intermediate. IIc flat pigmented spot and III clean ulcer base are low-risk.
- Untreated rebleeding falls across the classes but is **reported as ranges** in
  the literature, not single canonical values: approximately Ia/Ib ~55%,
  IIa ~43%, IIb ~22%, IIc ~10%, III ~5%. The tile surfaces these as approximate
  (the `~` markers), and the META band labels them "reported as ranges".

## Boundary worked examples added
- tile example IIa → high-risk stigmata; the IIa → IIc risk-tier flip; IIb
  intermediate and III clean base low; every defined class resolves to one cell;
  an unknown finding → valid:false.

## Edge-input handling notes
- An unrecognized or blank class surfaces a complete-the-fields fallback rather
  than an undefined cell; covered by the spec-v59 fuzz harness, zero non-finite
  leaks.

## A11y / keyboard notes
- One labelled select; output aria-live. 320px sweep, no horizontal scroll.

## Defects opened
- none

## Status
- PASS
