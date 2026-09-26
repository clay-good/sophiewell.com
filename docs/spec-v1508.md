# spec-v1508 — Hospital financial assistance and self-pay estimates

**Status:** Proposed, September 25, 2026. 5 new tools, group C.
**Charter:** [spec-v1500](spec-v1500.md).

Nonprofit hospitals must cap what they charge people who qualify for financial
assistance, and must wait before sending a bill to collections. Uninsured patients are
owed a written estimate and can dispute a bill that runs well over it. The rules are
exact and the dates are easy to miss, on both sides of the bill.

## Tools

### 1. `agb-percentage` — Amounts Generally Billed (Look-Back Method)

**Input.** For a prior 12-month period: the total allowed amounts and the total gross
charges of the claims the hospital's method includes (Medicare fee-for-service alone;
Medicare fee-for-service plus private insurers; or Medicaid alone or combined).
**Compute.** AGB percentage = allowed ÷ gross charges (26 CFR 1.501(r)-5(b)(3)). For a
patient's bill: AGB = gross charges × AGB percentage.
**Output.** The AGB percentage, the most a financial-assistance-eligible patient may be
charged for emergency or medically necessary care, and the date the new percentage
must be in use: day 120 after the end of the 12-month period.

### 2. `fap-collection-clock` — Financial Assistance and Collection Timeline (501(r))

**Input.** Date of the first post-discharge bill, the date the hospital sent (or will
send) the 30-day written notice, and the date of any financial-assistance application.
**Compute.**

| Milestone | Date | Rule |
|---|---|---|
| End of the notification period (no extraordinary collection actions before) | first bill + 120 days | 26 CFR 1.501(r)-6(c) |
| End of the application period | first bill + 240 days | 1.501(r)-1 |
| Earliest extraordinary collection action | the later of day 120 and 30 days after the written notice | 1.501(r)-6(c) |

An application received during the application period suspends collection actions
until it's decided.
**Output.** Every date, what may and may not happen on the date entered, and the
elements the written notice must contain (the plain-language summary, the actions
intended, and a deadline at least 30 days out).
**For both sides.** A patient advocate uses it to spot a premature action; a hospital
uses it to schedule compliant ones.

### 3. `fap-discount` — Financial Assistance Discount (Sliding Scale)

**Input.** The hospital's policy tiers as reader input (for example, "up to 200% FPL:
100% discount; 201–300%: 75%; 301–400%: 50%"), household size and income, the gross
charges, and the hospital's AGB percentage.
**Compute.** Percent of the poverty guidelines (reusing `fpl-percent`), the tier, and
the discounted amount, which is then capped at AGB.
**Output.** The patient's amount, the tier and the cap that applied.
**Batch.** A hospital can screen a list of self-pay accounts in one upload.

### 4. `gfe-deadline` — Good Faith Estimate Deadline (Uninsured and Self-Pay)

**Input.** The date the service was scheduled or the estimate requested, and the
service date.
**Compute.** From 45 CFR 149.610(b)(1)(vi):
- Scheduled at least 3 business days ahead: estimate within 1 business day of
  scheduling.
- Scheduled at least 10 business days ahead: within 3 business days of scheduling.
- Requested by the patient: within 3 business days of the request.
- The convening provider asks co-providers for their parts within 1 business day.
**Output.** The deadline(s), and a note that the estimate must be kept for 6 years.

### 5. `ppdr-eligibility` — Can the Patient Dispute This Bill? (Patient-Provider Dispute Resolution)

**Input.** For each provider or facility on the estimate: the estimated amount and the
billed amount. Plus the date the first bill was received.
**Compute.** Eligible when a single provider's or facility's bill is at least $400 more
than its line on the estimate (45 CFR 149.620). The deadline to start is 120 calendar
days from receipt of the first bill.
**Output.** Eligible or not for each provider, the amount over, and the deadline. The
tool states that the administrative fee is set by HHS guidance, not by the regulation.

## Sources

- 26 CFR 1.501(r)-1, 1.501(r)-5, 1.501(r)-6 (eCFR).
- 45 CFR 149.610, 149.620 (eCFR).
- HHS/CMS No Surprises Act pages for the dispute-resolution fee (verify at build).

## Tests

- `agb-percentage`: allowed $4.2M over gross $10M gives 42%; a bill of $12,000 caps at
  $5,040.
- `fap-collection-clock`: a written notice sent on day 100 makes day 130 the earliest
  action, not day 120.
- `gfe-deadline`: scheduling across Thanksgiving uses federal business days.
- `ppdr-eligibility`: $399.99 over isn't eligible, $400.00 is; two providers each $300
  over aren't eligible even though the total is $600.

## Build status

- **Built 2026-09-26:** all five tools (group C), each read in the eCFR on September 26, 2026.
  - The application period ends on the *later* of day 240 and the written notice's deadline
    (26 CFR 1.501(r)-1(b)(3)), which this spec's table left out; the collection clock applies it.
  - An extraordinary collection action needs both the 120 days and a written notice 30 days ahead
    (1.501(r)-6(c)(3)-(4)); with no notice date the tool says no action may start yet.
  - 45 CFR 149.610 does not define "business day"; the tool uses federal business days, as this spec
    says, and counts days ahead after the scheduling date through the service date. Scheduling fewer than
    3 business days ahead sets no estimate deadline, which CMS's FAQ confirms.
  - `fap-discount` takes up to three tiers and reuses `fpl-percent`; the batch upload is not built.
  - `ppdr-eligibility` names the HHS administrative fee without a figure, because the regulation leaves
    the amount to guidance.
