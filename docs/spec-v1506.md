# spec-v1506 — What the patient will pay

**Status:** Proposed, September 25, 2026. 9 new tools, group Q (tools 1–4, 8, 9) and group C (tools 5–7).
**Charter:** [spec-v1500](spec-v1500.md). **Machinery:** [spec-v1501](spec-v1501.md) §2 (data contract).

The question a patient asks before starting an expensive drug is "what will this cost
me, and when?" Answering it takes the plan's phases, a federal cap, a payment plan, a
copay card and sometimes a subsidy, each with its own arithmetic. Financial counselors
do it in spreadsheets. The catalog has `medicare-cost-share` (Parts A and B) and
`nsa-cost-share`, and nothing for drugs or for commercial plans.

Every dollar figure below was read in its primary source on September 25, 2026, unless
it's marked **verify at build**. All of them are route B dated constants with a
ledger row and a page watch.

## Tools

### 1. `partd-year-cost` — Part D Drug Cost Through the Year

**Input.** The drug's monthly cost (the plan's negotiated price, from the Plan Finder or
the pharmacy), the months it will be filled, the plan's deductible (up to the standard),
coinsurance or copays in the initial phase, and Extra Help status.
**Compute.** Month by month through the phases: deductible, initial coverage, then $0
once the out-of-pocket threshold is reached. The standard parameters are carried as
editions:

| Parameter | 2026 | 2027 |
|---|---|---|
| Deductible (maximum) | $615 | $700 |
| Out-of-pocket threshold | $2,100 | $2,400 |

Covered insulin is capped at $35 a month, and ACIP-recommended vaccines cost $0 (Social
Security Act §1860D-2(b)(8), (b)(9)). Extra Help copays for 2026 are $5.10 generic and
$12.65 brand for 100–150% FPL, $1.60 and $4.90 for dual-eligible people at or below
100% FPL, and $0 for institutionalized people. The 2027 Extra Help copays are CMS
projections until the fall 2026 memo, so they're **verify at build**.
**Output.** A 12-month table (what the patient pays each month, cumulative, and the
month the cap is reached) and the annual total.
**Source.** CMS CY2026 and CY2027 Rate Announcements, Table V-2.

### 2. `m3p-monthly-bill` — Medicare Prescription Payment Plan Monthly Bill

**Input.** The month the person opts in, costs already incurred this year, and each
new pharmacy claim (month and patient cost).
**Compute.** From 42 CFR 423.137(c):
- First month: (the out-of-pocket threshold − costs already incurred) ÷ months left in
  the year, capped at the costs actually incurred that month.
- Each later month: (the unbilled balance + new out-of-pocket costs) ÷ months left.
**Output.** The monthly bill schedule and the total, beside what paying at the counter
would have been. It also runs the "likely to benefit" test in 423.137(e): a single
claim of $600 or more, or $2,000 in the first 9 months of the prior year. The tool notes
that from 2026 an enrollee's election renews automatically.
**Why it matters.** The plan spreads the cost; it doesn't reduce it. Showing the two
schedules side by side is the honest answer to "should I sign up?"

### 3. `copay-card-runout` — Copay Card, Accumulator and Maximizer Impact

**Input.** The drug's cost per fill, fills per year, the copay card's annual maximum
and per-fill maximum, the plan's deductible, coinsurance and out-of-pocket maximum, and
whether the plan counts manufacturer assistance toward the deductible and out-of-pocket
maximum (**reader input**: yes, no, or unknown).
**Compute.** Fill by fill: what the card pays, what counts toward the deductible and
the out-of-pocket maximum, and the fill where the card runs out.
**Output.** The month the patient's first large bill arrives, how much it is, and the
patient's total for the year under both answers when the reader chose "unknown".
**Why "unknown" is an input.** A court vacated the 2021 federal rule in 2023, reviving
the 2020 rule that assistance must count unless a generic is available. HHS has not
enforced either rule, and eCFR still prints the vacated text. Whether assistance counts
depends on the plan and on state law, so the tool can't decide it. It shows the reader
both outcomes.
**Scope.** Commercial plans only. Manufacturer copay cards can't be used with federal
health programs, and the tool refuses a Medicare or Medicaid plan type with that reason.

### 4. `part-b-drug-coinsurance` — Part B Drug Coinsurance

**Input.** HCPCS code, billing units, and the date of service.
**Compute.** The Medicare payment limit for the quarter from the CMS ASP file, times
units. The patient's coinsurance uses the file's coinsurance percentage for that code,
which is below 20% for drugs whose prices rose faster than inflation. Insulin through a
pump is capped at $35 a month.
**Output.** Medicare's allowed amount, the patient's coinsurance, and whether an
inflation reduction applied.
**Data.** The quarterly ASP payment-limit file (route A). Since CMS stopped publishing
the separate reduced-coinsurance fact sheet after Q2 2025, the file's coinsurance column
is the source.

### 5. `fpl-percent` — Income as a Percent of the Poverty Guidelines

**Input.** Household size, annual (or monthly) income, state (the 48 states and DC,
Alaska or Hawaii), and the program's year rule.
**Compute.** Income ÷ the guideline for that household size. The year rule matters:
premium tax credits for 2026 coverage use the **2025** guidelines (26 CFR 1.36B-1(h)),
while Medicaid and most assistance programs use the current year's.
**Optional.** One or more program thresholds (for example, "a foundation covers up to
500% FPL") give eligible or not eligible for each.
**Output.** The percentage, the guideline used and its year, and each threshold's
result.
**Data.** The ASPE poverty-guidelines JSON API (route A). 2026: $15,960 for one person
plus $5,680 per additional person in the 48 states and DC. The refresh builder
validates the API's echoed year, state and size, because an invalid request silently
returns 2026, the contiguous US and one person.
**Batch.** A counselor screening a caseload uploads one CSV.

### 6. `premium-tax-credit` — Marketplace Premium Tax Credit Estimate

**Input.** Household MAGI, household size, state, and the benchmark (second-lowest-
cost silver) premium from HealthCare.gov or the state exchange.
**Compute.** Income as a percent of the prior year's guidelines. The applicable
percentage comes from the IRS table (2026, Rev. Proc. 2025-25), interpolated linearly
within each band:

| Income (% FPL) | Applicable percentage |
|---|---|
| under 133% | 2.10% |
| 133% to under 150% | 3.14% to 4.19% |
| 150% to under 200% | 4.19% to 6.60% |
| 200% to under 250% | 6.60% to 8.44% |
| 250% to under 300% | 8.44% to 9.96% |
| 300% to 400% | 9.96% |
| over 400% | no credit |

Expected contribution = income × applicable percentage; credit = benchmark premium −
expected contribution, not less than zero.
**Output.** The annual and monthly credit and the net benchmark premium. Two statements
print every time: the enhanced credits expired after 2025, so the 400% cliff is back;
and for tax years after 2025 there's no cap on repaying excess advance credits.
**2027.** Rev. Proc. 2026-26 reportedly sets 2.15% to 10.22%; **verify at build**.

### 7. `employer-coverage-affordability` — Is the Employer's Offer Affordable?

**Input.** The employee's household income, and the employee's lowest-cost self-only
premium for minimum-value coverage (and the family premium, for family members).
**Compute.** Affordable if the premium is at or below the required contribution
percentage of household income: **9.96% for 2026**. Family members are tested against
the family premium (26 CFR 1.36B-2(c)(3)(v), as amended in 2022). **Verify the
section at build.**
**Output.** Affordable or not, for the employee and separately for the family, and
what that means for premium tax credit eligibility.

### 8. `irmaa` — Medicare Income-Related Monthly Adjustment

**Input.** Filing status and modified adjusted gross income from the tax return two
years earlier (2024 income for 2026).
**Compute.** The bracket and the monthly Part B and Part D adjustments:

| Single | Joint | Part B | Part D |
|---|---|---|---|
| ≤ $109,000 | ≤ $218,000 | $0 | $0 |
| ≤ $137,000 | ≤ $274,000 | $81.20 | $14.50 |
| ≤ $171,000 | ≤ $342,000 | $202.90 | $37.50 |
| ≤ $205,000 | ≤ $410,000 | $324.60 | $60.40 |
| < $500,000 | < $750,000 | $446.30 | $83.30 |
| ≥ $500,000 | ≥ $750,000 | $487.00 | $91.00 |

Married filing separately: $0 up to $109,000, $446.30 / $83.30 up to $391,000, and
$487.00 / $91.00 above. The 2026 Part B premium is $202.90.
**Output.** Total monthly Part B and Part D premium adjustments, and the life-changing
events that allow asking SSA to use a more recent year (form SSA-44), as a list, not a
judgment.
**2027.** The brackets usually publish in November; until then the 2026 edition carries
`validThrough: 2026-12-31`, and the tool asks for the 2027 figures after that date.

### 9. `partd-mfp-price-check` — Negotiated Medicare Price Check

**Input.** The drug (by name or NDC) and the date of service.
**Compute.** Whether the drug has a Medicare negotiated price (maximum fair price) on
that date, and the price per 30-day equivalent supply and per unit, from the CMS file.
**Output.** For example: "Eliquis: $231 per 30-day supply in 2026; $237.25 from January
1, 2027." Deselected drugs (Entresto, NovoLog/Fiasp, Stelara and Xarelto, from January
1, 2027) say so.
**Data.** The CMS negotiated-prices ZIP (CSV, NDC-11 level, with effective and end
dates). It's the cleanest machine-readable feed in the program (route A).
**Pharmacy use** is covered by `mfp-refund-check` in [spec-v1510](spec-v1510.md).

## Sources

- CMS CY2026 and CY2027 Part D Rate Announcements (Table V-2); 42 CFR 423.137.
- CMS 2026 Medicare Parts A & B premiums and deductibles fact sheet (Part B premium,
  IRMAA).
- CMS ASP pricing files page (quarterly ZIP with the coinsurance column).
- ASPE poverty guidelines and API; 26 CFR 1.36B-1(h); Rev. Proc. 2025-25; IRS premium
  tax credit Q&A.
- *HIV & Hepatitis Policy Institute v. HHS* (D.D.C. September 29, 2023); 45 CFR
  156.130(h) (eCFR text noted as not reflecting the vacatur).
- CMS negotiated-prices file and the IPAY 2026 and IPAY 2027 fact sheets.

## Tests

- `partd-year-cost`: an expensive drug hits the 2026 cap in its first month; insulin
  never exceeds $35 a month.
- `m3p-monthly-bill`: opting in in July with $900 already spent; a new claim in
  October re-spreads the balance.
- `copay-card-runout`: the card runs out in month 5 under "does not count", and the
  patient's total differs under "counts".
- `premium-tax-credit`: 401% FPL gets no credit; the band boundary at 200% is
  continuous.
- `fpl-percent`: Alaska and Hawaii differ; the 2026 coverage year uses the 2025
  guideline for premium tax credits.

## Build status

- **Built 2026-09-26:** `fpl-percent` (group C) and `irmaa` (group Q).
  - The guidelines were read from the ASPE API with the two-letter state codes: a full state name
    ("Alaska") silently returns the 48-state figure, as this spec warned. Every region is exactly linear,
    checked at household sizes 1, 2, 8 and 9. New ledger row `aspe-poverty-guidelines`.
  - The prior-year rule for the premium tax credit is 26 CFR 1.36B-1(h) (guidelines published by the
    first day of open enrollment).
  - The IRMAA brackets, including married filing separately and the Part D amounts, are from the CMS 2026
    fact sheet; the life-changing events are SSA's own list. A year with no published brackets asks.
- **Not yet built:** `partd-year-cost`, `m3p-monthly-bill`, `copay-card-runout`, `part-b-drug-coinsurance`,
  `premium-tax-credit`, `employer-coverage-affordability`, `partd-mfp-price-check`.
