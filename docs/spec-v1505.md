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

## Build status

- **Built 2026-09-26:** `which-appeal-path` (group C). Every branch points to a tool already built
  ([spec-v1503](spec-v1503.md) and `appeal-deadline`), and every window it prints is one those tools
  verify. Coverage it does not handle (TRICARE, VA, FEHB) says so rather than guessing.
- **Built 2026-09-26:** `bi-summary` and `site-of-care-compare` (group Q). Both walk the deductible, coinsurance
  or copay, and the out-of-pocket maximum as a claim adjudicates, on figures the reader enters from the
  benefits check; the summary's facts are typed until the 271 reader ([spec-v1515](spec-v1515.md)) exists.
- **Built 2026-10-01:** the `ndc-hcpcs-units` backfill, on the new `asp-ndc` dataset
  (`scripts/data/builders/asp-ndc.mjs`: the ASP crosswalk's section 508 CSV, 7,221 NDCs in 2026 Q4). An NDC
  (normalized as `nadac-margin` does) finds its code; the code's dosage ("10 MG") sets the billing unit, and the
  dose converts through the same `ndcHcpcsUnits`. **Found at build:** 138 NDCs bill under more than one code
  (Retacrit under Q5105 and Q5106, with different units), so the tool asks which; a dosage the converter cannot
  read ("UP TO 0.50 MG", mEq) gives the code and package units and asks for the unit size; IU is read as units
  and cc as mL, and the result says so. One crosswalk row carries a 12-digit product number, not an NDC (J7331);
  it is skipped and named in `member.json`.
- **Built 2026-10-01:** `part-b-or-d`. Read in the sources that day: the CMS "Medicare Parts B/D Coverage Issues"
  chart (the full 2005 document it points to is no longer at its link), SSA §1861(s) at Cornell LII, 42 CFR 410.63
  in the eCFR, 42 U.S.C. 1395o(b) (Part B-ID) and 1395w-102(b)(8) (Part D adult vaccines). **Differed from the
  spec:** COVID-19 vaccine joined influenza and pneumococcal in (s)(10)(A); hepatitis B risk now includes anyone who
  never completed the series or whose history is unknown (410.63(a)(2)(iv), from January 1, 2025); IVIG at home for
  primary immune deficiency ((s)(2)(Z)), clotting factors (410.63(b)) and parenteral nutrition ((s)(8)) were added
  as categories the chart and statute name. The MAC self-administered drug lists are not bundled: the reader
  answers yes, no or not sure, and "not sure" gives "depends on the MAC's list".
- **Built 2026-10-01:** `lcd-diagnosis-check`, on the new `mcd-articles` dataset (`scripts/data/builders/mcd-articles.mjs`:
  the weekly "current articles" export, a ZIP inside a ZIP; 1,106 articles that list codes, one shard each, and
  a code index). **Found at build:** the export already lists every code inside a range (B/M/E rows), so no
  expansion is needed; some MCD "states" are regions (New York's three, Missouri's two, California's two),
  read as their state with the region shown when an article reaches only part of it; the CSVs are UTF-8 with
  HTML paragraphs, kept as plain text; the edition is read from the export's own `update_period` table.
  Pairing: one code group takes every covered group; several take the same-numbered group, and a code group
  with no same-numbered covered group is "not decided" (paired in the article's text). Paragraph rules are
  shown, never evaluated. A code no article lists for the state is "not addressed", never "not covered".
