# spec-v1505 — Benefits investigation: which benefit, which rules, which code, how many units

**Status:** Proposed, September 25, 2026. 5 new tools and 1 backfill, group Q.
**Charter:** [spec-v1500](spec-v1500.md). **Data:** [spec-v1517](spec-v1517.md).

Before a specialty drug is started, someone has to answer: which benefit pays for it,
what the plan requires, what code to bill, how many units, and what the patient will
owe. A benefits investigation is those answers written on one page. Most of them follow
published rules or public federal files.

## Tools

### 1. `which-appeal-path` — Which Coverage and Appeal Rules Apply?

**Input.** Coverage type (Original Medicare, Medicare Advantage, standalone Part D,
Medicaid fee-for-service, Medicaid managed care, employer self-funded, employer
insured, Marketplace, other), and whether the item is a drug on the pharmacy benefit,
a drug on the medical benefit, or a service.
**Compute.** The rule set that governs coverage requests and appeals, and the
catalog tool for it: Part D clock, MA clock (with the Part B drug windows), ERISA clock
(self-funded employer), ERISA plus state external review (insured employer),
Marketplace (45 CFR 147.136), Medicaid clock, or `appeal-deadline` for Original
Medicare.
**Output.** The rule set, its first deadline, and a link to the tool. This is the triage
step most errors start from: filing a Part D-style request with a plan that's
running ERISA rules.

### 2. `part-b-or-d` — Medicare Part B or Part D for This Drug?

**Input.** Route and setting (given by a clinician in an office or outpatient
department, self-administered, via DME such as a nebulizer or pump, in dialysis), and
the special categories: immunosuppressant after a Medicare-covered transplant; oral
anticancer drug with an injectable equivalent; oral antiemetic within 48 hours of
chemotherapy; vaccine type (flu, pneumococcal, hepatitis B for intermediate or high
risk, COVID-19 are Part B; others Part D); and the MAC's self-administered drug
exclusion status.
**Compute.** The CMS decision rules: Part B for "incident to" drugs not usually
self-administered and for the statutory categories; Part D otherwise, when on the
plan's formulary.
**Output.** Part B, Part D, or "depends on the MAC's self-administered drug list",
with the rule.
**Data.** The self-administered drug exclusion lists are MAC articles inside the
Medicare Coverage Database export (route A). When the reader gives the MAC or state,
the tool checks the list; otherwise it asks.
**Source.** CMS, "Medicare Part B versus Part D Coverage Issues", and Social Security
Act §1861(s)(2). **Read the CMS document in full at build; its categories set this
tool's inputs.**

### 3. `lcd-diagnosis-check` — Does This Diagnosis Support This Code Under the LCD?

**Input.** HCPCS or CPT code, ICD-10-CM codes, and the MAC jurisdiction or state.
**Compute.** From the Medicare Coverage Database article tables: whether the code is in
an article's code group, and whether the diagnoses fall in that article's covered
group. Diagnosis ranges are expanded, and group pairing is honored. Rules the article
states only in prose ("must be billed with a secondary diagnosis of …") are listed for
the reader to confirm, not evaluated.
**Output.** Covered, not covered, or not addressed by any article for that
jurisdiction, with the article ID, title and the export's edition date.
**Data.** The weekly MCD export (route A), with CPT description columns stripped.

### 4. `bi-summary` — Benefits Investigation Summary

**Input.** The facts from the eligibility check (typed, or read from a 271 file via
`x12-271-reader`): plan, benefit (medical or pharmacy), deductible and amount met,
out-of-pocket maximum and amount met, coinsurance or copay, prior authorization
required or not, specialty pharmacy required or not; and the therapy (from
`auth-units-request`) with its allowed amount per administration.
**Compute.** The patient's cost for the first administration, for the first 90 days,
and for the plan year, reusing the arithmetic in `copay-card-runout`.
**Output.** A one-page summary for the chart and for the patient, with each fact's
source ("from 271 received 2026-09-25", "entered by reader").

### 5. `site-of-care-compare` — Cost by Site of Care

**Input.** The drug and units per administration, the administrations per year, and
for each site under consideration (hospital outpatient, physician office, home
infusion, ambulatory infusion center) the allowed amounts. For Original Medicare these
come from `asp-payment` plus the administration code's `rvu-payment` or `apc-payment`;
otherwise they're reader input. Plus the patient's cost-share for each site.
**Compute.** Plan cost and patient cost per administration and per year at each site.
**Output.** A table and the difference between sites. Many plans now require the lowest-
cost site. This shows the patient and the payer the same arithmetic.

## Backfill to a live tool

`ndc-hcpcs-units` converts a dose to HCPCS billing units when the reader already knows
the code and its unit size. It gains an **NDC input**: given an NDC (10 or 11 digits,
normalized by `ndc-convert`) and the amount administered, it looks up the HCPCS code,
the billing-unit size and the package's billable units in the CMS ASP NDC–HCPCS
crosswalk (quarterly, route A), then computes units as it does today. It prints the
NDC in the 11-digit 5-4-2 format claims require. A separate tool would have duplicated
this one, which the duplicate-tile finder flags.

## Sources

- CMS, "Medicare Part B versus Part D Coverage Issues" (to be read in full at build);
  Social Security Act §1861(s)(2).
- CMS Medicare Coverage Database downloads and article data dictionary.
- CMS ASP pricing files page (NDC–HCPCS crosswalk).
- The rule sets named in [spec-v1503](spec-v1503.md).

## Tests

- `which-appeal-path`: an insured employer plan routes to ERISA plus state external
  review; a self-funded one to ERISA plus the federal process.
- `lcd-diagnosis-check`: a diagnosis inside an expanded range; a code covered in one
  jurisdiction and not addressed in another.
- `ndc-hcpcs-units` (backfill): a 10-digit NDC in each of the three segment patterns
  converts to the same 11-digit code the crosswalk lists.
