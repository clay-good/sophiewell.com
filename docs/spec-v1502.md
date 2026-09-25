# spec-v1502 — Prior authorization and step therapy

**Status:** Proposed, September 25, 2026. 6 new tools, group Q.
**Charter:** [spec-v1500](spec-v1500.md). **Machinery:** [spec-v1501](spec-v1501.md).

The catalog can already lint a finished packet (`pa-lint`), list what a packet usually
needs (`prior-auth`) and count the payer's decision clock (`pa-turnaround`). What it can't
do is help with the four chores that eat an access coordinator's day: turning a payer
policy into a checklist, proving the step-therapy history, knowing when an approval runs
out, and asking for the right number of units. This wave covers those.

The tools never judge whether the patient meets a criterion. The reader answers and the
tool checks the answers, counts and dates.

## Tools

### 1. `pa-criteria-checklist` — Payer Criteria Checklist

**Input.** Criteria text the reader pastes from the payer's published policy, plus the
drug and the plan name.
**Compute.** The text is split into items at the numbering the policy uses (`1.`, `a)`,
`i.`, bullets), keeping the policy's own nesting and its "all of" / "one of" connectives
where it states them. Each item becomes a row the reader marks **Met**, **Not met** or
**Not documented**, with a note on where the evidence is ("progress note 2026-08-14").
**Output.** Whether the stated logic is satisfied (the "all of" / "one of" tree
evaluated over the marks), the items still open, and a one-page cover sheet listing each
criterion beside its evidence location, ready to lead the packet.
**Rule.** A "Not documented" item never counts as met. When the tool can't find "all
of" / "one of" connectives in the text, it evaluates nothing and says the reader must
decide the logic.
**Why deterministic works.** The reader supplies the judgment; the tool supplies the
bookkeeping that is currently done in a Word table.

### 2. `step-therapy-history` — Step Therapy History Builder

**Input.** The required steps the plan states (for example, "two conventional DMARDs,
90 days each"), as reader input: step name, number of agents, minimum trial length.
Then each drug the patient has tried: name, start and stop dates, and the reason it
stopped (inadequate response, intolerance, contraindication, still taking).
**Compute.** Trial length in days, overlaps, and whether each required step is
satisfied. A contraindication or intolerance satisfies a step regardless of length only
if the reader marks that the plan accepts it. A Medicare Advantage plan applying step
therapy to a Part B drug can require it only for a patient with no claim for the drug
in the plan's lookback window (42 CFR 422.136); the tool checks the lookback when the
plan type is Medicare Advantage.
**Output.** A dated timeline table for the packet, the unmet steps, and the exception
grounds the reader has marked.

### 3. `auth-runout` — Authorization Expiry, Units Left and Renewal Date

**Input.** Approval start and end dates (or a duration), units or visits approved,
units used so far, the dosing schedule, and the lead time the reader wants for renewal
(default 14 days).
**Compute.** The date the approved units run out at the current schedule, whichever of
that or the end date comes first, and the date to submit the renewal.
**Output.** "The approval ends November 30, 2026, but at one infusion every 8 weeks the
approved 4 doses run out on October 12. Submit the renewal by September 28."
**Batch.** A CSV of authorizations (one per row) gives a renewal worklist sorted by
submit-by date ([spec-v1501](spec-v1501.md) §3). This is the report most coordinators
rebuild by hand every Monday.

### 4. `auth-units-request` — Units to Request for an Authorization Period

**Input.** Dose (mg, or mg/kg with a weight), loading doses, maintenance interval, the
authorization period, and the HCPCS billing-unit size or the NDC package size.
**Compute.** The number of administrations in the period, the total dose, and the
billing units, rounded up per administration (units bill whole). It reuses the
`ndc-hcpcs-units` computation, not a second copy of it.
**Output.** Units to request, with the per-administration arithmetic shown.

### 5. `quantity-limit-check` — Quantity Limit Exception Math

**Input.** The prescribed dose and frequency, the dosage form's strength, and the plan's
quantity limit (reader input: units per days).
**Compute.** Quantity needed per the plan's day window, the excess over the limit, and
whether a different strength would fit the limit (for example, one 40 mg tablet instead
of two 20 mg).
**Output.** Either "fits the limit", "fits with the other strength" or "exceeds by N
units per 30 days: needs a quantity-limit exception", with the arithmetic.

### 6. `medicare-ffs-pa-required` — Does Original Medicare Require Prior Authorization?

**Input.** The HCPCS or CPT code the reader supplies, the setting (hospital outpatient,
DMEPOS, repetitive scheduled non-emergent ambulance), and the state where relevant.
**Compute.** A match against the CMS required-prior-authorization lists, which are
public and published by CMS: the hospital outpatient department list (already vendored
at `lib/pa/cms-opd-pa-list.js`), the DMEPOS required-prior-authorization list, and the
ambulance program's states.
**Output.** Required or not, the program and its effective date, and the list's edition.
Past the list's expiry the tool asks the reader to confirm against the current list
(data route A or B, [spec-v1501](spec-v1501.md) §2).
**Scope.** Original Medicare only. Medicare Advantage and commercial plans set their own
lists; the tool says so rather than guessing.

## Sources

- 42 CFR 422.136 (Medicare Advantage step therapy for Part B drugs), eCFR.
- CMS Prior Authorization and Pre-Claim Review Initiatives (OPD, DMEPOS, RSNAT pages).
- CMS-0057-F (89 FR 8758, February 8, 2024) for decision-clock context, already cited by
  `pa-turnaround`.

## Tests

One unit test file per tool. The cases that must exist:

- `pa-criteria-checklist`: nested "one of" inside "all of"; a "Not documented" item
  keeps the logic unsatisfied; text with no connectives evaluates nothing.
- `step-therapy-history`: overlapping trials; an intolerance satisfying a step only when
  accepted; the Medicare Advantage lookback.
- `auth-runout`: units run out before the end date, and the reverse; a blank used-units
  field asks instead of assuming zero.
- `auth-units-request`: a partial billing unit rounds up per administration, not over
  the total.
