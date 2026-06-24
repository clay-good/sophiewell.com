# v12 audit - fibromyalgia-acr-2016

- Auditor: CG
- Date: 2026-06-24
- Citation re-verified against: Wolfe F, Clauw DJ, Fitzcharles MA, et al. 2016 Revisions to the 2010/2011 fibromyalgia diagnostic criteria. Semin Arthritis Rheum. 2016;46(3):319-329 (Table 3 transcribed verbatim from the primary PDF and cross-confirmed against the Bateman Horne Center 2016 clinical form and rheumcalc).

`lib/rheum-v147.js fibromyalgiaAcr2016()` consumes the Widespread Pain Index and the
Symptom Severity Scale components and computes the met/not-met determination per the
dual-threshold rule. Class A.

## Source-governance notes
- WPI: count of 0-19 painful body regions.
- SSS (0-12): fatigue (0-3) + waking unrefreshed (0-3) + cognitive (0-3) + a somatic
  item (0-3). The 2016 somatic item is a COUNT of headaches / lower-abdominal pain /
  depression over 6 months, each 0 or 1 -- NOT a severity scale (the major
  simplification from the 2010/2011 version).
- Criteria met when (WPI >= 7 and SSS >= 5) OR (WPI 4-6 and SSS >= 9), AND
  generalized pain (>= 4 of 5 regions; jaw/chest/abdomen excluded from the five),
  AND symptoms at a similar level >= 3 months.
- The diagnosis is valid irrespective of other diagnoses.

## Boundary worked examples added
- branch 1 edge WPI 7/SSS 5 met vs SSS 4 not; branch 2 WPI 5 needs SSS >= 9.
- somatic count (each 0/1) verified; generalized-pain gate (<4 fails); duration gate.
- tile example WPI 8 / SSS 6 -> met; blank WPI -> complete-the-fields.

## Edge-input handling notes
- WPI and generalized-region count required numerics (blank -> complete-the-fields);
  three SSS selects default to 0; three somatic + duration booleans via onFlag.
  Boolean determination, no non-finite path. Covered by the spec-v59 fuzz harness.

## A11y / keyboard notes
- Two labeled number inputs + three selects + four checkboxes; output aria-live.
  320px sweep, no hscroll.

## Defects opened
- none
