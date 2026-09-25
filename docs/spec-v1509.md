# spec-v1509 — 340B

**Status:** Proposed, September 25, 2026. 7 new tools, group Q.
**Charter:** [spec-v1500](spec-v1500.md). **Machinery:** [spec-v1501](spec-v1501.md) §3 (upload workbench).

About 15,000 covered entities and 49,000 sites (HRSA, April 2026) run the 340B program,
most with software that matches prescriptions to eligible visits and decides which
claims may use 340B stock. The rules underneath are a statute, one 1996 guidance, and
a handful of payer billing rules. Small clinics and rural hospitals pay for software to
apply them. These tools apply them in the browser, on the entity's own files.

Every rule below was read in its primary source on September 25, 2026.

## Tools

### 1. `340b-entity-eligibility` — Hospital 340B Eligibility and Restrictions

**Input.** Hospital type (DSH, children's, free-standing cancer, critical access, rural
referral center, sole community hospital), its disproportionate-share adjustment
percentage, and ownership or government-contract status.
**Compute.** From 42 U.S.C. 256b(a)(4)(L)–(O):

| Type | DSH percentage required | Group purchasing ban | Orphan-drug exclusion |
|---|---|---|---|
| DSH | more than 11.75% | yes | no |
| Children's | more than 11.75% (computed as if a DSH hospital) | yes | no |
| Free-standing cancer | more than 11.75% | yes | yes |
| Critical access | none | no | yes |
| Rural referral center, sole community hospital | at least 8% | no | yes |

**Output.** Eligible or not, and which restrictions apply.
**Note.** The tool doesn't cover grantee entity types (health centers, Ryan White,
and others), whose eligibility follows their grant. It says so.

### 2. `340b-orphan-exclusion` — Is This Drug Excluded for This Entity?

**Input.** Entity type, and whether the drug carries an FDA orphan designation (reader
input, or the FDA designation data if a machine-readable source is confirmed at build).
**Compute.** For critical access hospitals, rural referral centers, sole community
hospitals and free-standing cancer hospitals, an orphan-designated drug is excluded
from 340B pricing **whatever it's used for**. The 2013 rule and the 2014 interpretive
rule that limited the exclusion to rare-condition uses were both vacated (the second in
*PhRMA v. HHS*, D.D.C. 2015), and 42 CFR 10.21 no longer addresses orphan drugs.
**Output.** Excluded or not, with the reason. The tool doesn't ask about the indication
it's used for, and explains why.

### 3. `340b-patient-check` — Is This Person a 340B Patient for This Prescription?

**Input.** Per prescription or encounter, the three 1996 guidance prongs as facts:
the entity keeps the person's health records; the prescriber is employed by the entity
or under contract or referral with care responsibility remaining with the entity; and,
for grantees, the service is within the grant's scope. Plus whether dispensing was the
only service.
**Compute.** The 1996 definition (61 FR 55156): all applicable prongs, and not a
dispensing-only relationship.
**Output.** Patient or not, and the failing prong.
**Batch.** Runs over a CSV. The same logic is the engine inside tool 4.

### 4. `340b-rx-match` — Match Prescriptions to Eligible Visits

**Input.** Uploads: prescriptions (patient reference, prescriber NPI, NDC, fill date,
pharmacy), encounters (patient reference, date, location, provider NPI), the entity's
eligible prescribers, and its registered sites. The entity's own policy settings are
reader input: the look-back window between visit and prescription (for example, 12
months) and whether a referral counts.
**Compute.** For each prescription: an encounter at a registered site within the
look-back, with an eligible prescriber, and not an orphan-excluded drug for the entity
type (tool 2). The result carries the reason for every non-match.
**Output.** Eligible and ineligible prescriptions with reasons, match rates by pharmacy
and prescriber, and a CSV. This is the core audit trail of a 340B program, built from
the entity's own data, with every decision explained.
**Scope.** The policy is the entity's. The tool applies it consistently and shows its
work; it doesn't substitute a vendor's policy.

### 5. `340b-ceiling-price` — 340B Ceiling Price and Medicaid Rebate

**Input.** Average manufacturer price for the prior quarter per unit, best price, drug
category (single-source or innovator, clotting factor or pediatric-only, generic), and
for the inflation component the baseline AMP and the CPI-U values (all reader input;
these figures are manufacturer-confidential).
**Compute.**
- Unit rebate amount: brand basic rebate is the greater of 23.1% of AMP (17.1% for
  clotting factors and pediatric-only drugs) or AMP − best price, plus the CPI-U
  inflation component; generics 13% of AMP plus their inflation component
  (42 U.S.C. 1396r-8(c)). The 100%-of-AMP cap applied only through December 31, 2023.
- Ceiling price = AMP − URA, rounded to 2 decimals; below $0.01 it's $0.01 (penny
  pricing) (42 CFR 10.10).
**Output.** The URA, the ceiling price per unit and per package, and whether penny
pricing applies.
**Who.** Manufacturers checking their own figures, and entities checking a
manufacturer's price with figures the manufacturer disclosed.

### 6. `340b-duplicate-discount` — Duplicate Discount and 340B Claim Identifiers

**Input.** Payer (Medicare Part B, Medicare Part D, Medicaid fee-for-service, Medicaid
managed care, commercial), the entity's Medicaid status (carve-in or carve-out, as
listed on HRSA's Medicaid Exclusion File), and for Medicaid the state's identifier rule
(reader input, for example a modifier or an NCPDP submission clarification code).
**Compute.**
- Medicare Part B: the TB modifier on separately payable drug lines, required from
  January 1, 2025 for all covered entities, replacing JG.
- Medicare Part D: no claim-level identifier is required by CMS. The Part D 340B claims
  repository opens October 1, 2026 for voluntary quarterly submission; mandatory
  submission from 2027 is proposed (route B, tracked).
- Medicaid fee-for-service: carve-in entities are on the Medicaid Exclusion File and
  bill 340B drugs; carve-out entities must not use 340B stock for those claims. File
  changes take effect the next quarter, with the snapshot at 12:01 am Eastern on the
  15th of the month before.
- Medicaid managed care: the exclusion file doesn't apply; the state's rule (input)
  does.
**Output.** What the claim must carry, whether 340B stock may be used, and the
duplicate-discount risk if not.

### 7. `340b-rebate-model-clock` — 340B Rebate Model Deadlines

**Input.** Dispense date, the claim data submission date, and whether the drug is in
the model.
**Compute.** From the August 3, 2026 notice (91 FR): the model begins January 1, 2027
for the Medicare-negotiated drugs of the first two cycles; manufacturers pay within 10
calendar days of a complete claim; there's a 15-day inventory grace period.
**Build gate.** The earlier pilot was vacated in February 2026, and the revised model
may be challenged again. This tool is built only once the model is in effect on
January 1, 2027, after re-reading the notice and any litigation. Until then it stays in
the queue.

## Sources

- 42 U.S.C. 256b (uscode.house.gov); 42 CFR Part 10 (10.10); 61 FR 55156 (October 24,
  1996); *PhRMA v. HHS* (D.D.C. October 14, 2015).
- 42 U.S.C. 1396r-8(c) (rebates).
- HRSA Medicaid Exclusion File FAQ; CMS MLN4800856 (TB modifier, January 2026); CMS
  Medicare Part D 340B repository fact sheet (August 2026).
- 91 FR, August 3, 2026, 340B Rebate Model (govinfo 2026-15633).

## Data note

HRSA's OPAIS reports (covered entities, contract pharmacies, the Medicaid Exclusion
File) have no stable download URL or API, and hrsa.gov refuses non-browser clients.
They are **not** automated. The entity supplies its own registration details, which it
already has.

## Tests

- `340b-entity-eligibility`: a rural referral center at 8.00% is eligible and at 7.99%
  isn't; a DSH hospital at exactly 11.75% isn't.
- `340b-rx-match`: a prescription one day outside the look-back fails with that reason;
  an orphan drug at a critical access hospital fails even with a valid visit.
- `340b-ceiling-price`: a URA exceeding AMP gives $0.01, not a negative price.
