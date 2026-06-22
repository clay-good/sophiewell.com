# v12 audit - eos-calculator

- Auditor: CG
- Date: 2026-06-22
- Citation re-verified against: Kuzniewicz MW, Puopolo KM, Fischer A, et al. A quantitative, risk-based approach to the management of neonatal early-onset sepsis. JAMA Pediatr. 2017;171(4):365-371; on the model of Puopolo KM, et al. Pediatrics. 2011;128(5):e1155. Coefficients re-fetched from the Kaiser EMR FAQ (the corrected implementation document) and cross-verified against the van der Weijden 2024 open-source reimplementation and MDCalc.

`lib/peds-v140.js eosCalculator()` computes the maternal/prenatal logistic prior
`bx = intercept + 0.8680*tempF - 6.9325*GA + 0.0877*GA^2 + 1.2256*(ROMh+0.05)^0.2
- 1.0488*approptx1 - 1.1861*approptx2 + 0.5771*GBS+ + 0.0427*GBSunknown`, converts
it to odds, multiplies by the exam likelihood ratio (well 0.41 / equivocal 5.0 /
clinical illness 21.2), and reports the posterior EOS probability per 1,000. The
incidence-specific intercept is {0.3: 40.0528, 0.4: 40.3415, 0.5: 40.5656, 0.6:
40.7489}. Class A.

## Source-governance notes
- Temperature enters RAW in degrees Fahrenheit (to 0.1 F), not centered and not
  in Celsius. Gestational age is a QUADRATIC term (linear + squared), not a
  spline. ROM enters through the fractional-power transform `(hours + 0.05)^0.2`.
- The GBS-unknown coefficient is `+0.0427`. The original Puopolo 2011 supplement
  printed it with the wrong sign; the Kaiser FAQ corrects it, and this tile uses
  the corrected `+0.0427`.
- `approptx1` = GBS-specific antibiotics >= 2 h OR any broad-spectrum 2 to 3.9 h
  before delivery; `approptx2` = broad-spectrum >= 4 h before delivery. GBS-
  negative and no/inadequate antibiotics are the zero (reference) categories.
- The exam likelihood ratios are the upper-95%-CI values the published calculator
  uses (the conservative choice). The 2024 model update uses different point-
  estimate LRs; this tile implements the 2017/2011 model.
- The tool reports the probability and the source's stated management tier; it
  authors no antibiotic, culture, or admission order in Sophie's voice.

## Boundary worked examples added
- GA39, 100.4F, ROM18h, GBS+, no abx, well-appearing -> risk at birth 1.50/1,000,
  posterior 0.62/1,000 -> enhanced observation (posterior under 1, prior >= 1).
- GA38, 99F, ROM10h, GBS unknown, no abx, equivocal -> posterior 1.23/1,000 ->
  blood culture (1 to under 3).
- clinical-illness exam pushes a febrile case >= 3/1,000 -> empiric antibiotics.
- term, afebrile, GBS-negative, adequate abx, well -> below 1/1,000 -> routine care.
- adequate broad-spectrum antibiotics lower the prior vs none.

## Edge-input handling notes
- Logistic worked in odds space (`odds = e^bx`, prob = odds/(1+odds)) with bx
  clamped to [-700, 700], avoiding the 1-p cancellation that leaks NaN for large
  bx; fuzzed extremes (GA 43, temp 110, ROM 1e9) stay finite and cap at 1,000/1,000.
- A blank GA / temperature / ROM, an out-of-range GA (not 22-43 wk) or temperature
  (not 90-110 F), a negative ROM, or an unset exam category surfaces a complete-
  the-fields fallback.

## A11y / keyboard notes
- One labeled incidence select, three labeled number inputs, three labeled selects
  (GBS, antibiotics, exam); output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
