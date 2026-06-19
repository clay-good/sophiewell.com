# v12 audit - passive-leg-raise

- Auditor: CG
- Date: 2026-06-19
- Citation re-verified against: Monnet X, Rienzo M, Osman D, Anguel N, Richard C,
  Pinsky MR, Teboul JL. Crit Care Med. 2006;34(5):1402-1407.

`lib/fluidresp-v113.js passiveLegRaise()` computes %dSV = (peak - baseline) /
baseline x 100, with the cited >= 10-15% responsiveness threshold. Class A.

## Boundary worked examples added
- 60 -> 72 is a +20% rise, predicts responsiveness.
- a rise just under 10% (100 -> 108 -> 8%) is below the threshold.
- a fall (60 -> 54 -> -10%) is reported as a correctly-signed negative change.
- baseline denominator guarded: a baseline of 0 returns a fallback, never NaN or
  Infinity.
- partial input -> complete-the-fields fallback.

## Cross-implementation differential
- Reference: the percentage stroke-volume-change arithmetic and the >= 10-15%
  responsiveness endpoint are the Monnet 2006 definition. Match. PASS. The
  technique (semi-recumbent start, measure within ~1 min) is a rendered posture
  note.

## Edge-input handling notes
- the baseline denominator is guarded strictly positive; a peak below baseline is
  reported as a correctly-signed negative change, not clamped.

## A11y / keyboard notes
- Two labeled number inputs (baseline, peak); output aria-live="polite". 320px
  sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
