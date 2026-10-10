# spec-v1638 — The pharmacy as a business and as a regulated Medicare/Medicaid provider

**Status:** Proposed, October 10, 2026. Specs only; nothing here is built. 28 new tools, none build-gated.
**Charter:** [spec-v1627](spec-v1627.md). **Machinery:** [spec-v1628](spec-v1628.md). **Ledger:** [scope-pharmacy-practice.md](scope-pharmacy-practice.md).

An independent pharmacy owner, a long-term-care consultant pharmacist, a managed-care pharmacist
and a pharmacy biller all work from the same handful of federal rules: Part D's pharmacy rules in
42 CFR Part 423, Medicaid's payment limits in Part 447, the nursing-home pharmacy rule at 42 CFR
483.45, and a few Part B fee rules. The catalog already prices claims and measures adherence. It
does not yet compute any Part D pharmacy rule (medication therapy management, transition fills,
short-cycle dispensing, daily cost sharing, opioid edits, drug management programs, prompt pay),
any nursing-home pharmacy rule, any Medicaid payment limit, or any of the owner's own arithmetic.
This wave does that with 28 tools: 22 in group Q, 4 in group H (the long-term-care set), 1 in
group B and 1 in group J. It also names 5 backfills to live tools.

## Gap finder

**Method.** Read in the eCFR renderer (Title 42 current to October 8, 2026): 423.100, 423.104,
423.120, 423.153, 423.154, 423.186, 423.505, 423.520, 414.1001, 410.26, 410.38, 424.57, 447.502,
447.512, 447.514, 447.518, 456.703, 483.5, 483.45. Read at cms.gov: the CY2025, CY2026 and CY2027
MTM memos, the CY2027 opioid safety edit memo, the opioid safety edit FAQ (July 5, 2024), the
pharmacist opioid sheet, the Part D drug management program guidance (Rev. 7, December 16, 2025;
Rev. 4 was read first) and its 2026 FAQ, the CY2027 bidding instructions, the 2026 and 2027 Star
Ratings Technical Notes, the 2026 Display Measures Technical Notes, the CY2026 Patient Safety
memo, State Operations Manual Appendix PP (Rev. 232, July 23, 2025), Prescription Drug Benefit
Manual chapter 6, MLN909188 (June 2025) and the CMS glucose-supply compliance page. Read in the
Medicare Coverage Database export: LCD L33822 and Policy Article A52464. Read at cdc.gov: the
"Timing and Spacing of Immunobiologics" page, as raw text. Read at federalregister.gov: the dates
of 87 FR 27704 and the Star Ratings section of 91 FR 17384. Read at data.medicaid.gov: the ACA
Federal Upper Limits dataset and two rows of it.

**Catalog sweep.** `catalog.tsv` (2,059 rows) searched for: mtm, medication therapy, transition,
short-cycle, long-term care, nursing home, opioid, mme, statin, polypharmacy, anticholinergic,
benzodiazepine, insulin, vaccine, immunization, DIR, effective rate, concession, prompt pay,
interest, margin, markup, break-even, turnover, inventory, reorder, days on hand, dispensing fee,
supply fee, nebulizer, test strip, chronic care, CCM, TCM, FUL, upper limit, medicaid,
psychotropic, antipsychotic, dose reduction, regimen review, med pass, error rate, MDS, tamper,
usual and customary, clawback, discount card, DMEPOS, supplier, partial fill, daily cost, prorate,
generic dispensing, star, interval, grace. Every proposed id was checked against every live id:
no collisions.

**What the catalog already has here.** Group Q: `340b-*` (six), `nadac-margin`,
`pharmacy-spread-check`, `pbm-reimbursement-check`, `mfp-refund-check`, `mfp-refund-reconcile`,
`partd-year-cost`, `m3p-monthly-bill`, `partd-mfp-price-check`, `pdc-star`, `mpr-gap-days`,
`adherence-outreach-list`, `med-sync-plan`, `quantity-limit-check`, `substitution-check`,
`therapy-cost-compare`, `copay-card-runout`, `refill-eligible-date`, `days-supply`. Group B:
`medicaid-ura`, `asp-payment`, `ndc-hcpcs-units`, `drug-wastage`. Group C: the Part D penalty,
coverage and appeal clocks, `part-b-or-d`, `part-b-drug-coinsurance`. Group F: `opioid-mme`.
Group H: `dme-rental-clock`, `snf-qualifying-stay`. Groups E/G: `drug-burden-index`,
`anticholinergic-burden`, `anticholinergic-risk-scale`. Nothing in the catalog computes a
nursing-home pharmacy rule, and there is no pharmacy finance tool. There is no care-management
billing tool either (the time tools are `em-time`, `critical-care-time`, `prolonged-services`).

**Near neighbors.**

| Proposed | Live neighbor | Difference |
|---|---|---|
| `partd-daily-cost-share` | `med-sync-plan` | The live tool computes short-fill quantities and prints one sentence that Part D plans charge a daily cost-sharing rate (423.153(b)(4)); it does not compute the amount. The new tool computes it, and `med-sync-plan` gets a backfill that hands off |
| `partd-insulin-cost-cap` | `partd-year-cost` | The live tool only prints a sentence that insulin is capped at $35; it does not compute the three-way "lesser of" or the multi-month rule |
| `partd-opioid-safety-edit` | `opioid-mme` | `opioid-mme` gives a daily MME against the CDC guideline. The new tool takes that MME and says which Part D point-of-sale edit fires and what overrides it |
| `partd-dmp-criteria-check` | `opioid-mme`, `opioid-risk-tool` | Neither counts prescribers and pharmacies; the OMS criteria are a claims-history rule, not a clinical score |
| `partd-concurrent-use-measures` | `pdc-star`; `anticholinergic-burden`, `drug-burden-index` | `pdc-star` computes days covered for one class; the new tool computes days of **overlap between** classes. The burden scales sum a drug list on one day and ignore fill dates |
| `supd-measure` | `pdc-star` | A different measure (any statin fill among people with two diabetes fills), not adherence |
| `medicaid-ful-check` | `nadac-margin` | `nadac-margin` reads NADAC; the FUL is a different federal file with a different rule (175% of weighted AMP, floored at NADAC) |
| `medicaid-drug-payment-check` | `pbm-reimbursement-check`, `medicaid-ura` | The live check applies one contract formula; Medicaid fee-for-service pays the **lowest** of several federal limits. `medicaid-ura` is the manufacturer rebate, not the pharmacy payment |
| `pharmacy-effective-rate` | `pbm-reimbursement-check`, `nadac-margin` | Both live tools judge one claim against a per-claim formula. An effective-rate guarantee is settled in aggregate over a period, so only a period total can test it |
| `cost-of-dispensing` | `nadac-margin` | `nadac-margin` gives ingredient margin; it does not know what it costs the pharmacy to fill a prescription |
| `dmepos-refill-window` | `refill-eligible-date`, `dme-rental-clock` | `refill-eligible-date` applies a plan's percentage threshold; DMEPOS refills follow a fixed calendar-day rule in 42 CFR 410.38(d)(4). `dme-rental-clock` counts rental months |
| `partb-supply-dispensing-fee` | `asp-payment` | `asp-payment` pays the drug; the supplying and dispensing fees are separate fixed amounts in 414.1001 |
| `ccm-time-units` | `em-time`, `prolonged-services`, `critical-care-time` | Same shape (minutes to codes and units), different service; none covers care management |
| `med-pass-error-rate` | `fmea-rpn`, `proportion-ci` | `fmea-rpn` is unrelated arithmetic; `proportion-ci` gives an interval for any proportion but knows nothing of opportunities, the 5% line or the no-rounding rule. No live tool computes the survey rate; the new tool links to `proportion-ci` for the interval |
| `partd-prompt-pay-clock` | `timely-filing`, `pa-turnaround` | Those are claim-filing and decision clocks; none computes the payment due date or interest owed to a pharmacy |
| `partd-transition-fill` | `partd-coverage-clock` | The coverage clock times an exception decision; the transition tool says whether a temporary supply is owed meanwhile, and how much |
| `vaccine-interval-validity` | `who-rabies-pep`, `td-pregnancy-schedule` | Those are fixed schedules for one vaccine; the new tool checks any reader-entered minimum interval against the CDC grace-period arithmetic and ships no schedule |

## Tools

### Part D

### 1. `mtm-eligibility-check` — Does This Member Meet the Part D MTM Targeting Criteria?

Group Q.
**Input.** Plan year; the plan's own settings (minimum chronic diseases: 2 or 3; minimum Part D
drugs: 2 through 8; whether the plan counts all Part D drugs or maintenance drugs only; any
chronic diseases the plan adds); the member's chronic diseases checked against the ten core
diseases; count of Part D maintenance drugs (and of all Part D drugs); projected annual covered
Part D drug cost; whether the member is an at-risk beneficiary under a drug management program.
**Compute.**
- Group 1 (all three): chronic diseases ≥ the plan's minimum (the plan may not require more than
  3); Part D drugs ≥ the plan's minimum (the plan may not require more than 8); projected annual
  cost ≥ the year's MTM cost threshold.
- Group 2: an at-risk beneficiary with an active coverage limitation is targeted regardless of
  group 1.
- A plan setting above the federal maximum (4 diseases, 9 drugs) is reported as not permitted.
- Cost threshold (route B dated constant): **$1,623 for 2025; $1,276 for 2026; $1,340 for 2027.**
  The cost counted is ingredient cost, dispensing fee, sales tax and vaccine administration fee,
  plan-paid plus enrollee cost sharing.
- The ten core diseases: Alzheimer's disease; bone disease-arthritis; chronic congestive heart
  failure; diabetes; dyslipidemia; end-stage renal disease; HIV/AIDS; hypertension; mental
  health; respiratory disease.
**Output.** Targeted or not, which group, each test with the member's value beside the
threshold, and the first failing test.
**Source.** 42 CFR 423.153(d)(2); CMS memos "Contract Year 2025/2026/2027 Part D Medication
Therapy Management Program Guidance and Submission Instructions" (May 6, 2024; May 6, 2025;
May 1, 2026).
**Data.** The threshold is set each spring from the prior year's claims and published in the
MTM memo (the CY2027 memo is dated May 1, 2026; the CY2028 figure is expected in April or May
2027). Page watch on the CMS MTM page. From January 1, 2028 the tool asks for the 2028 figure.
**Scope.** Does not decide which drugs are "maintenance" (the rule points sponsors to a
commercial database); the reader supplies the counts.

### 2. `mtm-service-clock` — MTM Review Due Dates and CMR Completion Rate

Group Q.
**Input.** Per enrollee (form or CSV): MTM enrollment date, whether enrolled in the prior
contract year, date of the last comprehensive medication review (CMR) offer, CMR dates, targeted
medication review (TMR) dates, opt-out date, date of birth, hospice flag, date the member met
the CMS targeting criteria.
**Compute.**
- CMR offer due: for a newly targeted member, no later than 60 days after MTM enrollment; for a
  member carried over from the prior year, within one year of the last CMR offer.
- TMR: at least quarterly, starting at enrollment; the tool lists each calendar quarter of
  enrollment with no TMR.
- Annual CMR: flags an enrollee with no CMR in the contract year.
- CMR completion rate (CMS method): denominator = enrollees aged 18 or older at the start of the
  period, meeting the CMS targeting criteria, enrolled in MTM at least 60 days (the enrollment
  date counts toward the 60; the opt-out date does not), not in hospice at any point; an enrollee
  with under 60 days counts in both numerator and denominator only if they received a CMR.
  Numerator = denominator members with a CMR during their MTM enrollment in the period. A CMR
  received after MTM enrollment but before the member met the CMS criteria counts. A rate needs
  at least 31 in the denominator.
**Output.** A worklist sorted by days left to the CMR-offer deadline; missing TMR quarters; the
completion rate with counts and each exclusion reason.
**Source.** 42 CFR 423.153(d)(1)(vi)–(vii); CMS CY2025 MTM memo (the 60-day and one-year offer
expectations, "at least quarterly"); CMS 2026 Star Ratings Technical Notes, measure D11.
**Note.** The 60-day CMR offer is CMS guidance ("should"), not regulation text; the tool labels
it so. **The CMR completion measure is not in the 2027 Star Ratings.** The 2027 Technical Notes
say it "was transitioned to the display page for measurement years 2025 and 2026 and will return
to the Star Ratings as a new measure beginning with the 2029 Star Ratings (measurement year
2027)". The tool states that status by measurement year and prints no star cut points.

### 3. `partd-transition-fill` — Is a Part D Transition Supply Owed, and How Much?

Group Q.
**Input.** The member's coverage effective date under the plan (for a continuing member whose
drug is affected by a formulary change across contract years, January 1 of the new contract
year); date of the fill request; whether the drug is
non-formulary, or on formulary with prior authorization or step therapy; the plan's approved
month's supply in days (reader input, commonly 30); days already supplied under transition for
this drug; days written on the prescription; long-term-care resident yes/no; date the temporary
fill adjudicated.
**Compute.**
- Window: day 1 through day 90 of coverage under the new plan. The window applies to retail,
  home infusion, long-term care and mail-order pharmacies. The rule also covers current
  enrollees affected by formulary changes; the manual (§30.4.5) has the sponsor provide that
  supply "beginning January 1", so the tool counts a continuing member's 90 days from January 1
  and labels that as manual guidance.
- Amount: a one-time temporary supply of at least the approved month's supply, unless the
  prescription is written for less; then multiple fills up to a total of one approved month's
  supply. Remaining = approved month's supply − days already supplied.
- Not owed: for an immediate formulary change permitted under 423.120(e)(2).
- Notice: written notice within 3 business days after adjudication of the temporary fill (for a
  long-term-care resident dispensed in increments of 14 days or less, within 3 business days of
  the **first** temporary fill).
- Outside the 90 days, long-term-care resident: an emergency supply of at least 31 days (unless
  written for less) while an exception or authorization request is processed; one per drug per
  stay (CMS manual, see Note).
**Output.** Owed or not, days still owed, the last day of the window, the notice deadline, and
which rule gave each answer.
**Source.** 42 CFR 423.120(b)(3)(i)–(vi); Medicare Prescription Drug Benefit Manual ch. 6
§§30.4.5 and 30.4.6 (Rev. 18, January 15, 2016).
**Note.** The manual chapter still says the long-term-care transition supply is 91 to 98 days
and the retail supply 30 days; the regulation as it stands today says "at least an approved
month's supply" for everyone. The tool follows the regulation and says the manual predates it.
The 31-day emergency supply exists only in the manual; the tool cites it as manual guidance.

### 4. `ltc-short-cycle-check` — Long-Term Care 14-Day Dispensing Check

Group Q.
**Input.** Brand or generic; solid oral dose yes/no; antibiotic yes/no; dispensed in its
original container per the FDA label, or customarily in original packaging for adherence (for
example an oral contraceptive) yes/no; facility type (nursing facility; intermediate care
facility for individuals with intellectual disabilities; institute for mental disease; Indian
Health Service, tribal or urban Indian pharmacy); days supply to dispense; total days ordered.
**Compute.** A brand-name solid oral drug for a Part D enrollee in a long-term-care facility
may be dispensed in increments of no more than 14 days. Excluded: solid oral antibiotics, and
solid oral doses dispensed in the original container. Waived: the three facility and pharmacy
types above. Generics and non-solid forms are outside the rule. Number of dispensing events =
ceiling(total days ÷ 14).
**Output.** In scope or not and why; whether the proposed days supply complies; the dispensing
events needed; a line that the sponsor may not prorate dispensing fees by days supply or
quantity to penalize a more efficient technique (the waiver for the three facility and pharmacy
types does not lift that fee rule: 423.154(c) keeps (a)(2) and (a)(3) in force).
**Source.** 42 CFR 423.154(a)–(c).

### 5. `partd-daily-cost-share` — Part D Cost Sharing for a Short Fill

Group Q.
**Input.** The plan's monthly copayment or coinsurance percentage for the drug; the approved
month's supply in days; days actually dispensed; the drug's price (for coinsurance); solid oral
dose yes/no; antibiotic yes/no; original-container product yes/no.
**Compute.** Daily cost-sharing rate = monthly copayment ÷ days in the approved month's supply,
**rounded to the nearest cent**. Short-fill copayment = daily rate × days dispensed. For
coinsurance the percentage is applied unchanged to the supply actually dispensed. The rule
applies only to a solid oral dose that may be dispensed for less than a month's supply; it
does not apply to solid oral antibiotics or to solid oral doses dispensed in the original
container.
**Output.** The daily rate, the cost sharing owed for the short fill, and whether the drug is in
or out of the rule.
**Source.** 42 CFR 423.153(b)(4); 42 CFR 423.100 ("daily cost-sharing rate").
**Note.** Rounding is at the daily rate, before multiplying; a $47 copay over 30 days is $1.57 a
day and $21.98 for 14 days, not $21.93. CMS's own example: a $30 monthly copayment gives $7 for
a 7-day supply, and the rule applies when the opioid-naive edit (tool 7) cuts a solid oral
opioid fill to 7 days (CMS opioid safety edit FAQ, July 5, 2024, Q15).

### 6. `partd-insulin-cost-cap` — Part D Insulin Cost-Sharing Cap

Group Q.
**Input.** Plan year (2026 or later); days supply; the plan's month's supply in days; the plan's
negotiated price for the fill; the maximum fair price for a one-month supply, if the insulin has
one (linked from `partd-mfp-price-check`); the cost sharing the claim charged.
**Compute.** Per one-month supply the cap is the lesser of (1) $35, (2) 25% of the maximum fair
price, (3) 25% of the negotiated price. For a fill longer than one month, the cap is that amount
times the fewest one-month increments needed to cover the days supply = ceiling(days ÷ month's
supply). No deductible applies. The cap applies before the member reaches the out-of-pocket
threshold, in and out of network.
**Output.** The cap, which of the three amounts set it, and the overcharge if the claim charged
more.
**Source.** 42 CFR 423.120(h); 42 CFR 423.100 ("covered insulin product applicable cost-sharing
amount").
**Scope.** Covered insulin products only; a compounded product containing insulin is excluded
by the definition. ACIP-recommended adult vaccines are $0 with no deductible (423.120(g)); that
is a constant, so it is a sentence in the result, not a tool.

### 7. `partd-opioid-safety-edit` — Which Part D Opioid Safety Edit Applies?

Group Q.
**Input.** Cumulative daily MME across the member's active opioid prescriptions (from
`opioid-mme`); days supply of the new opioid prescription; whether the member filled an opioid
within the plan's lookback (the plan's lookback in days is reader input); the plan's settings
(prescriber and pharmacy counts on the care-coordination edit and on the hard MME edit, if any;
whether the plan uses the optional 200 MME hard edit); number of opioid prescribers and
pharmacies; concurrent benzodiazepine yes/no; more than one long-acting opioid yes/no;
exemptions (long-term-care resident, hospice, palliative or end-of-life care, sickle cell
disease, cancer-related pain).
**Compute.**
- Exempt: any of the five exemptions; no edit should apply.
- Care-coordination edit: cumulative MME **reaches or exceeds 90** per day (and the plan's
  prescriber/pharmacy counts, if it set any).
- Optional hard edit: cumulative MME of 200 or more, where the plan uses it (and the plan's
  prescriber/pharmacy counts, if it set any).
- Opioid-naive hard edit: no opioid fill in the lookback and a days supply over 7; up to 7 days
  may be dispensed.
- Soft edits: concurrent opioid and benzodiazepine (the edit runs both ways: it applies to an
  opioid claim and to a benzodiazepine claim); duplicative long-acting opioids.
**Output.** Each edit: fires or not, and the route past it CMS describes (pharmacist override
after prescriber consultation for the care-coordination edit; a coverage determination for a
hard edit; an override where the pharmacy knows of an exemption). A fixed line: these
thresholds are not prescribing limits.
**Source.** CMS memo "Contract Year (CY) 2027 Medicare Part D Opioid Safety Edits – Submission
Instructions, Recommendations, and Reminders" (July 2, 2026); CMS, "Medicare Part D Opioid
Policies: Information for Pharmacists" (September 2024); CMS, "Frequently Asked Questions (FAQs)
about Formulary-Level Opioid Point-of-Sale (POS) Safety Edits" (as of July 5, 2024, updating the
December 19, 2022 version).
**Note.** The opioid-naive lookback is "designated by the Part D sponsor" (FAQ Q13); CMS says
only "generally 60-90 days" and gives no fixed definition of opioid-naive. It is reader input
and is never defaulted. CMS recommends a count of 2 or more opioid prescribers where a plan adds
counts to an MME edit; that is a recommendation to plans, so the count stays reader input.
Buprenorphine for opioid use disorder "should not be impacted"; the tool says so and leaves MME
to `opioid-mme`.
**Data.** Route B, edition CY2027, page watch on the CMS RxUtilization page; the memo is
reissued each summer (CY2026: July 3, 2025; CY2027: July 2, 2026).

### 8. `partd-dmp-criteria-check` — Does This Member Meet the Drug Management Program Criteria?

Group Q.
**Input.** Over the most recent 6 months: the highest average daily MME (buprenorphine left out
of the MME), number of opioid prescribers (those sharing one tax identification number counted
once), number of opioid dispensing pharmacies (locations sharing real-time data counted once),
any Part D opioid fill other than medication for opioid use disorder; a medical claim with a
primary diagnosis of opioid-related overdose in the most recent 12 months yes/no; exemptions
(hospice, palliative or end-of-life care; resident of a long-term-care facility, of an
intermediate care facility described in section 1905(d) of the Act, or of another facility
served by a single contracted pharmacy; cancer-related pain; sickle cell disease).
**Compute.**
- Exempt beneficiary: any exemption; cannot be a potential at-risk beneficiary.
- Minimum criterion 1: average daily MME **greater than 90** for any duration in the most recent
  6 months AND (3 or more opioid prescribers AND 3 or more opioid dispensing pharmacies, OR 5 or
  more opioid prescribers regardless of pharmacies).
- Minimum criterion 2: an opioid-related overdose claim in the most recent 12 months AND a Part
  D opioid prescription (not medication for opioid use disorder) in the most recent 6 months.
- Supplemental (sponsor's option): any opioid use in the most recent 6 months AND (7 or more
  opioid prescribers OR 7 or more opioid dispensing pharmacies).
- All buprenorphine products count toward the prescriber and pharmacy counts though not toward
  MME.
**Output.** Meets minimum criterion 1, 2, the supplemental criteria, or none; each count beside
its threshold; a line that a member who meets none cannot be placed in a program.
**Source.** 42 CFR 423.153(f)(16); 42 CFR 423.100 ("exempted beneficiary", "potential at-risk
beneficiary"); CMS, "Part D Drug Management Programs" guidance, Rev. 7 (December 16, 2025,
implemented January 1, 2026) §§4.1–4.2; CMS drug management program FAQ (revised December 16,
2025, effective January 2026).
**Note.** Criterion 1 is "> 90", while the point-of-sale edit in tool 7 is "reaches or exceeds
90". The two differ at exactly 90 and the tool keeps them apart. The criteria text is word for
word the same in Rev. 4 (November 28, 2022) and Rev. 7. Route B, edition CY2026; CMS reissues the
guidance each winter, with a page watch on the CMS overutilization page.

### 9. `partd-dmp-notice-clock` — Drug Management Program Notice and Limitation Dates

Group Q.
**Input.** Date of the initial notice; date of the sponsor's determination (CMS guidance: the
date the limitation is implemented); whether the member was found exempt; effective date of the
limitation; whether it was extended; dates of the sponsor's attempts to reach prescribers; date
the second notice was sent, if it was.
**Compute.**
- Member's response period: 30 days from the initial notice.
- Second notice (or alternate second notice): not earlier than 30 days after the initial notice,
  and not later than the earlier of 3 days after the determination or 60 days after the initial
  notice. For a member found exempt, the alternate second notice is due within 3 days of that
  determination even inside the 30 days.
- A non-exempt determination dated earlier than day 27 leaves no date that meets both limits;
  the tool flags that conflict and prints no notice date for it.
- Prescriber outreach: 3 attempts within 10 business days satisfies the requirement to seek
  prescriber agreement (a prescriber limitation still cannot be imposed if no prescriber
  responded).
- Limitation ends: one year from its effective date, or two years if extended on a clinical
  basis with a new notice.
- Reporting to CMS: within 7 days of the initial or second notice, or of a termination.
**Output.** Each date, and any notice already sent outside its window.
**Source.** 42 CFR 423.153(f)(4)(ii), (f)(5)(ii)(C)(4), (f)(8), (f)(14), (f)(15)(ii)(D); CMS,
"Part D Drug Management Programs" guidance, Rev. 7 (December 16, 2025) §8.2.1, for the
determination date and the day-59 and day-60 examples.
**Note.** The regulation counts "days", not business days, for every clock here except the 10
business days of prescriber outreach.

### 10. `partd-prompt-pay-clock` — Part D Prompt Payment Due Date and Interest

Group Q.
**Input.** Pharmacy type (retail network; mail-order; long-term care); electronic or other
claim; date transferred (electronic), or postmark or time-stamp date (other); date of any
deficiency notice; date additional information was received; date paid; claim amount; the
interest rate for the period (reader input).
**Compute.**
- The rule covers network pharmacies **other than mail-order and long-term-care pharmacies**;
  for those two the tool stops and says so.
- Received: electronic, the date transferred; other, the 5th day after the postmark or the
  transmission time stamp, whichever is sooner.
- Payment due: 14 days after receipt (electronic) or 30 days (other).
- Deemed clean: if no deficiency notice within 10 days (electronic) or 15 days (other) of
  receipt; after additional information, if no notice of a remaining defect within 10 days.
- Paid on: the date the payment is transferred (electronic) or handed to the Postal Service or a
  carrier (other).
- Interest: from the day after the due date through the payment date, at the weighted average of
  interest on 3-month marketable Treasury securities for the period plus 0.1 percentage point.
  Interest = amount × (rate + 0.1 point) × late days ÷ 365.
**Output.** The due date, whether the claim is deemed clean, days late and interest owed.
**Source.** 42 CFR 423.520(a)–(e).
**Note.** The rule does not state a day-count basis; the tool uses 365 and says that is its
assumption. The Treasury rate is not shipped. Long-term-care pharmacies have a separate
contract term: not less than 30 nor more than 90 days to **submit** claims (423.505(b)(20)); the
result names it for that pharmacy type. The pricing-standard update rule (423.505(b)(21): on
January 1 and at least every 7 days) is printed as a related fact, not computed.

### 11. `partd-concurrent-use-measures` — Concurrent-Use Safety Measures (COB, Poly-ACH, Poly-CNS)

Group Q.
**Input.** A fill history (patient reference, fill date, days supply, active ingredient, and a
**reader-assigned class** per fill: opioid, benzodiazepine, anticholinergic, CNS-active), date
of birth, enrollment months, and exclusion flags. Upload workbench or a one-patient form.
**Compute** (measurement period = the calendar year; continuous enrollment allows one gap of up
to one calendar month).
- **COB.** Denominator: age 18 or older, at least 2 opioid claims on different dates of service,
  at least 15 cumulative days' supply of opioids, and an index date at least 30 days before the
  end of the period. Numerator: denominator members with at least 2 benzodiazepine claims on
  different dates and overlapping days' supply of an opioid and a benzodiazepine for at least 30
  cumulative days. Excluded: hospice, cancer diagnosis, sickle cell disease, palliative care,
  cancer-related pain treatment.
- **Poly-ACH.** Denominator: age 65 or older with at least 2 claims on different dates for the
  same anticholinergic medication, the earliest at least 30 days before the end of the period.
  Numerator: concurrent use of 2 or more unique anticholinergic medications, each with at least
  2 claims on different dates, overlapping for at least 30 cumulative days. Excluded: hospice.
- **Poly-CNS.** Same shape with 3 or more unique CNS-active medications; denominator age 65 or
  older with 2 claims of the same CNS-active medication. Excluded: hospice, seizure disorder.
  The 2026 display notes state no index-date cutoff for Poly-CNS, so the tool applies none.
- A lower rate is better for all three.
**Output.** Per patient: in the denominator or not (with the reason), cumulative overlap days,
and numerator status per measure; per measure: the rate and counts; a CSV.
**Source.** CMS 2027 Star Ratings Technical Notes (September 30, 2026), measures D12 (COB) and
D13 (Poly-ACH); CMS 2026 Display Measures Technical Notes (December 16, 2025), DMD14 (Poly-CNS).
**Licensing.** Same posture as `pdc-star` ([spec-v1513](spec-v1513.md)): the method is taken
from CMS's public text; the tool ships no PQA specification and no value set, and the reader
assigns the class. For Poly-ACH, "the same medication" means the same anticholinergic active
ingredient (CY2026 Patient Safety memo). CMS posts
PQA value-set workbooks beside the notes; their terms are unread (Verify at build).
**Edition.** COB and Poly-ACH entered the Star Ratings with the 2027 ratings (measurement year
2025, weight 1); Poly-CNS is a display measure. CMS rates a contract on COB, Poly-ACH or SUPD
only with 30 or more members in the denominator; the tool prints the rate for any count and says
so below 30. Route B, tied to the Star year.

### 12. `supd-measure` — Statin Use in Persons with Diabetes (Star Method)

Group Q.
**Input.** A fill history with a reader-assigned class (diabetes medication, statin, PCSK9
inhibitor, bempedoic acid), date of birth, enrollment months, exclusion flags.
**Compute.** Denominator: continuously enrolled, age 40 to 75, at least 2 diabetes medication
fills on different dates, with the first diabetes fill at least 90 days before the end of the
period. Numerator: any statin fill in the period. Excluded: hospice; end-stage renal disease or
dialysis; rhabdomyolysis or myopathy; pregnancy, lactation or fertility treatment; cirrhosis;
pre-diabetes; polycystic ovary syndrome. From measurement year 2026: a member with no statin
claim but a PCSK9 inhibitor or bempedoic acid claim is a denominator exception.
**Output.** Per patient: denominator status, the reason if out, and whether a statin fill
exists; a gap list (in the denominator, no statin); the rate.
**Source.** CMS 2027 Star Ratings Technical Notes, measure D11; CMS CY2026 Patient Safety memo
(April 2026) for the measurement-year 2026 exception.
**Note.** The tool lists the gap; it does not say a statin should be prescribed.

### 13. `partd-opioid-measures` — Opioid Display Measures (High Dosage, Multiple Providers, Initial Long Duration)

Group Q.
**Input.** An opioid fill history with fill date, days supply, MME per day for each fill,
prescriber and pharmacy references; date of birth; enrollment months; exclusion flags.
**Compute.**
- **OHD.** Denominator: age 18 or older, at least 2 opioid claims on different dates and at
  least 15 cumulative days' supply over 90 days or longer. Numerator: average daily MME of 90 or
  more over the opioid episode (which starts at the first opioid claim; enrollment must run at
  least 90 days from it).
- **OMP.** Same denominator. Numerator: opioids from 4 or more prescribers AND 4 or more
  pharmacies within 180 days or less.
- **IOP-LD.** Denominator: age 18 or older with an opioid claim and no opioid claim in the 90
  days before it. Numerator: more than 7 cumulative days' supply within the 3-day initiation
  period (the first fill date plus 2 days).
- Rates are weighted by member-years. Excluded from OHD and OMP: hospice, cancer, sickle cell
  disease, palliative care. Excluded from IOP-LD: the same four, counted during the measurement
  period or the 90 days before the initial fill.
**Output.** Per patient and per measure, with the episode dates and counts.
**Source.** CMS 2026 Display Measures Technical Notes, DMD11, DMD12, DMD15.
**Note.** Three thresholds live near each other and all differ: the safety edit is "≥ 90 MME on
a day" (tool 7), the OMS criterion "> 90 average in 6 months with 3+/3+ or 5+" (tool 8), and
OHD "≥ 90 average over 90 days or more". Each tool names the other two.

### Part B and pharmacist services

### 14. `partb-supply-dispensing-fee` — Part B Supplying and Dispensing Fees

Group Q.
**Input.** Drug category (immunosuppressive; oral anticancer; oral antiemetic; inhalation drug
through durable medical equipment); for the first three: whether this is the beneficiary's first
prescription in the 30-day period, and for an immunosuppressive whether it is the initial
prescription in the first 30 days after a transplant; for inhalation drugs: 30-day or 90-day
supply and whether it is the initial 30-day supply; number of prescriptions.
**Compute.**
- Supplying fee: $24 for the first prescription (no more often than once every 30 days); $16
  for each prescription after the first in that period; $50 for the initial immunosuppressive
  prescription in the first 30 days after a transplant. A separate fee is paid per prescription.
- Inhalation dispensing fee: $57 for the initial dispensed 30-day supply; $33 for each other
  30-day supply; $66 for each 90-day supply; regardless of partial shipments.
**Output.** The fee for each prescription and the total.
**Source.** 42 CFR 414.1001 (fees fixed "beginning in CY 2006"; section last amended December
9, 2024).
**Note.** These are regulation constants, not annual figures; no expiry, with a page watch on
the section. The $24 and $16 fees are often described as oral-anticancer fees only; the rule
gives the same fees to all three drug categories and adds the $50 transplant fee.

### 15. `dmepos-refill-window` — DMEPOS Refill Contact and Delivery Window

Group Q.
**Input.** Date of the last delivery or shipment; quantity; daily use (or the expected end date
of the current supply); date the supplier contacted the beneficiary; planned delivery or
shipping date.
**Compute.** Expected end of supply = last date of service + quantity ÷ daily use. The contact
and affirmative response must fall within 30 calendar days before the expected end. The date of
service of the refill may be no earlier than 10 calendar days before the expected end. For
shipped items the date of service is the shipping date (the label date or the pickup date).
**Output.** The earliest contact date, the earliest delivery date, and whether each planned date
complies.
**Source.** 42 CFR 410.38(d)(4) (added by 88 FR 77875, November 13, 2023).

### 16. `glucose-supply-quantity-check` — Medicare Glucose Test Strip and Lancet Quantity Check

Group Q.
**Input.** Insulin-treated yes/no; strips and lancets ordered per 3 months (or tests per day);
whether the two basic coverage criteria are met (the beneficiary has diabetes; the treating
practitioner has concluded the beneficiary or caregiver is trained on the device); date of the
treating practitioner's last in-person or Medicare-approved telehealth visit that evaluated
diabetes control and the need for the quantity; date adherence to the high-use regimen was last
verified; spring-powered lancing devices in the last 6 months; quantity to dispense now.
**Compute.**
- Usual utilization: up to 100 test strips and up to 100 lancets every 3 months when not
  currently treated with insulin; up to 300 and 300 when treated with insulin, whether the
  diagnosis is type 1 or type 2.
- Above that, all three: (a) the basic coverage criteria are met; (b) the visit fell within the
  6 months before the order for the higher quantity; (c) the treating practitioner verifies
  adherence to the high-utilization regimen every 6 months.
- If (a) through (c) are not met, the amount above usual utilization is denied as not
  reasonable and necessary. If neither basic criterion is met, all testing supplies are denied.
- More than one spring-powered lancing device per 6 months is not reasonable and necessary.
- A supplier must not dispense more than a 3-month quantity of testing supplies at a time.
- Tests per day × 90 gives the 3-month quantity. Billing units: 1 unit of test strips = 50
  strips; 1 unit of lancets = 100 lancets.
**Output.** Within usual utilization or above it; if above, which conditions are met and the
date each lapses; the excess that would be denied; the claim modifier the article assigns (KX
when insulin-treated, KS when not).
**Source.** LCD L33822, "Glucose Monitors" (DME MACs; revision effective October 1, 2024,
version 70); Policy Article A52464, "Glucose Monitor - Policy Article" (version 65, effective
February 18, 2025). Both read in the Medicare Coverage Database export dated October 8, 2026,
which the repo already fetches for `lcd-diagnosis-check`. CMS, Medicare Provider Compliance
Tips, "Glucose Monitoring Supplies" restates them.
**Scope.** Home blood glucose monitor supplies only. With a non-adjunctive continuous glucose
monitor, strips and lancets are part of the monitor's supply allowance and a separate claim is
denied; the tool asks and stops there. The article also wants the record to show the
beneficiary is testing at a frequency that corroborates the quantity (a narrative statement or
a log); that is a line in the result, not a computation.
**Data.** Route B, tied to the LCD version, with a watch on the export the repo already reads.

### 17. `ccm-time-units` — Chronic Care Management Codes from Minutes

Group B.
**Input.** Minutes of clinical-staff time in the calendar month; minutes personally spent by the
billing practitioner; complex or non-complex.
**Compute.** Non-complex, clinical staff: 99490 for the first 20 minutes, 99439 for each
additional 20. Non-complex, practitioner personally: 99491 for the first 30 minutes, 99437 for
each additional 30. Complex: 99487 for the first 60 minutes, 99489 for each additional 30.
Practitioner time may count toward the staff codes if it is not used to report 99491; staff time
does not count toward 99491 or 99437. Under the threshold: nothing is billable. Complex and
non-complex codes are not reported for the same patient in one calendar month, and 99491 and
99437 are not reported in the same month as 99487, 99489, 99490 or 99439.
**Output.** The code, add-on units, the minutes used and the minutes short of the next unit; a
line that the staff codes are assigned general supervision, which is how a pharmacist working as
clinical staff furnishes them incident to the billing practitioner.
**Source.** CMS MLN909188, "Chronic Care Management Services" (June 2025); 42 CFR 410.26(b)(5).
**Licensing.** Code numbers and the time thresholds as CMS states them; no CPT descriptors.
**Note.** A pharmacist cannot bill these codes directly; the tool says who bills.

### Medicaid

### 18. `medicaid-ful-check` — Federal Upper Limit Check

Group Q.
**Input.** NDC (or ingredient, strength and form) and quantity; the state's professional
dispensing fee (reader input); optionally the weighted average AMP and NADAC to compute a limit
by hand.
**Compute.** From the file: the FUL per unit for the product group, the weighted average of
AMPs, and whether the multiplier is above 175%. By hand: FUL per unit = 175% × the weighted
average of the most recently reported monthly AMPs; where that is below the average retail
community pharmacy acquisition cost from the national survey (NADAC), the FUL is set at that
acquisition cost instead. Aggregate limit for the claim = FUL × quantity + the professional
dispensing fee.
**Output.** The FUL per unit and for the quantity, the file month, whether the NADAC floor set
it, and the pharmacy's cost against it (handing off to `nadac-margin`).
**Source.** 42 CFR 447.514(a)–(d); data.medicaid.gov dataset "ACA Federal Upper Limits"
(identifier ce4cf49b-a21b-5a53-bbc3-509414940847; public domain, usa.gov government works).
**Data.** Route A. The CSV is cumulative (2,280,950 rows back to 2019); the builder keeps only
the latest month and shards by labeler as NADAC does. Columns: product_group, ingredient,
strength, dosage, route, mdr_unit_type, weighted_average_of_amps, aca_ful, package_size, ndc,
arated, multiplier_greater_than_175_percent_of_weighted_avg_of_amps, year, month.
**Note.** The FUL is an **aggregate** limit on a state's spending (447.514(d)), not a
per-claim payment rule; the result says so in its first line. Applies only to multiple source
drugs with at least three therapeutically equivalent products; not to a brand a prescriber
certifies as medically necessary (447.512(c)).

### 19. `medicaid-drug-payment-check` — Medicaid Fee-for-Service Drug Payment (Lowest-Of)

Group Q.
**Input.** The state's actual acquisition cost for the drug (its NADAC-based, AMP-based or
survey figure: reader input, with NADAC offered from the file), the state's professional
dispensing fee, the pharmacy's usual and customary charge, the FUL where one exists (tool 18),
any state maximum allowable cost, quantity, the amount paid.
**Compute.** Payment = the lowest of: actual acquisition cost × quantity + professional
dispensing fee; the usual and customary charge; and, for a multiple source drug with a FUL,
FUL × quantity + professional dispensing fee; and any state limit entered.
**Output.** Each candidate amount, the one that sets the payment, and the difference from the
amount paid.
**Source.** 42 CFR 447.512(b); 447.514(b); 447.502 ("actual acquisition cost", "professional
dispensing fee").
**Scope.** Fee-for-service only. Managed-care plans pay by contract (`pbm-reimbursement-check`).
The federal text sets aggregate ceilings; each state's plan turns them into a per-claim
lowest-of formula, so the state's own values and any extra tier are reader input, and the result
says the state plan governs.

### Long-term care and consultant pharmacy

### 20. `ltc-mrr-tracker` — Monthly Medication Regimen Review Tracker

Group H.
**Input.** Per resident (form or CSV): admission date, anticipated stay under 30 days yes/no,
date of the last pharmacist review, date an irregularity report was sent, date the attending
physician documented a response, and the facility's own time frames in days (reader input).
**Compute.** Every resident, short-stay or long-stay, needs a pharmacist review at least once a
month. The tool lists each calendar month of the stay with no review, residents with no review
this month, and irregularity reports with no documented physician response after the facility's
own time frame.
**Output.** An overdue list sorted by days since the last review, and the open irregularity
reports.
**Source.** 42 CFR 483.45(c)(1), (c)(4), (c)(5); State Operations Manual Appendix PP, F756
(Rev. 229, effective April 25, 2025).
**Note.** The rule sets no number of days for the physician's response; it requires the facility
to set its own time frames in policy. The tool therefore asks for them and invents none. "Once a
month" is read as once per calendar month, and the result says that is the reading used.

### 21. `psychotropic-prn-clock` — PRN Psychotropic Order 14-Day Limit

Group H.
**Input.** Order start date; antipsychotic yes/no; for a non-antipsychotic: whether the
prescriber documented a rationale and a specific duration, and that duration; for an
antipsychotic: date the prescriber directly examined the resident for a new order.
**Compute.** A PRN psychotropic order is limited to 14 days: last day = start + 13. A
non-antipsychotic order may run longer only with a documented rationale and a stated duration;
the end date is then the stated one. A PRN antipsychotic order cannot be extended or renewed: a
new order needs the prescriber to evaluate the resident first, and each new order is again
limited to 14 days.
**Output.** The last valid day, days remaining, and what the record must show for the order to
continue.
**Source.** 42 CFR 483.45(e)(3)–(5); Appendix PP (Rev. 232 edition), F605, "PRN Medication Use"
table (F605 text: Rev. 229, issued April 25, 2025).
**Note.** Whether the first day counts is not stated; the tool counts the start date as day 1
(the stricter reading) and says so. A staff report to the prescriber is not an evaluation
(Appendix PP); the tool prints that line.

### 22. `gdr-attempt-check` — Gradual Dose Reduction Attempts in the First Year

Group H.
**Input.** Date the resident was admitted on the psychotropic, or the date it was started;
dates of dose-reduction attempts; date and presence of a documented clinical contraindication.
**Compute.** The CMS example of compliance: within the first year, attempts in **two separate
quarters, with at least one month between them**, unless clinically contraindicated. The tool
divides the first year into four quarters from the start date, places each attempt, and checks
both conditions. It gives the latest date a second attempt can still satisfy both.
**Output.** Met, still reachable (with the window), or not met; whether a documented
contraindication is on record instead.
**Source.** 42 CFR 483.45(e)(2); Appendix PP (Rev. 232 edition), F605, "Gradual Dose Reduction"
(F605 text: Rev. 229, issued April 25, 2025).
**Note.** **The current Appendix PP gives no schedule after the first year.** The "then
annually" rule that many facility policies carry is not in Rev. 225 or Rev. 232; the tool
reports only the first-year example and says later timing follows the facility's policy and
standards of practice. CMS words the first-year pattern as an example ("may be met if, for
example"), not a requirement, and the result keeps that wording. Whether a reduction is
clinically contraindicated is the physician's documented judgment and is not assessed. Neither
"quarter" nor "one month" is defined: the tool reads quarters as four equal parts of the first
year from the start date and "one month" as one calendar month, and says so.

### 23. `med-pass-error-rate` — Medication Administration Error Rate

Group H.
**Input.** Doses observed being administered; doses ordered but not administered; errors
observed (significant and non-significant together); how many of the errors were significant.
**Compute.** Opportunities = doses given + doses ordered but not given. Error rate = errors ÷
opportunities × 100, **not rounded up**: Appendix PP says rounding a lower rate "(e.g., 4.6%)"
to 5% is not permitted. A rate of 5% or greater does not meet 483.45(f)(1) (F759). Any
significant error fails 483.45(f)(2) (F760) whatever the rate.
**Output.** The rate to one decimal, truncated; "5% or greater" or "under 5%"; the significant
error finding; the fewest additional error-free opportunities that would bring the rate under
5%, or the number of further errors that would reach it; a link to the live `proportion-ci` for
a Wilson interval on the same counts.
**Source.** 42 CFR 483.45(f); Appendix PP (Rev. 232 edition), F759 and F760 (text: Rev. 173,
issued November 22, 2017).
**Scope.** This is the nursing-facility survey definition, and this tool is the program's one
medication error rate. A hospital may use the formula, but the 5% line is a nursing-facility
requirement only and the result says so; no federal hospital error-rate formula exists
([spec-v1636](spec-v1636.md) records that rejection). Errors found by record review rather than
observation are not counted in the rate, though a significant one is still cited at F760. Does
not classify an error as significant (CMS calls that professional judgment over the resident's
condition, the drug category and the frequency). Prints the timing rule as a fact: a dose 60 or
more minutes early or late counts only if the wrong time can cause discomfort or jeopardize
health; before-meals versus after-meals errors always count.

### Pharmacy financial math

These four are stated arithmetic on the reader's own figures, the posture of the live
`allowed-amount` and `claims-pct-medicare`. Where a federal definition exists it is used; where
none does, the tool says the formula is a convention and names it.

### 24. `pharmacy-effective-rate` — Effective Rate and Net Margin Reconciliation

Group Q.
**Input.** For a period and a payer, by brand and generic (form, or a claims CSV with a
brand/generic column): the sum of AWP, ingredient cost paid, dispensing fees paid, point-of-sale
price concessions and any later fees, acquisition cost, patient pay, and prescription count; the
contract's guaranteed rates (for example a generic effective rate of AWP − 85% and a brand
effective rate of AWP − 19%).
**Compute.**
- Effective rate = 1 − (ingredient cost paid ÷ AWP), separately for brand and generic.
- Shortfall or overage against the guarantee = (guaranteed rate − achieved rate) × AWP; a
  positive number is what a true-up would take back.
- Concessions as a percent of ingredient cost; net reimbursement per prescription = (ingredient
  cost + fees − concessions) ÷ prescriptions; net margin per prescription after acquisition
  cost; generic dispensing rate = generic prescriptions ÷ all prescriptions.
- Batch: rows where the patient paid more than the total the pharmacy was allowed to keep.
**Output.** The achieved brand and generic rates beside the guarantees, the dollar exposure at
true-up, and net margin per prescription.
**Source.** The reader's contract and remittances. For Part D since January 1, 2024, the
"negotiated price" must be the lowest possible reimbursement the pharmacy will receive in total
and must include all pharmacy price concessions (42 CFR 423.100); the result says that later
Part D clawbacks beyond the point-of-sale price are therefore unexpected, while effective-rate
true-ups in commercial contracts are not covered by that rule.
**Scope.** Ships no AWP or WAC. "Effective rate" has no federal definition; contracts differ on
which claims count (usual-and-customary claims, 340B, specialty), so the tool asks which rows
the contract includes.

### 25. `cost-of-dispensing` — Cost of Dispensing and Break-Even Volume

Group Q.
**Input.** For a period: prescriptions dispensed; the pharmacy's costs by category (pharmacist
and staff pay and benefits attributable to dispensing; counseling, coverage checks, utilization
and preferred-list review; packaging, labels and containers; delivery; the share of rent,
utilities, equipment and systems needed to operate the prescription department); the percent of
each shared cost allocated to the prescription department (reader input); average gross margin
per prescription and average variable cost per prescription.
**Compute.** Cost of dispensing per prescription = allocated costs ÷ prescriptions. Break-even
prescriptions = fixed costs ÷ (average reimbursement per prescription − average ingredient cost
− variable cost per prescription). Shortfall per prescription = cost of dispensing − dispensing
fee received.
**Output.** Cost per prescription with each category's share; the break-even count against the
actual count; the fee gap per payer if fees are entered.
**Source.** The cost categories are those in the federal definition of a professional
dispensing fee, 42 CFR 447.502 (and the parallel Part D "dispensing fees" definition, 42 CFR
423.100); 447.518(d) requires states to support fees with cost data such as a survey of
pharmacies. Break-even is stated arithmetic.
**Note.** Ingredient cost and the state's or plan's own administrative costs are excluded by the
definition. No survey figure is shipped: the reader's own number is the point.

### 26. `rx-pricing-math` — Markup, Margin and Cash Price

Group Q.
**Input.** Any two of: acquisition cost, selling price, markup percent, gross margin percent;
optionally a dispensing fee and a target margin.
**Compute.** Markup % = (price − cost) ÷ cost. Gross margin % = (price − cost) ÷ price.
Margin = markup ÷ (1 + markup); markup = margin ÷ (1 − margin). Price for a target margin =
cost ÷ (1 − margin) + fee.
**Output.** All four figures and the conversion shown, with a line on which one a contract or a
price list is quoting.
**Source.** Stated arithmetic (no primary source; identities).
**Note.** A margin of 100% or more is impossible on a positive cost and is refused, not clamped.

### 27. `inventory-turns` — Inventory Turnover, Days on Hand and Reorder Point

Group Q.
**Input.** Cost of goods sold for the period and the period's length; beginning and ending
inventory at cost; for one item: average daily use, supplier lead time in days, safety stock.
**Compute.** Average inventory = (beginning + ending) ÷ 2. Turnover = cost of goods sold ÷
average inventory, annualized by 365 ÷ days in period. Days on hand = 365 ÷ annual turnover.
Reorder point = daily use × lead time + safety stock.
**Output.** Turns per year, days on hand, the dollars tied up above a reader-entered target, and
the reorder point.
**Source.** Stated arithmetic (no primary source).
**Note.** No "good" turnover band is printed: none has a primary source.

### Immunization

### 28. `vaccine-interval-validity` — Is This Vaccine Dose Valid? (Minimum Interval and Grace Period)

Group J.
**Input.** Date of birth; date of the previous dose; date of this dose; the vaccine's minimum
age and minimum interval for this dose (**reader input**, from the current CDC schedule);
whether this dose is a live injectable or intranasal vaccine, and the date of the most recent
other live injectable or intranasal vaccine; whether the vaccine is rabies or the accelerated
combined hepatitis A and B (Twinrix) schedule; whether a state or local mandate disallows the
grace period; whether the schedule gives this dose a special grace period of its own.
**Compute.**
- A dose given 4 or fewer days before the minimum interval or minimum age is valid.
- A dose given 5 or more days early is not valid and is repeated as age-appropriate. When the
  interval was short, the repeat dose is spaced after the **invalid** dose by the minimum
  interval. When the first dose of a series was given before the minimum age, the repeat is due
  on or after the date the minimum age is reached; for a live vaccine, also at least 28 days
  after the invalid dose.
- Two live injectable or intranasal vaccines not given on the same day must be at least 28 days
  (4 weeks) apart. If closer, the second does not count and is repeated at least 4 weeks after
  it. The grace period does not apply to this 28 days. It also does not apply to a second dose
  that falls due 4 weeks after two different live vaccines were given together (the CDC example
  is MMR and varicella, or MMRV): the other live vaccine sets a full 28 days.
- The live oral vaccines (Ty21a typhoid, rotavirus) may be given at any interval before or
  after other live vaccines and are outside the 28-day rule.
- The grace period does not apply to rabies vaccine or the accelerated Twinrix schedule, and a
  local or state mandate may supersede it.
- Where the schedule gives a dose a special grace period (the CDC table has two, each 2 months,
  for retrospective record review), the 4 days are not added to it; the tool asks for the
  special period as reader input and then applies no 4-day grace.
**Output.** Valid or not, by how many days, and the earliest date for a repeat dose.
**Source.** CDC, ACIP General Best Practice Guidelines for Immunization, "Timing and Spacing of
Immunobiologics" (page dated July 24, 2024), text and Tables 3-2 and 3-4, read as raw page text
on October 10, 2026.
**Why this passes the standing rule on vaccine schedules.** [spec-v1500](spec-v1500.md) keeps
"annually shifting vaccine schedules" out of scope. This tool does not break that rule because
it ships no schedule: no vaccine list, no minimum age and no interval table. The reader types
the minimum age and minimum interval from the current schedule. What the tool ships is the
general validity arithmetic (4 days, 28 days, repeat spacing), which is a best-practice rule
that does not change with the annual schedules. The vaccines it names (rabies, Twinrix, the
live oral vaccines) are the page's stated exceptions to that arithmetic, not schedule rows. It
is a route B dated rule with a page watch on the CDC page; when the page's date changes the
tool fails closed until the rule is re-read.
**Note.** The page reads months as calendar months and lets an interval of 3 calendar months or
fewer be converted at 4 weeks to the month; the tool accepts the interval in days, weeks or
calendar months and shows the conversion. Whether to give or repeat a dose is the
vaccinator's decision; the tool reports validity under the CDC rule.

## Backfills (live tools that should do more)

| Live tool | Change | Source |
|---|---|---|
| `med-sync-plan` | The result already carries one sentence that Part D plans charge a daily cost-sharing rate for a short fill of a solid oral dose, and tells the reader to ask other plans. It computes no amount. Add a hand-off to `partd-daily-cost-share` for each short fill; keep the sentence for other payers | 42 CFR 423.153(b)(4); `lib/adherence-v1513.js` |
| `partd-year-cost` | The note "covered insulin is capped at $35 a month" understates the rule: it is the lesser of $35, 25% of the maximum fair price and 25% of the negotiated price, with no deductible. Correct the sentence and link `partd-insulin-cost-cap` | 42 CFR 423.100, 423.120(h) |
| `pdc-star` | (1) The 2027 Technical Notes exist (September 30, 2026): move the edition forward. (2) For measurement year 2026 (the 2028 ratings) CMS replaces the three adherence measures with risk-adjusted versions that are **not adjusted for inpatient and skilled nursing stays**; the tool's stay adjustment must become edition-dependent. (3) Link the two new measure tools | CMS 2027 Technical Notes; CMS CY2026 Patient Safety memo (April 2026) |
| `opioid-mme` | Add a hand-off line to `partd-opioid-safety-edit` and `partd-dmp-criteria-check` when the result is 90 MME or more, stating that the three Part D thresholds differ | CMS CY2027 opioid safety edit memo; drug management program guidance, Rev. 7 |
| `nadac-margin` | Where the NDC has a federal upper limit, show it beside NADAC and link `medicaid-ful-check` | data.medicaid.gov FUL file |

## Rejected

| Idea | Why not |
|---|---|
| Unnecessary-drug check (483.45(d)) | Judgment over a chart: excessive dose, duration, monitoring and indication are clinical findings |
| Classifying a medication error as "significant" | Appendix PP calls it professional judgment over condition, drug category and frequency |
| Psychotropic drug classifier | 483.45(c)(3) defines the class by effect and "not limited to" four categories; a shipped list would be the site's, not the rule's |
| MDS Section N day counting (N0415, N0450) | The RAI manual was not read, and the item belongs with nursing assessment tools; recorded as an unverified candidate, not a finding |
| Emergency kit contents; controlled-drug reconciliation frequency | 483.45(b) says "periodically reconciled" with no number; kits are state law |
| Assisted living, technician ratios, MAC appeal clocks, any-willing-pharmacy state laws | State law; no fifty-state tables |
| Federal any-willing-pharmacy, mail-order and preferred-network rules | Contract-term requirements on sponsors; nothing computes |
| Part D pharmacy audit and recoupment clock | 423.505 gives CMS a 10-year audit right over sponsors; it sets no pharmacy audit clock. State audit laws are state law |
| Drug pricing standard update checker (423.505(b)(21)) | One number (every 7 days) with no reader input that changes the answer; printed as a fact in tool 10 |
| Tamper-resistant prescription pad check (42 U.S.C. 1396b(i)(23)) | A three-item checklist with no computation; the statute text was not opened on October 10, 2026 (uscode.house.gov did not respond) |
| Medicaid drug utilization review (42 CFR 456.703) | Program requirements on states; nothing a pharmacy computes |
| DMEPOS supplier standards (42 CFR 424.57) | A list of standards; a bare checklist |
| Vaccine administration fee lookup; roster billing | A locality-adjusted annual fee file with no computation beyond lookup; roster billing is a form |
| PREP Act authority timeline | Verified: the 12th amendment (89 FR 99875, December 11, 2024) extends coverage through December 31, 2029. A single date; nothing computes. State scope of practice governs the rest |
| Test-to-treat, CLIA-waived testing, specialty accreditation | Nothing computes |
| ACIP-recommended adult vaccine $0 cost sharing | A constant (423.120(g)); stated inside tool 6 |
| Pharmacy valuation multiples | Opinion; no primary source |
| Return-to-wholesaler credit; short-dated inventory value | Wholesaler contract terms with no rule; a single multiplication |
| Cash discount card and copay clawback calculators | Contract terms; no federal formula. The one checkable fact (patient paid more than the pharmacy kept) is a flag in tool 24 |
| 340B contract pharmacy fee math | Arithmetic on a private contract with no rule behind it; revisit as a backfill to the 340B set if asked |
| DIR accrual forecast | Since January 1, 2024 Part D concessions are in the point-of-sale price (423.100); a forecast would model a payer's behavior |
| Vaccine clinic staffing; payroll ratios | No source; state law |
| Per-ingredient compounded-claim pricing | NCPDP standard text and AWP, both licensed |
| Drug classification for the quality measures (NDC value sets) | PQA value sets; licensed. The reader assigns the class, as in `pdc-star` |
| A fifty-state Medicaid dispensing-fee table | The matrix rule; the fee is reader input in tools 18 and 19 |
| Medicaid NDC-unit billing | Live as `ndc-hcpcs-units` and `ndc-convert` |
| MFP cash-flow timing | Live as `mfp-refund-check` and `mfp-refund-reconcile` |
| A second medication error rate tool (`med-error-rate`) | One formula, one owner: `med-pass-error-rate` (tool 23) is the program's only error-rate tool; [spec-v1634](spec-v1634.md) and [spec-v1636](spec-v1636.md) point here |
| A vaccine schedule or catch-up table | The standing rule in [spec-v1500](spec-v1500.md); tool 28 takes the minimum age and interval as reader input |

## Research record

| Finding | Where read (URL) | Effect on the spec |
|---|---|---|
| MTM targeting: plan may require at most 3 chronic diseases and at most 8 Part D drugs; ten core diseases; at-risk beneficiaries targeted from 2022; cost threshold = average annual cost of eight generic drugs from 2025 | ecfr.gov renderer, title 42 §423.153(d) (current to October 8, 2026) | Tool 1 |
| MTM cost threshold $1,623 (2025), $1,276 (2026), $1,340 (2027, from 2025 claims; memo dated May 1, 2026) | cms.gov/files/document/memo-contract-year-2025-medication-therapy-management-mtm-program-submission-v050624.pdf; …2026…v05062025.pdf; …2027…v-05-04-2026.pdf | Tool 1 constants; next value spring 2027 |
| Plan may set the disease minimum at 2 or 3 and the drug minimum anywhere from 2 through 8; costs counted include ingredient cost, dispensing fee, sales tax, vaccine administration fee, plan-paid and enrollee | CY2025 MTM memo (same URL) | Tool 1 inputs |
| CMR offer "no later than 60 days after being enrolled"; continuing members within one year of the last offer; TMRs "at least quarterly". The regulation itself says only annual CMR and quarterly TMR | CY2025 MTM memo; §423.153(d)(1)(vii) | Tool 2 labels the 60 days as guidance |
| CMR completion measure: age 18+, 60 days of MTM enrollment (enrollment date counts, opt-out date does not), hospice excluded, 31 minimum | cms.gov/files/document/2026-star-ratings-technical-notes.pdf, measure D11 | Tool 2 |
| The CMR completion measure "was transitioned to the display page for measurement years 2025 and 2026 and will return to the Star Ratings as a new measure beginning with the 2029 Star Ratings (measurement year 2027)"; 2027 Part D measures D11 SUPD, D12 COB, D13 Poly-ACH; contracts with 29 or fewer in the denominator get no rating on those three | cms.gov/files/document/2027-tech-notes-2026-09-30.pdf | Tool 2 states the status by measurement year and prints no cut points; tools 11 and 12 use the 2027 notes |
| Transition: first 90 days; "at least an approved month's supply"; notice in 3 business days; no separate long-term-care quantity in the rule | §423.120(b)(3) | Tool 3 |
| Manual ch. 6 (Rev. 18, 2016) still says 30 days retail and 91–98 days long-term care; §30.4.6 gives the 31-day emergency supply, one per drug per stay; §30.4.5 has current enrollees affected by a formulary change across contract years receive the transition supply "beginning January 1" | cms.gov/medicare/prescription-drug-coverage/prescriptiondrugcovcontra/downloads/part-d-benefits-manual-chapter-6.pdf | Tool 3 follows the rule, cites the manual for the emergency supply and for the January 1 start, and says the manual is older. **Corrected:** an earlier version of this spec counted a continuing member's 90 days from "the date a formulary change took effect"; the manual says January 1 |
| Short-cycle: brand solid oral, ≤14-day increments; antibiotics and original-container products excluded; three facility/pharmacy types waived "except paragraphs (a)(2) and (3)", so the fee-proration ban still applies to them | §423.154 | Tool 4 |
| Daily cost-sharing rate = monthly copay ÷ days in the approved month's supply, rounded to the nearest cent; coinsurance applied unchanged; solid oral only, antibiotics and original containers excepted | §423.100; §423.153(b)(4) | Tool 5; backfill to `med-sync-plan` |
| Insulin: lesser of $35, 25% of maximum fair price, 25% of negotiated price, plan year 2026 onward; multi-month fills capped at the fewest one-month increments; no deductible. Vaccines: no deductible or cost sharing | §423.100; §423.120(g), (h) | Tool 6; backfill to `partd-year-cost` |
| Opioid edits for CY2027 (memo dated July 2, 2026): care coordination at 90 MME per day, 7-day opioid-naive hard edit, optional hard edit at 200 MME or more; the care-coordination and hard MME edits "may also include prescriber counts, pharmacy counts, or both"; five exemptions; submission window August 11–18, 2026 | cms.gov/files/document/cy-2027-opioid-safety-edit-submission-instructions.pdf | Tool 7. **Corrected:** the plan's counts are an input for the hard edit too, not only the care-coordination edit |
| Opioid safety edit FAQ (as of July 5, 2024, updating December 19, 2022): the naive lookback window is "designated by the Part D sponsor"; the opioid and benzodiazepine soft edit is bidirectional; the daily cost-sharing rule applies to a 7-day naive fill ($30 a month gives $7) | cms.gov/files/document/frequently-asked-questions-about-formulary-level-opioid-point-sale-safety-edits-july-5-2024.pdf | Tools 5 and 7; closes the Verify item on the FAQ |
| Care-coordination edit fires when MME "reaches or exceeds 90"; naive lookback "generally 60-90 days"; soft edits for opioid plus benzodiazepine and duplicative long-acting opioids | cms.gov/files/document/part-d-opioid-policies-information-pharmacists-eff-202501.pdf (dated September 2024) | Tool 7 boundary and reader-input lookback |
| OMS minimum criteria: MME > 90 any duration in 6 months with 3+ prescribers and 3+ pharmacies, or 5+ prescribers; or overdose claim in 12 months plus a non-MAT opioid in 6 months. Supplemental: 7+ prescribers or 7+ pharmacies. Buprenorphine out of MME, in the counts | cms.gov/files/document/2023partddmpguidance11282022g.pdf §§4.1–4.2 (Rev. 4), and cms.gov/files/zip/cy-2026-part-d-dmp-guidance.zip §§4.1–4.2 (Rev. 7) | Tool 8. **Corrected:** the current guidance is Rev. 7 (December 16, 2025, implemented January 1, 2026), not Rev. 4; the criteria text is identical in both |
| Rev. 7 §8.2.1: the determination date "is the date the limitation is implemented"; a determination on day 60 means notice the same day, on day 59 within one day. Rev. 7 §5 restates the exemption list, including a facility described in section 1905(d) of the Act | cms.gov/files/zip/cy-2026-part-d-dmp-guidance.zip | Tools 8 and 9. **Corrected:** tool 9 no longer returns "day 30" for a determination on day 20; that case meets neither limit and is flagged |
| Exempted beneficiary definition; clinical guidelines "published in guidance annually"; guideline standards include the overdose-history basis | §423.100; §423.153(f)(16) | Tool 8 |
| Second notice no sooner than 30 days and no later than the earlier of 3 days after determination or 60 days; 3 attempts in 10 business days; limitation ends at 1 year, 2 if extended; 7-day reporting | §423.153(f)(4), (8), (14), (15) | Tool 9 |
| Prompt pay: 14 days electronic, 30 days other; receipt on the 5th day after postmark; deemed clean after 10 or 15 days; interest at the 3-month Treasury weighted average plus 0.1 point; excludes mail-order and long-term-care pharmacies | §423.520 | Tool 10 |
| Long-term-care pharmacies: 30 to 90 days to submit claims; pricing standard updated January 1 and at least every 7 days | §423.505(b)(20), (21) | Notes in tool 10; MAC-update checker rejected |
| COB and Poly-ACH definitions, exclusions (Poly-ACH: hospice only), 30 cumulative overlap days, entered Stars for 2027 with weight 1; "same medication" means the same anticholinergic active ingredient | 2027 Technical Notes, D12 and D13; cms.gov/files/document/cy-2026-patient-safety-memo-202604.pdf (April 22, 2026) | Tool 11; closes the Verify item on the Poly-ACH exclusion list |
| Poly-CNS (3+ unique, age 65+, seizure exclusion), OHD (≥90 MME average, 90 days or more), OMP (4+ prescribers and 4+ pharmacies in 180 days), IOP-LD (>7 days in a 3-day window, 90-day lookback; hospice, cancer, sickle cell and palliative care excluded during the period or the 90 days before the initial fill) | 2026 Display Measures Technical Notes (in cms.gov/files/zip/2026-display-measures.zip, December 16, 2025) | Tools 11 and 13; the IOP-LD exclusions were added to tool 13 |
| The CY2027 final rule (91 FR 17384, April 6, 2026, effective June 1, 2026) removes several Star measures (call center, complaints, Plan Finder price accuracy, members choosing to leave, and Part C measures) but none of SUPD, COB, Poly-ACH or the adherence measures | federalregister.gov/documents/full_text/text/2026/04/06/2026-06600.txt | No change to tools 11 and 12 or the `pdc-star` backfill |
| SUPD: age 40–75, two diabetes fills, first fill 90 days before period end, seven exclusions; PCSK9/bempedoic acid exception from measurement year 2026 | 2026 and 2027 Technical Notes; CY2026 Patient Safety memo | Tool 12 |
| Adherence measures become risk-adjusted for measurement year 2026 and are not adjusted for inpatient or skilled nursing stays | CY2026 Patient Safety memo | Backfill to `pdc-star` |
| Supplying fees $24 first / $16 later / $50 first post-transplant, for immunosuppressives, oral anticancer and oral antiemetics; inhalation $57 initial, $33 later, $66 per 90 days | ecfr.gov §414.1001 | Tool 14; the common description "$24/$16 for oral anticancer only" is wrong |
| DMEPOS refills: contact within 30 calendar days of the expected end; date of service no earlier than 10 calendar days before it; shipping-date definition | ecfr.gov §410.38(d)(4) | Tool 15; the 10-day rule is regulation, not only manual |
| Test strips and lancets: 100 per 3 months non-insulin, 300 insulin-treated; three conditions above that; one lancing device per 6 months | cms.gov/training-education/medicare-learning-networkr-mln/compliance/medicare-provider-compliance-tips/glucose-monitoring-supplies | Tool 16 |
| LCD L33822 (revision effective October 1, 2024, version 70) confirms those figures and adds: criteria (a)–(c) for high utilization; the excess is denied when they are not met; no more than a 3-month quantity dispensed at a time; supplies billed with a non-adjunctive continuous monitor are denied. Article A52464 (version 65, effective February 18, 2025): 1 unit of A4253 = 50 strips, 1 unit of A4259 = 100 lancets; KX insulin-treated, KS not; testing frequency must corroborate the quantity | downloads.cms.gov/medicare-coverage-database/downloads/exports/current_lcd.zip and current_article.zip (export of October 8, 2026) | Tool 16 promoted from build-gated |
| CCM minutes: 99490 first 20, 99439 each additional 20; 99491 first 30, 99437 each additional 30; 99487 first 60, 99489 each additional 30; staff codes under general supervision; complex and non-complex not reported in the same month | cms.gov/files/document/chroniccaremanagement.pdf (MLN909188, June 2025; still the posted edition on October 10, 2026); ecfr.gov §410.26(b)(5) | Tool 17 |
| FUL = 175% of the weighted average of monthly AMPs; raised to the national-survey acquisition cost when lower; aggregate limit; three A-rated products needed | ecfr.gov §447.514 | Tool 18 |
| The FUL file is live, public domain, modified September 28, 2026, 2,280,950 rows; a row checked: 0.384485 × 1.75 = 0.672849 | data.medicaid.gov/api/1/metastore/schemas/dataset/items/ce4cf49b-a21b-5a53-bbc3-509414940847 and the datastore query | Tool 18 is route A |
| Other drugs: lower of actual acquisition cost plus professional dispensing fee, or usual and customary charge; definitions of both terms; fees must rest on cost data | ecfr.gov §§447.502, 447.512, 447.518(d) | Tools 19 and 25 |
| Negotiated price = lowest possible reimbursement in total, includes all pharmacy price concessions and dispensing fees, excludes contingent amounts that raise the price; that definition took effect January 1, 2024 | ecfr.gov §423.100; 87 FR 27704 (May 9, 2022), Effective dates | Tool 24's Part D note |
| 483.45 in full: monthly review; irregularity report to physician, medical director and director of nursing; facility sets its own time frames; PRN psychotropic 14 days; PRN antipsychotic not renewable without evaluation; error rate not 5% or greater; no significant errors | ecfr.gov §483.45 | Tools 20–23 |
| Appendix PP current edition is Rev. 232 (issued July 23, 2025; still the posted edition on October 10, 2026); psychotropic guidance now sits under F605 (text Rev. 229, issued April 25, 2025); F758 is a stub (Rev. 231, issued July 9, 2025) saying 483.45(c)(3) and (e) "have been relocated to F605" | cms.gov/regulations-and-guidance/guidance/manuals/downloads/som107ap_pp_guidelines_ltcf.pdf | Tools 21 and 22 cite F605. The older URL (…/appendix-pp-state-operations-manual.pdf) still serves the August 2024 Rev. 225 edition |
| Dose reduction: "two separate quarters (with at least one month between the attempts)" in the first year, as an example of compliance; **no "then annually" sentence** in Rev. 225 or Rev. 232 | same PDF, F605 "Gradual Dose Reduction" | Tool 22 covers the first year only |
| Error rate = errors ÷ (doses given + doses ordered but not given) × 100; errors counted are significant and non-significant together; no rounding up ("(e.g., 4.6%)"); significant errors cited regardless of rate; errors found by record review are not in the rate; 60-minute timing rule | same PDF, F759/F760 (Rev. 173, issued November 22, 2017) | Tool 23, the program's single error-rate tool |
| Review applies to short-stay and long-stay residents; policy should address stays under 30 days | same PDF, F756 | Tool 20 |
| PREP Act declaration extended to December 31, 2029 | govinfo.gov/content/pkg/FR-2024-12-11/html/2024-29108.htm | Rejected: nothing computes |
| Grace period 4 days ("≤4 days before the minimum interval or age"); "≥5 days" early is invalid; repeat after an invalid dose by the minimum interval; a first dose before the minimum age is repeated on or after the minimum age (live vaccine: also 28 days after the invalid dose); 28 days between live injectable or intranasal vaccines with no grace, including the second doses after MMR and varicella given together; oral Ty21a and rotavirus outside the rule; rabies and accelerated Twinrix excepted; two special 2-month grace periods in Table 3-2 take no added 4 days; state or local mandates may supersede | cdc.gov/vaccines/hcp/imz-best-practices/timing-spacing-immunobiologics.html (page dated July 24, 2024; raw text read October 10, 2026, and matched to the archived copy of September 30, 2026) | Tool 28 promoted from build-gated. **Corrected:** an earlier version of this spec repeated every invalid dose "the minimum interval after the invalid dose"; a minimum-age violation is repeated at the minimum age instead |
| The live `med-sync-plan` already states the Part D daily cost-sharing rule in a note and computes no amount; the live `partd-year-cost` says "covered insulin is capped at $35 a month"; the live `pdc-star` cites the 2026 Technical Notes and removes inpatient and skilled nursing stay days | repo `lib/adherence-v1513.js`, `lib/partd-costs-v1506.js`, `lib/pdc-star-v1513.js`, `lib/meta.js` | Backfills. **Corrected:** an earlier version of this spec said `med-sync-plan` calls proration "a question for the plan"; it does not |
| `allowed-amount` ships with a generic accounting citation | repo `lib/meta.js` | Precedent for stated-arithmetic tools 24–27 |

## Verify at build

- **Tool 1.** The eight-generic-drug method's 2028 figure (spring 2027 memo). Whether the MTM
  change proposed in the CY2026 proposed rule (89 FR 99340) is ever finalized: the CY2027
  bidding instructions say it was not, and 423.153(d) in the eCFR current to October 8, 2026
  carries no such amendment.
- **Tool 2.** Whether the display-page CMR measure keeps the 2026 D11 definition for
  measurement years 2025 and 2026, and the definition it returns with in the 2029 Star Ratings.
- **Tool 3.** Whether CMS has reissued manual ch. 6 or other guidance on the long-term-care
  emergency supply or the January 1 start since 2016; both rest on a 2016 chapter that is stale
  elsewhere.
- **Tool 7.** The CY2028 opioid safety edit memo (expected July 2027).
- **Tool 8.** The OMS user guide's method for grouping prescribers and pharmacies was not
  opened (the tool takes the grouped counts as reader input). The CY2027 guidance revision
  (expected winter 2026) for any change to the criteria.
- **Tool 9.** Nothing numeric. The flag for a non-exempt determination before day 27 follows
  from the two limits in 423.153(f)(8)(i); CMS gives no example of that case.
- **Tool 10.** The day-count basis for interest and where CMS publishes the Treasury rate it
  expects sponsors to use; neither is in 423.520.
- **Tools 11–13.** The terms on the PQA value-set workbooks CMS posts in the display-measures
  zip (not opened); whether the 2027 Display Measures Technical Notes (expected December 2026)
  change Poly-CNS, OHD, OMP or IOP-LD; whether Poly-CNS carries the 30-day index-date cutoff
  that Poly-ACH states. No cut points are shipped.
- **Tool 14.** None; constants read in the eCFR.
- **Tool 16.** None numeric. Re-read L33822 and A52464 if either version number has moved by
  build (version 70 and version 65 on October 10, 2026).
- **Tool 17.** Any cap on units of 99439, 99437 or 99489 per month; the booklet's table gives
  none and CPT was not consulted. The CY2027 physician fee schedule final rule (expected
  November 2026) for changes to care management codes.
- **Tool 18.** The FUL file's refresh cadence (its metadata gives none; the regulation says
  "most recently reported monthly AMPs").
- **Tool 20.** Nothing numeric; the calendar-month reading of "once a month" is this spec's.
- **Tool 21.** Whether day 1 is the order date; neither the rule nor Appendix PP says.
- **Tool 22.** Whether any Appendix PP transmittal after Rev. 232 changes the wording; the
  readings of "quarter" and "one month".
- **Tool 28.** None numeric. The two vaccine rows that carry the special 2-month grace periods
  are schedule content and are not shipped; confirm at build that the reader-input wording
  makes that case reachable.
- **Not read at all:** 42 U.S.C. 1396b(i)(23); the RAI manual (MDS Section N); the preamble of
  the CY2023 final rule on pharmacy price concessions (87 FR 27704; only its effective dates
  were read); the NCPA cost-of-dispensing study; the OMS user guide.

## Sources

- 42 CFR 410.26, 410.38, 414.1001, 423.100, 423.120, 423.153, 423.154, 423.505, 423.520,
  447.502, 447.512, 447.514, 447.518, 483.45 (eCFR, current to October 8, 2026).
- CMS, Contract Year 2025, 2026 and 2027 Part D MTM Program Guidance and Submission Instructions
  (May 6, 2024; May 6, 2025; May 1, 2026).
- CMS, Contract Year 2027 Medicare Part D Opioid Safety Edits: Submission Instructions,
  Recommendations, and Reminders (July 2, 2026); Frequently Asked Questions about Formulary-Level
  Opioid Point-of-Sale Safety Edits (as of July 5, 2024); Medicare Part D Opioid Policies:
  Information for Pharmacists (September 2024).
- CMS, Part D Drug Management Programs guidance, Rev. 7 (December 16, 2025; implemented January
  1, 2026) and Rev. 4 (November 28, 2022); DMP FAQ (revised December 16, 2025).
- CMS, 2026 Star Ratings Technical Notes (September 25, 2025); 2027 Star Ratings Technical
  Notes (September 30, 2026); 2026 Display Measures Technical Notes (December 16, 2025); CY2026
  Patient Safety memo (April 22, 2026).
- CMS, State Operations Manual Appendix PP, Rev. 232 (July 23, 2025).
- CMS, Medicare Prescription Drug Benefit Manual, chapter 6 (Rev. 18, January 15, 2016).
- CMS, MLN909188 Chronic Care Management Services (June 2025); Medicare Provider Compliance
  Tips, Glucose Monitoring Supplies.
- DME MACs, LCD L33822 Glucose Monitors (revision effective October 1, 2024) and Policy Article
  A52464 (effective February 18, 2025), Medicare Coverage Database export of October 8, 2026.
- data.medicaid.gov, ACA Federal Upper Limits (modified September 28, 2026).
- 87 FR 27704 (May 9, 2022), CY2023 Part D final rule, effective dates; 91 FR 17384 (April 6,
  2026), CY2027 final rule, Star Ratings section.
- 89 FR 99875 (December 11, 2024), 12th amendment to the PREP Act declaration.
- CDC, ACIP General Best Practice Guidelines for Immunization, Timing and Spacing of
  Immunobiologics (July 24, 2024).

## Tests

- `mtm-eligibility-check`: cost of $1,339.99 in 2027 fails and $1,340.00 passes; a plan setting
  of 4 diseases or 9 drugs is refused; an at-risk beneficiary with one disease is targeted; the
  clock set to January 1, 2028 asks for the threshold.
- `mtm-service-clock`: enrollment on March 1 gives a CMR-offer deadline of April 30; an enrollee
  with 59 days and no CMR is out of the rate, with 59 days and a CMR is in both sides; the
  opt-out day is not counted; 30 in the denominator gives no rate.
- `partd-transition-fill`: a request on day 90 is owed and on day 91 is not (retail); a
  continuing member's window is counted from January 1; a 14-day prescription leaves 16 days
  owed on a 30-day month's supply; a long-term-care resident on day
  120 gets the 31-day emergency answer labeled as manual guidance; the notice date skips a
  weekend and a federal holiday.
- `ltc-short-cycle-check`: a brand tablet at 15 days fails and at 14 passes; a brand antibiotic,
  a generic tablet, a brand oral liquid and an oral contraceptive pack are out of the rule; an
  ICF/IID is waived and still gets the no-proration line.
- `partd-daily-cost-share`: $47 over 30 days for 14 days gives $21.98; $30 over 30 days for 7
  days gives $7.00 (the CMS example); coinsurance is unchanged; an antibiotic is out of the rule.
- `partd-insulin-cost-cap`: a negotiated price of $100 gives $25, not $35; a 90-day fill on a
  30-day month gives three increments and a 100-day fill four; plan year 2025 is refused.
- `partd-opioid-safety-edit`: 89.9 MME does not fire the care-coordination edit and 90.0 does;
  199 does not fire the hard edit and 200 does; 200 with a plan count of 2 prescribers and only
  1 prescriber does not fire; an 8-day naive fill fires and a 7-day does not; hospice silences
  all; a blank lookback is asked for, not defaulted.
- `partd-dmp-criteria-check`: exactly 90 MME with 5 prescribers does not meet criterion 1 and
  90.1 does; 3 prescribers with 2 pharmacies fails and 3 with 3 passes; 4 prescribers with 1
  pharmacy fails and 5 passes; overdose 13 months ago fails; 7 pharmacies at low MME meets only
  the supplemental criteria; a long-term-care resident is exempt.
- `partd-dmp-notice-clock`: a determination on day 40 gives a second notice due by day 43; a
  determination on day 59 gives day 60, not day 62; a determination on day 60 gives day 60; a
  non-exempt determination on day 20 is flagged and gets no date; an exempt finding on day 10 is
  due by day 13.
- `partd-prompt-pay-clock`: an electronic claim paid on day 15 is one day late; a paper claim
  postmarked on the 1st is received on the 6th; no deficiency notice by day 10 makes it clean; a
  long-term-care pharmacy gets the "rule does not apply" answer; a blank rate gives days late
  and no dollar figure.
- `partd-concurrent-use-measures`: 29 overlap days is out of the numerator and 30 is in;
  non-contiguous overlaps add up; one benzodiazepine claim is not enough; two anticholinergics
  with one claim each do not count; age 64 is out of Poly-ACH; a seizure diagnosis excludes from
  Poly-CNS only.
- `supd-measure`: ages 39 and 76 are out; a first diabetes fill 89 days before year end is out;
  two fills on one date count once; a PCSK9 claim without a statin is an exception in 2026 and a
  gap in 2025.
- `partd-opioid-measures`: 4 prescribers and 3 pharmacies is out of OMP; 8 days over the 3-day
  window is in IOP-LD and 7 is out; a prior opioid 90 days back removes the member from IOP-LD.
- `partb-supply-dispensing-fee`: three oral anticancer prescriptions in one period give
  $24 + $16 + $16; a first immunosuppressive fill after a transplant gives $50; a second "first"
  fee inside 30 days is refused; a 90-day inhalation supply gives $66, not 3 × $33.
- `dmepos-refill-window`: delivery 11 days before the expected end fails and 10 passes; contact
  31 days before fails; a shipped item uses the label date.
- `glucose-supply-quantity-check`: 101 strips for a non-insulin patient asks for the three
  conditions; 300 for an insulin-treated patient does not; a visit 7 months ago fails; 400
  strips with a condition unmet gives 100 denied for an insulin-treated patient; a second
  lancing device inside 6 months is flagged; 300 strips is 6 billing units and 300 lancets is 3;
  a non-adjunctive continuous monitor stops the tool.
- `ccm-time-units`: 19 minutes gives nothing; 20 gives 99490; 40 gives one add-on; 59 complex
  minutes gives no complex code; staff minutes do not count toward 99491; complex and
  non-complex codes never appear together.
- `medicaid-ful-check`: a hand entry of 0.384485 gives 0.672849; a NADAC above 175% of the
  weighted AMP sets the limit; a file past its expiry asks for the value; the first line says
  "aggregate limit".
- `medicaid-drug-payment-check`: usual and customary below cost plus fee wins; a brand with no
  FUL ignores that tier; a blank dispensing fee is asked for, not treated as zero.
- `ltc-mrr-tracker`: a review on January 31 and the next on March 1 flags February; a 12-day
  stay with no review is listed; a blank facility time frame gives open reports and no "late".
- `psychotropic-prn-clock`: a non-antipsychotic order started on the 1st ends on the 14th
  without a documented duration; an antipsychotic with a documented "30 days" still ends on the
  14th; a new antipsychotic order with no evaluation date is flagged.
- `gdr-attempt-check`: two attempts in one quarter fail; attempts in adjacent quarters 20 days
  apart fail and one calendar month apart pass; one attempt in quarter 4 leaves no reachable second
  attempt; the result prints no date after the first year.
- `med-pass-error-rate`: 2 errors in 40 opportunities is 5.0% and fails; 2 in 41 is 4.8% and
  passes; 4.6% and 4.96% are not rounded to 5%; one significant error at 1% still fails (f)(2);
  zero opportunities is refused; the result carries the nursing-facility scope line and the
  `proportion-ci` link.
- `pharmacy-effective-rate`: a guarantee of 85% and an achieved 83% on $100,000 of AWP gives
  $2,000 owed; brand and generic are never pooled; a claim with patient pay above the allowed
  total is flagged; a blank AWP total is refused.
- `cost-of-dispensing`: zero prescriptions is refused; a margin per prescription at or below
  variable cost gives "no break-even", not a negative count.
- `rx-pricing-math`: a 25% markup is a 20% margin; a 100% margin is refused; cost of zero is
  refused for markup.
- `inventory-turns`: a 90-day period annualizes by 365 ÷ 90; zero average inventory is refused.
- `vaccine-interval-validity`: 4 days early is valid and 5 is not; two live vaccines 27 days
  apart are invalid even though that is within 4 days of 28; a second live dose due 28 days
  after two live vaccines given together gets no grace; an oral live vaccine is outside the
  28-day rule; after a short interval the repeat date counts from the invalid dose; a first
  dose 5 days before the minimum age is repeated on or after the minimum age, and for a live
  vaccine no sooner than 28 days after the invalid dose; rabies and accelerated Twinrix get no
  grace period; a state mandate switch removes the grace; a reader-entered special grace period
  takes no added 4 days; a blank minimum interval is asked for, never defaulted; the clock set
  past the page watch's expiry asks the reader to confirm the rule.

## Build status

Not started. Specified October 10, 2026.
