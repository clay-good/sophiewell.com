# v12 audit - lv-mass-index

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: Devereux RB, Alonso DR, Lutas EM, et al. Echocardiographic assessment of left ventricular hypertrophy: comparison to necropsy findings. Am J Cardiol. 1986;57(6):450-458; geometry partitions Lang RM, et al. J Am Soc Echocardiogr. 2015;28(1):1-39 (cross-verified against the ASE 2015 guideline and the Cardioserv LVH reference; ≥ 2 sources, spec-v97).

`lib/echo-v158.js lvMassIndex()` computes LV mass, LV mass index, relative wall
thickness, and the four-pattern geometry classification. Group E, Class A.

## Source-governance notes
- LV mass = 0.8·{1.04·[(LVIDd + PWTd + IVSd)³ − LVIDd³]} + 0.6, dimensions in cm.
- LVMI = mass/BSA; RWT = 2·PWTd/LVIDd.
- Geometry combines the RWT 0.42 cutoff with the sex-specific LVMI upper-normal
  limit (men > 115, women > 95 g/m²): normal, concentric remodeling, eccentric
  hypertrophy, concentric hypertrophy. Every combination resolves to one pattern.
- ASE/EACVI is not in check-citations ISSUER_PATTERN → Class A, no staleness row.

## Boundary worked examples added
- the tile example (248.8 g / 124.4 / 0.46 → concentric hypertrophy); the
  hand-checked Devereux cube (142.7 g); the RWT 0.42 geometry-pattern flip
  (concentric remodeling vs normal); the sex-specific cutoff flip (same LVMI,
  normal for a man, eccentric hypertrophy for a woman); blank/zero → valid:false.

## Edge-input handling notes
- Each measurement is finite and > 0; the cube cannot overflow at clinical inputs
  (capped 12 cm). Covered by the spec-v59 fuzz harness, zero non-finite leaks.

## A11y / keyboard notes
- Four labelled number inputs + a sex select; output aria-live. 320px sweep, no
  horizontal scroll.

## Defects opened
- none

## Status
- PASS
