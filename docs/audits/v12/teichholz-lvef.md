# v12 audit - teichholz-lvef

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: Teichholz LE, Kreulen T, Herman MV, Gorlin R. Problems in echocardiographic volume determinations. Am J Cardiol. 1976;37(1):7-11; bands Lang RM, et al. J Am Soc Echocardiogr. 2015;28(1):1-39 (cross-verified against the ASE 2015 guideline and the e-echocardiography ejection-fraction reference; ≥ 2 sources, spec-v97).

`lib/echo-v158.js teichholzLvef()` computes Teichholz LV volumes, LVEF, and
fractional shortening with sex-specific LVEF bands. Group E, Class A.

## Source-governance notes
- V = 7·D³/(2.4 + D); EDV uses LVIDd, ESV uses LVIDs; LVEF = (EDV − ESV)/EDV; FS =
  (LVIDd − LVIDs)/LVIDd.
- Sex-specific LVEF normal lower limits: men ≥ 52%, women ≥ 54%; mild 41%–normal,
  moderate 30–40%, severe < 30%.
- Dimension-derived; the renderer states biplane Simpson is preferred when wall
  motion is regional. The (2.4 + D) denominator is guarded.

## Boundary worked examples added
- the tile example (EF 57% / FS 30% normal, Simpson caveat); the sex-split window
  (~53% normal for a man, mild for a woman); severely reduced < 30%; LVIDs ≥ LVIDd
  → valid:false; blank/no-sex → valid:false.

## Edge-input handling notes
- LVIDs must be smaller than LVIDd (the ventricle contracts); blank/non-finite
  inputs surface a complete-the-fields fallback. Covered by the spec-v59 fuzz
  harness, zero non-finite leaks.

## A11y / keyboard notes
- Two labelled number inputs + a sex select; output aria-live. 320px sweep, no
  horizontal scroll.

## Defects opened
- none

## Status
- PASS
