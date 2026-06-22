# v12 audit - flamm-vbac

- Auditor: CG
- Date: 2026-06-22
- Citation re-verified against: Flamm BL, Geiger AM. Vaginal birth after cesarean delivery: an admission scoring system. Obstet Gynecol. 1997;90(6):907-910 (re-fetched; the five admission factors, their point weights, and the predicted-success bands cross-read across the primary record and an independent VBAC-calculator reproduction).

`lib/gyn-v139.js flammVbac()` sums maternal age < 40 (2), prior vaginal birth
(before & after first cesarean 4, after only 2, before only 1, none 0), prior
cesarean not for failure to progress (1), cervical effacement (>75% 2, 25-75% 1,
<25% 0), and cervical dilation >= 4 cm (1), for a 0-10 total mapped to a predicted
VBAC-success likelihood. Class A. Free substitute for the excluded paywalled
Grobman MFMU calculator (spec-v100 §8).

## Source-governance notes
- The success bands (0-2 ~49%, 3 ~60%, 4 ~67%, 5 ~77%, 6 ~89%, 7 ~93%, 8-10 ~95%)
  are the Flamm & Geiger published estimates, kept as approximate ("about") in the
  band text -- they are counseling estimates, not guarantees.
- The score reports a likelihood; the trial-of-labor decision stays with the
  patient and clinician (spec-v11 §5.3).

## Boundary worked examples added
- age<40 + vaginal birth after only + effacement 25-75% -> score 5, ~77%.
- all factors maximal -> score 10, ~95%.
- no factors -> score 0, ~49%.
- score 3 -> ~60%; score 6 -> ~89%.
- a missing select category -> valid:false.

## Edge-input handling notes
- Two select categories and three booleans; a missing select surfaces a
  complete-the-fields fallback. No numeric inputs to fuzz off-range.

## A11y / keyboard notes
- Two labeled selects, three labeled checkboxes; output aria-live="polite".
  320px sweep, no hscroll.

## Defects opened
- none
