# spec-v1514 — Hospital, post-acute and DME notices and benefit clocks

**Status:** Proposed, September 25, 2026. 10 new tools, group H.
**Charter:** [spec-v1500](spec-v1500.md). **Machinery:** [spec-v1501](spec-v1501.md) §5 (hour and midnight counting).

Case managers, utilization-review nurses, and home health, hospice and DME staff run
their days on Medicare clocks: when a notice is due, whether a stay qualifies, when a
recertification is needed, and when a rental becomes the patient's. A missed notice
makes the provider liable for the care; a miscounted stay costs the patient their
skilled-nursing coverage. The regulation text below was read on September 1–24, 2026
(eCFR), and the manual text in Pub. 100-04 chapter 30 (revision 12934).

## Tools

### 1. `moon-deadline` — Observation Notice (MOON) Deadline

**Input.** The date and time observation started, and the release, transfer or
admission time if known.
**Compute.** A MOON is required once outpatient observation exceeds 24 hours. It's due
no later than 36 hours after observation began, or at release, transfer or admission
if that's sooner (42 CFR 489.20(y)). It may be given before hour 24.
**Output.** Required or not yet, the latest delivery time, and the delivery elements
(oral explanation; signature, or the deliverer's name, title, date and time on refusal).

### 2. `im-notice-timing` — Important Message from Medicare Timing

**Input.** Admission date and time, delivery time of the first IM, and planned
discharge date and time.
**Compute.** First IM no later than 2 calendar days after admission (it may be given up
to 7 days before, at a pre-admission visit). A follow-up copy is due no more than 2
calendar days before discharge and, per the manual, as late as 4 hours before. No
follow-up is needed when the first IM was delivered within 2 calendar days of discharge
(405.1205(c)(2)).
**Output.** Each due window, whether the follow-up is needed, and the patient's appeal
deadline (by the day of discharge, from `qio-discharge-appeal-clock`).

### 3. `nomnc-deadline` — Notice of Medicare Non-Coverage Deadline

**Input.** Setting (SNF, home health, hospice, CORF), the last covered day, the visit
schedule for non-residential settings, and the delivery date.
**Compute.** Delivered no later than 2 days before services end (405.1200(b)). The
manual is explicit that this means **2 days, not 48 hours**: a last covered SNF day on
Friday means delivery by Wednesday. Services lasting fewer than 2 days: at admission.
Visits more than 2 days apart: by the next-to-last visit.
**Also computed.** The patient's QIO request deadline (noon of the calendar day after
receiving the notice, 405.1202), the provider's detailed notice (DENC) by close of
business on the day the QIO calls, and the liability rule for an invalid notice
(coverage continues until 2 days after a valid one).

### 4. `mcsn-appeal-rights` — Inpatient-to-Observation Change: Appeal Rights (MCSN)

**Input.** Admission and reclassification dates and times, Part B enrollment, and
expected release time.
**Compute.** Eligibility under 42 CFR 405.1210(a)(3): formally admitted, reclassified
to outpatient observation, and either no Part B, or in the hospital 3 or more
consecutive days with fewer than 3 as an inpatient (days counted as in 409.30, discharge
day excluded). The notice (CMS-10868) is due as soon as possible and no later than 4
hours before release. The expedited appeal must reach the QIO before release, the
hospital sends records by noon of the next calendar day, and the QIO decides within 1
calendar day (405.1211). Reconsideration must be requested by noon of the day after the
decision; the QIO decides within 2 calendar days (405.1212).
**Output.** Eligible or not with the reason, and every deadline.
**Dates.** In effect since February 14, 2025 (CMS-4204-F). The retrospective appeal
window for older admissions closed January 2, 2026; the tool says so for any admission
before February 14, 2025.

### 5. `snf-qualifying-stay` — Skilled Nursing: Qualifying Stay and Benefit Days

**Input.** Each hospital stay's inpatient admission and discharge dates (observation
entered separately), the SNF admission date, and SNF days already used in the benefit
period.
**Compute.**
- Qualifying stay: at least 3 consecutive inpatient days, discharge day excluded;
  observation time doesn't count (409.30(a)).
- SNF admission within 30 days of hospital discharge (409.30(b)).
- The benefit period and its end: 60 consecutive days out of a hospital or skilled SNF
  care (409.60).
- SNF days: 1–20 fully paid, 21–100 at the daily coinsurance ($217 in 2026), none after
  day 100 in the benefit period (409.61(b)).
- The PDPM 5-day assessment reference date window: days 1–8 (413.343(b)).
**Output.** Qualifies or not with the count shown by date, the SNF deadline, days and
coinsurance left, and the date a new benefit period could begin.
**Why.** Observation stays that look like admissions are the most common reason a
patient gets an unexpected SNF bill. The tool shows the count by date.

### 6. `hospice-period-clock` — Hospice Benefit Periods, Recertification and Face-to-Face

**Input.** Election date, and the dates of any certifications and encounters done.
**Compute.** Periods of 90, 90, then unlimited 60 days (418.21). Certification: written
within 2 calendar days of a period starting, or oral within 2 days and written before
billing; no more than 15 days before the period (418.22(a)(3)). Face-to-face encounter
no more than 30 calendar days before the 3rd period's recertification and each one
after (418.22(a)(4)).
**Output.** A dated table of periods, recertification windows and encounter windows,
with anything overdue flagged.
**Dated notes (route B).** From October 1, 2026 the election statement addendum must be
given to every beneficiary at election (418.24). Telehealth face-to-face encounters are
allowed through December 31, 2027, with exclusions, and must be reported on claims from
January 1, 2027.

### 7. `hospice-aggregate-cap` — Hospice Aggregate Cap

**Input.** The cap year, the hospice's beneficiary count for the year (under the
streamlined or proportional method the hospice uses, entered), and Medicare payments
received for the year.
**Compute.** Cap = per-beneficiary cap × beneficiaries. Overpayment = payments − cap,
if positive. Per-beneficiary cap: **$35,361.44 for FY2026** and **$36,174.75 for
FY2027** (route B).
**Output.** The cap, headroom or the amount over, and the per-beneficiary figure used.

### 8. `home-health-cert-clock` — Home Health Certification, Periods and OASIS

**Input.** Start-of-care date, face-to-face encounter date, and referral date.
**Compute.**
- Face-to-face: no more than 90 days before or 30 days after the start of care
  (424.22).
- 30-day payment periods (484.205) and 60-day certification periods, with
  recertification at least every 60 days.
- OASIS: initial assessment within 48 hours of referral or return home (or on the
  ordered start date); comprehensive assessment no later than day 5; updates in the last
  5 days of every 60 days (484.55).
**Output.** A dated table of periods and due windows. The LUPA visit thresholds vary by
case-mix group and are set in the annual rule, so the tool doesn't compute them.

### 9. `dme-rental-clock` — DME Capped Rental and Oxygen Clock

**Input.** Item type (capped rental or oxygen), delivery date, rental months paid, and
any breaks in use.
**Compute.**
- Capped rental: title transfers on the first day after 13 paid continuous months
  (414.229(f)).
- Oxygen: rental paid for at most 36 months of continuous use; the supplier must keep
  furnishing through the rest of the reasonable useful lifetime, which is never less
  than 5 years from delivery (414.226, 414.210(f)(1)).
**Output.** The title-transfer date or the end of the rental and of the supplier's
obligation, and when replacement becomes possible.
**Also.** A standard-written-order completeness check against the six elements in
410.38(d)(1). Whether the item needs a face-to-face encounter and an order before
delivery comes from the CMS required list (reader confirms, or route B once the list's
machine-readable source is found; the list URL returned 404 during research).

### 10. `irf-compliance-clock` — Inpatient Rehabilitation Timing and Intensity

**Input.** Admission date and time, pre-admission screening date and time, first
therapy session time, and daily therapy minutes for the first weeks.
**Compute.**
- Pre-admission screening within the 48 hours before admission (or updated within
  them) (412.622(a)(4)).
- Therapy begins within 36 hours from midnight of the admission day (412.622(a)(3)).
- Intensity: 3 hours a day at least 5 days a week, or 15 hours over 7 days where
  documented.
- IRF-PAI admission assessment: days 1–3, completed by day 4, encoded by the 7th day
  after completion, and transmitted within 7 days of encoding (412.610, 412.614).
**Output.** Met or not, for each rule, with the dates.
**Note.** The 24-hour post-admission physician evaluation isn't in the current
412.622, and the tool doesn't check it.

## Sources

eCFR (current September 2026): 42 CFR 405.1200–405.1212, 409.30, 409.60, 409.61,
410.38, 412.3, 412.610, 412.614, 412.622, 413.343, 414.210, 414.226, 414.229, 418.21,
418.22, 418.24, 418.309, 424.22, 484.55, 484.205, 489.20(y). CMS Pub. 100-04 chapter 30
(revision 12934). FY2026 and FY2027 hospice final rules. CMS-4204-F and MLN MM13846.

## Tests

- `nomnc-deadline`: a Friday last covered day gives a Wednesday deadline.
- `snf-qualifying-stay`: 2 inpatient midnights after an observation night don't
  qualify; the day-31 SNF admission misses the window.
- `hospice-period-clock`: the 3rd period's encounter window closes on the
  recertification date.
- `dme-rental-clock`: a break in use. Whether a break restarts the rental count is
  governed by the break-in-need rules, which weren't read during research. Read and
  cite them at build; until then the tool asks the reader rather than deciding.

## Build status

- **Built 2026-09-26:** `moon-deadline`, `nomnc-deadline`, `snf-qualifying-stay`, `hospice-period-clock`, each read
  against the eCFR (42 CFR 489.20(y), 405.1200-405.1202, 409.30, 409.60, 409.61, 418.21, 418.22). The SNF
  coinsurance ($217 in 2026) is a dated value tracked by the `billing-medicare-cost-share` ledger row. The
  hospice face-to-face window is counted from the recertification (the tool shows its start if recertifying
  on the period's first day), as 418.22(a)(4) words it.
- **Built 2026-09-26:** `im-notice-timing` (42 CFR 405.1205, with the 7-day pre-admission and 4-hour limits
  read in Pub. 100-04 ch. 30 sec. 200.3.4) and `hospice-aggregate-cap` (418.309; the FY2026 and FY2027 cap
  amounts confirmed in the CMS-1851-F fact sheet, new ledger row `medicare-hospice-cap`). The cap tool also
  gives the self-determination filing deadline, 5 months after the cap year (418.308(c)).
- **Not yet built:** `mcsn-appeal-rights`, `home-health-cert-clock`, `dme-rental-clock`, `irf-compliance-clock`.
