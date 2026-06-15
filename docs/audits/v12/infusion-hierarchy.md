# v12 audit - infusion-hierarchy

- Auditor: CG
- Date: 2026-06-15
- Citation re-verified against: AMA CPT 96360-96379 (hydration, therapeutic/prophylactic/diagnostic infusions and injections, chemotherapy administration) and CMS Pub. 100-04 Ch. 12: exactly one "initial" code per encounter/IV site, chosen by the hierarchy chemo > therapeutic > hydration and, within a category, infusion > push -- never by chronology; an infusion under 16 minutes is reported as an IV push.

`lib/billing-v81.js infusionHierarchy()` normalizes each administration, reclassifies sub-16-minute therapeutic/chemo infusions to pushes, ranks by (category, mode, duration, input order), assigns the single initial code, and gives every other line a sequential / concurrent / additional-hour / additional-push role with its CPT code.

## Boundary examples added
- Chemo + therapeutic + hydration + push, with hydration given first on the clock: chemo infusion is the initial (96413), therapeutic infusion sequential (96367), hydration sequential (96361), push additional (96375). Initial chosen by hierarchy, not chronology.
- Category dominates mode: a chemo PUSH outranks a therapeutic INFUSION (initial 96409).
- A 10-minute therapeutic infusion reclassifies to a push (initial 96374), reclassified flag set.
- A 150-minute initial chemo infusion adds one additional-hour unit (96415 x1).

## Cross-implementation differential
- Reference: the CMS hierarchy table applied by hand to the four-administration encounter.
- Test case: the chemo+therapeutic+hydration+push encounter -> 96413 initial. Sophie result identical. PASS.

## Edge-input handling notes
- administrations must be a non-empty array (<=50) of objects (TypeError/RangeError otherwise); an unknown type throws TypeError; minutes validate finite >= 0. Exactly one initial is emitted (one initial per site). additionalHours uses the CPT ">30 min counts as another hour" rule. No NaN/Infinity path; all codes are fixed strings.

## A11y / keyboard notes
- One labeled textarea (one administration per line) + a format hint; output aria-live="polite" with a per-line role list. 320px sweep passes (no horizontal scroll; the textarea is max-width:100%).

## Defects opened
- none

## Status
- PASS
