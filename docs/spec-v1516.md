# spec-v1516 — Denial management

**Status:** Proposed, September 25, 2026. 4 new tools, group P.
**Charter:** [spec-v1500](spec-v1500.md). **Depends on:** [spec-v1503](spec-v1503.md) (appeal clocks), [spec-v1515](spec-v1515.md) (835 reader).

A denial is a code, a date and a dollar amount. What to do next depends on which of
about eight kinds of problem the code describes and which payer's rules start the clock.
Billing staff carry that mapping in their heads or in a spreadsheet. These tools make it
explicit, and turn a pile of remittances into a worklist.

## Tools

### 1. `denial-next-step` — Denial: What to Do Next and By When

**Input.** Group code (CO, PR, OA, PI), reason code, remark codes if any, payer type
(Original Medicare, Medicare Advantage, Part D, Medicaid fee-for-service, Medicaid
managed care, employer plan, Marketplace plan, other), and the remittance date.
**Compute.** An original mapping, written for this tool and cited to the payer rules
(not to X12 text), from reason code to one of these categories:

| Category | Usual next step |
|---|---|
| Patient responsibility (deductible, coinsurance, copay) | bill the patient; no appeal |
| Eligibility or coverage dates | verify coverage; rebill the right payer |
| Coordination of benefits | bill the primary; `cob-calc` |
| Authorization or referral missing | retro-authorization if the plan allows, else appeal |
| Coding or bundling | corrected claim; `ncci-ptp` and `mue-check` |
| Medical necessity | appeal with records |
| Timely filing | appeal only with proof of timely submission |
| Duplicate | check the original claim's status; no rebill |
| Contractual adjustment | none; check the rate with `underpayment-check` |

It then computes the deadline for the next step from the payer type: the reopening or
appeal clocks from `appeal-deadline` and [spec-v1503](spec-v1503.md), or `timely-filing`
for a corrected claim.
**Output.** The category, the next step, the deadline and the rule. A code the mapping
doesn't cover gets "no mapping for this code; read the remark code and the payer's
notice", not a guess.
**Maintenance.** The mapping is a small reviewed JSON table. A new CARC is flagged as
unmapped until someone reviews it; the unit test fails when a code seen in fixtures has
no row.

### 2. `denial-pattern-report` — Denial Pattern Report

**Input.** A batch of 835 files (a month or a quarter).
**Compute.** Denied and adjusted dollars by category, by reason code, by payer, by
billing code and by rendering provider; the share of dollars in the top categories; and
month-over-month change.
**Output.** Summary tables, a sorted list, and a CSV, all from the reader's own files.
It answers "what is costing us the most, and is it getting worse?" without a vendor.

### 3. `appeal-worklist` — Appeal Worklist by Deadline and Dollars

**Input.** Denied claims from an 835 upload or a CSV: claim reference, payer type,
denial date, amount, category (from tool 1 or entered).
**Compute.** Each claim's appeal deadline under its payer type's rule (user-supplied
window for "other"), days left, and a sort by days left then by amount. Claims past
their deadline move to a separate list rather than disappearing.
**Output.** The worklist and a CSV.
**No likelihood score.** The tool doesn't estimate how likely an appeal is to win;
that would be a model dressed as arithmetic.

### 4. `underpayment-check` — Paid Below Contract

**Input.** An 835 upload (or a CSV of paid lines) and the reader's fee schedule as a
CSV: billing code, modifier, contracted amount, or a percentage of a reference (for
example, 120% of the Medicare physician fee schedule amount the reader supplies).
**Compute.** Expected allowed per line (applying the reader's multiple-procedure and
modifier rules only if they supply them), minus the allowed amount on the remittance.
**Output.** Lines paid under contract, the variance in dollars, totals by payer and
code, and a CSV to send with a payment dispute.
**Scope.** The contract is the reader's; the tool ships no payer rates.

## Sources

- CARC and RARC code values (codes only; see [spec-v1501](spec-v1501.md) §6).
- CMS Medicare Claims Processing Manual, Pub. 100-04, ch. 34 (reopenings) and ch. 29
  (appeals); 42 CFR 405.980 (reopening windows).
- CAQH CORE (DataSpring) Uniform Use of CARCs and RARCs rule, vPR.1.1, consulted as
  the business-scenario grouping and cited as facts. No rule text is shipped.

## Tests

- `denial-next-step`: each category reached by at least one code; an unmapped code gets
  no guess; the deadline for the same code differs between Original Medicare and an
  employer plan.
- `appeal-worklist`: a past-deadline claim goes to the separate list.
- `underpayment-check`: a line paid exactly at contract is not flagged; one cent under
  is.
