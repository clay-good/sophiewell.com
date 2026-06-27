# v12 audit - basdai

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: Garrett S, Jenkinson T, Kennedy LG, Whitelock H, Gaisford P, Calin A. A new approach to defining disease status in ankylosing spondylitis: the Bath Ankylosing Spondylitis Disease Activity Index. J Rheumatol. 1994;21(12):2286-2291 (cross-verified against Omnicalculator, MDApp, and RheumInfo; ≥ 2 sources, spec-v97).

`lib/rheum-ob-v156.js basdai()` computes the patient-reported axial-spondyloarthritis
activity index from six 0–10 items. Group G, Class A.

## Source-governance notes
- Six items each 0–10: fatigue, spinal pain, peripheral joint pain/swelling,
  enthesitis, morning-stiffness severity, morning-stiffness duration.
- BASDAI = [Q1 + Q2 + Q3 + Q4 + (Q5 + Q6)/2] / 5, scored 0–10. The two
  morning-stiffness items (Q5, Q6) are **averaged before being added**, then the
  whole is divided by 5 — they are not summed flat. This is the chief scoring
  nuance and is unit-tested explicitly.
- A BASDAI ≥ 4 suggests active / suboptimally controlled disease.

## Boundary worked examples added
- the tile example exercising the (Q5+Q6)/2 term (4.2); the averaged-not-summed
  assertion; the ≥ 4 threshold at exactly 4.0; the 0 floor and 10 ceiling; a
  missing or out-of-range item → valid:false.

## Edge-input handling notes
- Any blank or out-of-[0,10] item surfaces a complete-the-fields fallback rather
  than an undefined score; covered by the spec-v59 fuzz harness, zero non-finite
  leaks.

## A11y / keyboard notes
- Six labelled number inputs; output aria-live. 320px sweep, no horizontal scroll.

## Defects opened
- none

## Status
- PASS
