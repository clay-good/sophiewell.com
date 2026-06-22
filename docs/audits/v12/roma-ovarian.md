# v12 audit - roma-ovarian

- Auditor: CG
- Date: 2026-06-22
- Citation re-verified against: Moore RG, McMeekin DS, Brown AK, et al. A novel multiple marker bioassay utilizing HE4 and CA125 to predict epithelial ovarian cancer in patients with a pelvic mass. Gynecol Oncol. 2009;112(1):40-46 (re-fetched; the pre/post-menopausal predictive-index coefficients and the high-risk cut-points cross-read across the primary record and >= 2 independent ROMA reproductions).

`lib/gyn-v139.js romaOvarian()` computes the logistic predictive index with
natural-log marker terms (premenopausal PI = -12.0 + 2.38*ln(HE4) +
0.0626*ln(CA125); postmenopausal PI = -8.09 + 1.04*ln(HE4) + 0.732*ln(CA125)),
back-transforms ROMA% = 100*exp(PI)/(1+exp(PI)), and compares it to the Moore 2009
cut-points (~13.1% premenopausal, ~27.7% postmenopausal). Class B (the cut-point
is assay-platform dependent -> docs/citation-staleness.md row; the citation names
a journal + authors, not an issuer acronym, so the row is documentation only).

## Source-governance notes
- The cut-points are the Moore 2009 (Architect-platform) values; the tile text and
  the staleness row say the cut-point is assay-platform dependent and must be read
  against the local laboratory's validated threshold -- not silently universal.
- The ln domains are guarded for non-positive markers and the logistic exponent is
  overflow-clamped (clampExp +/-40), so ROMA% is never NaN or Infinity.

## Boundary worked examples added
- postmenopausal HE4 150, CA-125 100 -> ROMA 62.1%, above the 27.7% cut-point.
- premenopausal HE4 50, CA-125 20 -> ROMA 7.6%, below the 13.1% cut-point.
- postmenopausal HE4 40, CA-125 15 -> ROMA 9.4%, below the 27.7% cut-point.
- a zero or negative marker -> valid:false (ln guarded).
- markers 1e9 -> ROMA stays finite and within 0-100.

## Edge-input handling notes
- Two positive numeric markers (HE4, CA-125) and a menopausal checkbox; a
  non-positive or blank marker surfaces a complete-the-fields fallback.

## A11y / keyboard notes
- Two labeled number inputs, one labeled checkbox; output aria-live="polite".
  320px sweep, no hscroll.

## Defects opened
- none
