# spec-v1603 — Coverage rules and the payer's own numbers

**Status:** Proposed, September 29, 2026. In progress: `ma-criteria-check` and `payer-policy-diff` built ([build status](#build-status)).
**Charter:** [spec-v1600](spec-v1600.md). **Group:** C, "Insurance & Patient Literacy",
except `payer-policy-diff`, which joins group Q beside `pa-criteria-checklist`.

## Why

Three rules now let anyone check a payer's process, not just its decisions:

- **Medicare Advantage must follow Medicare's coverage rules.** Since January 1, 2024
  (CMS-4201-F), a plan can't deny a basic benefit that Original Medicare would cover under
  its statutes, regulations, NCDs and LCDs. Where those don't fully set the criteria, the
  plan may use its own only if they are public, based on current guidelines or strong
  literature, and backed by a public summary of the evidence (42 CFR 422.101(b)(6)).
  Denials based on medical necessity must be reviewed by a physician with appropriate
  expertise (422.566(d)). An approval lasts for the course of treatment (422.112(b)(8)).
- **Payers publish their prior-authorization numbers.** The first CMS-0057-F reports
  (calendar year 2025) were due March 31, 2026: approval and denial rates, approvals after
  appeal, and average decision times, for Medicare Advantage, Medicaid and CHIP managed
  care and federal Marketplace plans. KFF found Medicare Advantage denied 12% of standard
  requests, with insurers ranging from 5% to 17%, and more than half of requests for
  long-term care hospital and inpatient rehabilitation stays.
- **Original Medicare now uses prior authorization too.** The WISeR model requires it for
  selected services in six states (Arizona, New Jersey, Ohio, Oklahoma, Texas, Washington)
  for services from January 15, 2026 through 2031. Two services were postponed on April 6,
  2026.

A practice that wants to use these rules today reads the regulation, finds the plan's
report on its website, and does the comparison by hand. These tools do the comparison.

## Tools

### 1. `ma-criteria-check` — Was This Medicare Advantage Denial Allowed to Use These Criteria?

**Input.** Answers, not documents: the service; whether an NCD or LCD applies (with a
lookup through the Medicare Coverage Database export that `lcd-diagnosis-check` already
uses); whether the denial cites the NCD or LCD or the plan's own criteria; if its own,
whether they are posted publicly and whether a public evidence summary exists; who
reviewed the denial (physician or not, and their specialty against the service); for an
ongoing treatment, the date of the original approval; for a new member, the enrollment
date.
**Compute.** A decision tree over 42 CFR 422.101(b)(6), 422.566(d), 422.112(b)(8) and the
90-day transition rule for new enrollees, each branch citing its paragraph.
**Output.** Each process requirement as met, not met or unknown, with the paragraph, and
the appeal path from `which-appeal-path`. A "not met" requirement is written into the
[spec-v1504](spec-v1504.md) reconsideration builder as the regulatory ground, with the
clinical argument left as a marked blank.
**Rule.** The tool never says the service is medically necessary. An "unknown" answer
evaluates to unknown, never to met.

### 2. `payer-policy-diff` — What Changed in This Payer Policy?

**Input.** Two versions of a payer's published medical or drug policy, pasted as text,
with their effective dates.
**Compute.** Both versions are split into criteria with the `pa-criteria-checklist`
splitter; criteria are matched by normalized text and position, and each is marked added,
removed, reworded or unchanged. Numeric thresholds inside criteria (ages, durations, lab
values, number of prior drugs) are compared as numbers.
**Output.** A criterion-level change list, with thresholds that tightened listed first,
and the effective date. Exports as a table the practice can file with the policy.
**Why it helps.** A policy that gets stricter without notice turns into denials weeks
later. A practice that keeps both versions can see the change the day it's posted.

### 3. `pa-metrics-compare` — Compare a Payer's Published Prior Authorization Numbers

**Input.** A payer's CMS-0057-F report figures, typed from its website or picked from the
bundled table ([spec-v1605](spec-v1605.md)), and the market (MA, Medicaid managed care,
Marketplace).
**Compute.** The rates recomputed from the counts where the report gives counts (and
flagged if they disagree with the payer's stated rate); the report checked against the
list of required elements; the payer's rates set beside the market's median and range
from the bundled table.
**Output.** Each metric with the payer's figure, the market's range, and the payer's
position in it; missing required elements listed. No composite score
([spec-v1600](spec-v1600.md)).
**Who it's for.** A practice choosing whether to contract, a patient choosing a plan
during open enrollment, a journalist, a state regulator.

## Backfill

**`medicare-ffs-pa-required`** ([spec-v1502](spec-v1502.md) §6, not yet built) gains the
WISeR model: state of service, date of service and the code the reader has give "WISeR
prior authorization required" or not, with the two postponed services shown as postponed
and the Federal Register notice cited. The WISeR code list is a route B dataset: codes
only, from the CMS operational guide (no descriptors, per [spec-v1501](spec-v1501.md) §6),
page-watched.

## Sources

- 42 CFR 422.101(b)(6), 422.112(b)(8), 422.566(d), 422.138; CMS-4201-F (88 FR 22120,
  April 12, 2023) and the CMS FAQ on coverage criteria (February 2024).
- CMS-0057-F: 42 CFR 422.122, 438.210, 457.732, 45 CFR 156.223 (metrics reporting).
- KFF, "Prior Authorization Metrics Provide New Insights into Insurer Practices, but Gaps
  Remain" (2026).
- WISeR: 90 FR 28749 (July 1, 2025); delay notice 2026-06616 (April 6, 2026); CMS WISeR
  Provider and Supplier Operational Guide.

## Verify at build

- The paragraph numbers for the approval-duration and 90-day transition rules in the
  current 422.112, and for the metrics reporting sections in each program (the CFR
  sections above are believed right and must be read in eCFR).
- The exact list of required metrics elements per program.
- The WISeR operational guide's current version and whether a new date for the two
  postponed services has been published.

## Tests

- `ma-criteria-check`: an LCD that fully establishes criteria, and a denial on stricter
  internal criteria, is "not met" at 422.101(b)(6); unposted internal criteria are "not
  met"; a blank reviewer field is "unknown."
- `payer-policy-diff`: "step through 2 prior drugs" becoming 3 is listed first as
  tightened; a reworded but identical criterion is "reworded," not added and removed.
- `pa-metrics-compare`: counts that don't reproduce the stated rate are flagged; a report
  missing a required element lists it.
- WISeR backfill: a Texas date in 2026 for a listed code is "required"; the same code in
  Kansas is not; a postponed service says postponed.

## Build status

| Tool | Status | What was read, and what differed |
|---|---|---|
| `ma-criteria-check` | **Built September 29, 2026** (catalog 1,952) | Read in the eCFR that day: 42 CFR 422.101(b)-(c), 422.566(d), 422.112(b)(8). **The spec's paragraph for the course-of-treatment rules was incomplete:** approval duration is 422.112(b)(8)(i)(A) and the 90-day transition is (b)(8)(i)(B), and both bind coordinated care plans. 422.566(d) requires a reviewer "with expertise in the field of medicine or health care that is appropriate for the services at issue" and says that reviewer need not share the treating provider's specialty, so the tool asks about expertise, not specialty. Internal criteria are checked against the three cases of (b)(6)(i) and the public-evidence rule of (b)(6)(ii). The Medicare Coverage Database lookup, the pre-filled appeal path and the [spec-v1504](spec-v1504.md) reconsideration builder are not built; the result names **Which Appeal Rules Apply?** instead, and whether an NCD or LCD applies is the reader's answer. |
| `payer-policy-diff` | **Built September 29, 2026** (catalog 1,953) | Reuses `parseCriteria` from the checklist, as planned. Criteria are matched by their words in three passes (identical, same words around different numbers, then mostly the same words), so a criterion that moved is not reported as removed and added. **A change in the spec:** a changed number is called tightened or loosened only where the wording shows which way is stricter ("at least", "no more than", "within", "prior drugs", "or older"); otherwise it is "threshold changed" and the reader judges it, because a bare number ("a score of 7") does not say. A list whose "one of" became "all of" is its own tightened change. The change list downloads as CSV. |
| The other tools on this page | Open | See [spec-v1626](spec-v1626.md#build-status). |
