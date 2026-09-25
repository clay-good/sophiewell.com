# spec-v1433 — Disability Rating Scale (brain injury)

From the classification-gap queue (`rappaport`, `disability rating scale` both returned nothing).
The catalog had the Glasgow Outcome Scale-Extended (`gose`) for outcome and the GCS for the acute
exam, and nothing that follows a person with a moderate or severe traumatic brain injury from coma
to community on one scale.

## Sources, read 2026-09-24

- Rappaport M et al, *Arch Phys Med Rehabil* 1982;63:118-123 (PubMed 7073452): the scale.
- The Center for Outcome Measurement in Brain Injury (COMBI), DRS syllabus and FAQ
  (tbims.org/combi/drs): the eight items and their levels, "Add eight ratings to obtain total DRS
  score", and the descriptive categories. COMBI states that the scale costs nothing and "can be
  copied freely"; the tool still uses short level names rather than the full definitions.

| item | range | | total | category |
|---|---|---|---|---|
| eye opening | 0-3 | | 0 | none |
| communication | 0-4 | | 1 | mild |
| motor | 0-5 | | 2-3 | partial |
| feeding (cognitive) | 0-3 | | 4-6 | moderate |
| toileting (cognitive) | 0-3 | | 7-11 | moderately severe |
| grooming (cognitive) | 0-3 | | 12-16 | severe |
| level of functioning | 0-5 | | 17-21 | extremely severe |
| employability | 0-3 | | 22-24 / 25-29 | vegetative / extreme vegetative state |

## Behavior, and the rules it carries from COMBI

- **Every item is required.** Higher is worse, so a partial total could only understate the
  disability; a blank is asked for, never scored as 0.
- **Whole ratings only.** The 0.5 option "is not recommended" after April 1, 2010, and is refused
  with that reason.
- **The categories are descriptive.** COMBI says they "were not based on any statistical analysis";
  every answer says so, and that research should use the summed score.
- **Not for mild injury.** At totals of 3 or less the answer repeats COMBI's warning that the DRS is
  insensitive at the low end.
- Feeding, toileting and grooming are rated on knowing how and when, not physical ability; the
  form's intro and every answer say so.

## Tests

`test/unit/disability-rating-scale.test.js`: the 0-29 sum, every category edge, the two caveats,
blank items asked for by name, half points and out-of-range ratings refused.
