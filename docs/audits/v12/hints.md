# v12 audit - hints

- Auditor: CG
- Date: 2026-06-19
- Citation re-verified against: Kattah JC, Talkad AV, Wang DZ, Hsieh YH, Newman-Toker DE. HINTS to diagnose stroke in the acute vestibular syndrome. Stroke. 2009;40(11):3504-3510 (re-fetched; the Stroke derivation plus the MDCalc / EBMedicine / PMC6312070 reproductions cross-read on the central-vs-peripheral rule).

`lib/neuro-v120.js hints()` classifies the acute vestibular syndrome from the
three-step exam: Head-Impulse test (abnormal/saccade = peripheral, normal =
central), Nystagmus (direction-fixed = peripheral, direction-changing = central),
and Test of Skew (absent = peripheral, present = central). A benign PERIPHERAL
pattern needs all three reassuring; ANY ONE central feature (including the
counter-intuitive normal head impulse, the INFARCT rule) flags a CENTRAL (stroke)
cause. HINTS-plus adds new unilateral hearing loss as a fourth central feature.
Class A (fixed exam rule).

## Boundary worked examples added
- all three reassuring -> Peripheral (benign).
- normal head impulse alone -> Central (the INFARCT catch).
- direction-changing nystagmus alone -> Central.
- skew present alone -> Central.
- HINTS-plus new hearing loss with otherwise benign exam -> Central.
- multiple central features all named.
- scalar fuzz arg -> valid Peripheral default, never throws.

## Cross-implementation differential
- Reference: the central-vs-peripheral rule is verbatim across the derivation and
  the reproductions; sensitivity ~100% / specificity ~96% in Kattah (single expert
  examiner). The tile names that cohort; the Kerber 2015 general-examiner caveat is
  noted in the source-governance research but the operating characteristics quoted
  are the derivation's. Match. PASS.

## Edge-input handling notes
- Three selects and one boolean; string comparisons only -- no arithmetic, so no
  overflow path. A scalar fuzz arg defaults to the Peripheral (benign) pattern and
  never throws.

## A11y / keyboard notes
- Three labeled selects, one labeled checkbox; output aria-live="polite". 320px
  sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
