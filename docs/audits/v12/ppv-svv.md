# v12 audit - ppv-svv

- Auditor: CG
- Date: 2026-06-19
- Citation re-verified against: Michard F, Boussat S, Chemla D, Anguel N, Mercat
  A, Lecarpentier Y, Richard C, Pinsky MR, Teboul JL. Am J Respir Crit Care Med.
  2000;162(1):134-138.

`lib/fluidresp-v113.js ppvSvv()` computes the variation (max - min) / ([max +
min] / 2) x 100 over a respiratory cycle, with the cited PPV > ~13% / SVV > ~12%
responsiveness thresholds. Class A.

## Boundary worked examples added
- PPV 50 / 40 mmHg is 22.2%, above the ~13% threshold.
- a PPV just under 13% (53 / 47 -> 12%) is below the threshold.
- SVV uses the ~12% cutoff and the mL unit (80 / 70 -> 13.3%).
- mean denominator guarded: max + min 0 returns a fallback, never NaN or Infinity.
- partial input -> complete-the-fields fallback.

## Cross-implementation differential
- Reference: the (max - min) / mean variation arithmetic and the 13% pulse-pressure
  cutoff are the Michard 2000 definition. Match. PASS. The applicability caveats
  (regular rhythm, controlled ventilation, adequate tidal volume) are rendered as
  a posture note; the SVV ~12% cutoff is framed as commonly-cited.

## Edge-input handling notes
- the (max + min)/2 mean denominator is guarded strictly positive; a min above max
  yields a correctly-signed negative variation surfaced in words.

## A11y / keyboard notes
- One labeled index select plus two labeled number inputs; output
  aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
