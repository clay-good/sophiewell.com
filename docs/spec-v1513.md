# spec-v1513 — Adherence and quality measures from a fill history

**Status:** Proposed, September 25, 2026. 4 new tools, group Q.
**Charter:** [spec-v1500](spec-v1500.md). **Machinery:** [spec-v1501](spec-v1501.md) §3 (upload workbench).

Medicare Part D plans are rated on three adherence measures, and pharmacies are paid
and contracted on them. The method is public in the CMS Star Ratings Technical Notes,
but most pharmacies and clinics see it only as a vendor's number. These tools compute
it from the reader's own fill history in the browser, and turn it into the list of
patients to call.

## The method (from the CMS 2026 Star Ratings Technical Notes, pp. 86–90, Attachment L)

| Element | Rule |
|---|---|
| Measures | D08 diabetes medications, D09 RAS antagonists, D10 statins |
| Denominator | age 18+, at least 2 fills on different dates in the year, and a treatment period of at least 91 days |
| Index date | the first fill of a target drug in the year |
| Treatment period | index date to the earliest of disenrollment, death or December 31 |
| Numerator | proportion of days covered of 80% or more |
| Overlap | a fill's days are shifted forward only when it overlaps an earlier fill of the **same active ingredient**; overlaps between different drugs in the class are not shifted |
| Hospital and SNF stays | stay days (discharge day included) come out of both numerator and denominator; supply overlapping a stay shifts to after discharge |
| Exclusions | hospice, ESRD or dialysis (all three); any insulin (D08); sacubitril/valsartan (D09) |

**Licensing.** CMS says the measures are adapted from the Pharmacy Quality Alliance's
PDC measure and restates the algorithm in a public government document. The tools
implement the method from the CMS text. They do not ship PQA's specification or its NDC
value set: the reader maps each fill to a measure class (a column in the upload, or a
per-ingredient mapping table the reader confirms once per file). Before build, the
terms on the CMS-posted NDC list are read. If redistribution is allowed, it becomes a
route A dataset and the mapping becomes optional.

## Tools

### 1. `pdc-star` — Proportion of Days Covered (Medicare Part D Star Method)

**Input.** An upload of fills (patient reference, fill date, days supply, ingredient,
measure class) and optionally a stays file (patient, admit date, discharge date) and an
exclusions column. A single-patient form is offered for checking one case.
**Compute.** The method above, per patient per measure.
**Output.** Per patient: PDC, whether they're in the denominator, and the reason if
excluded. Per measure: the rate and the counts. Plus a CSV.
**Edition.** The Technical Notes change yearly. The method is a route B dated rule tied
to the Star year, and the page watch covers the Technical Notes URL. Announced for
measurement year 2026 (the 2028 Stars): sociodemographic risk adjustment and a
temporary weight change. Neither changes a patient's PDC; the tool notes it.

### 2. `mpr-gap-days` — Medication Possession Ratio and Gap Days

**Input.** One patient's fills of one drug (form or upload), and the period.
**Compute.** MPR (total days supplied ÷ days in period, uncapped, so it can exceed
100%), PDC for the same period for comparison, and each gap longer than a
reader-chosen number of days.
**Output.** Both ratios, the gaps with dates, and a line explaining why MPR and PDC
differ when they do (stockpiling inflates MPR).

### 3. `adherence-outreach-list` — Who Can Still Reach 80% This Year

**Input.** The same upload as `pdc-star`, and an "as of" date.
**Compute.** For each patient in each measure: days covered so far, the days left in
the treatment period, and the **number of further uncovered days they can have and
still finish at 80%**. A patient who has already fallen below the reachable line is
marked "cannot reach 80% this year".
**Output.** A call list sorted by the fewest days of slack, then by next refill due.
This is the list an adherence pharmacist builds every week.

### 4. `med-sync-plan` — Medication Synchronization Plan

**Input.** The patient's maintenance medications: last fill date, days supply,
quantity per day, and the target sync date (or "earliest practical").
**Compute.** The anchor date and, for each medication, the short-fill quantity that
brings it to the anchor, prorated to whole units. After that every medication is on the
same cycle.
**Output.** The sync date, the one-time short fills, and the quantities. Whether a plan
prorates cost sharing for short fills is plan-specific; the tool leaves that as a
question for the plan.

## Sources

- CMS, *2026 Star Ratings Technical Notes* (updated September 25, 2025), pp. 86–90 and
  Attachment L, pp. 151–155.
- CMS announcements on measurement-year 2026 changes (to be read and cited at build).

## Tests

- `pdc-star`: overlap shifted for the same ingredient and not for a different drug in
  the class; a hospital stay removed from both sides; an insulin fill excluding a
  patient from D08; a patient with one fill left out of the denominator; a treatment
  period of 90 days left out, and 91 days kept.
- `adherence-outreach-list`: a patient at exactly 80% reachable; one day past it.
- `med-sync-plan`: a short fill rounding to whole tablets.
