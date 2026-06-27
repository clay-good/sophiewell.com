# v12 audit - la-volume-index

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: Lang RM, Badano LP, Mor-Avi V, et al. Recommendations for cardiac chamber quantification by echocardiography in adults. J Am Soc Echocardiogr. 2015;28(1):1-39 (cross-verified against the ASE 2015 guideline and the BioMed Central cardiovascular-ultrasound LAVI reference; ≥ 2 sources, spec-v97).

`lib/echo-v158.js laVolumeIndex()` computes LA volume by the biplane area-length
method and the LA volume index, with the ASE severity bands. Group E, Class A.

## Source-governance notes
- LA volume = 0.85·(A1·A2)/L (A1 = A4C LA area, A2 = A2C LA area, L = the shorter
  of the two LA lengths); LAVI = volume/BSA.
- Severity bands (mL/m²): normal ≤ 34, mild 35–41, moderate 42–48, severe > 48.
- The length division is guarded (L > 0).

## Boundary worked examples added
- the tile example (75 mL / 37.5 → mild); the 34/35 normal→mild boundary; severe
  above 48; blank/zero-length → valid:false (division guarded).

## Edge-input handling notes
- A blank/non-finite/zero L surfaces a complete-the-fields fallback rather than
  NaN/Infinity; covered by the spec-v59 fuzz harness, zero non-finite leaks.

## A11y / keyboard notes
- Four labelled number inputs; output aria-live. 320px sweep, no horizontal scroll.

## Defects opened
- none

## Status
- PASS
