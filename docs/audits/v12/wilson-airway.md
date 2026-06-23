# v12 audit - wilson-airway

- Auditor: CG
- Date: 2026-06-23
- Citation re-verified against: Wilson ME, Spiegelhalter D, Robertson JA, Lesser P. Predicting difficult intubation. Br J Anaesth. 1988;61(2):211-216. The five factor criteria and the threshold statistics were cross-verified across >= 2 independent sources.

`lib/surg-v142.js wilsonAirway()` sums five anatomic factors (body weight, head/
neck movement, jaw movement, receding mandible, buck teeth), each 0/1/2, to 0-10.
Class A.

## Source-governance notes
- In the derivation a score ABOVE 2 (>= 3) identified ~75% of difficult
  laryngoscopies with a 12% false-positive rate; a score of 2 or more is the
  common sensitive screen (the warn flip used here, matching the spec acceptance's
  ">= 2 difficult-airway flip"). The band text quotes the published > 2 optimum.
- A distinct anatomic index from El-Ganzouri -- cross-linked, both kept.

## Boundary worked examples added
- all normal -> 0/10, below threshold.
- weight > 110 kg alone -> 2/10, flips to elevated (the sensitive screen).
- weight + head/neck + jaw moderate -> 3/10, quotes the ~75% derivation detection.
- max 10/10; blank factors score 0.

## Edge-input handling notes
- Each factor validates against {0,1,2}; a blank or invalid value scores 0. A
  bounded sum -- no non-finite path.

## A11y / keyboard notes
- Five labeled selects; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
