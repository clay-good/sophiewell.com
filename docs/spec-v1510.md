# spec-v1510 — Drug pricing and reimbursement

**Status:** Proposed, September 25, 2026. 7 new tools, group Q (tools 2, 3, 5–7) and group B (tools 1 and 4).
**Charter:** [spec-v1500](spec-v1500.md). **Data:** [spec-v1517](spec-v1517.md).

Independent pharmacies and infusion practices lose money on drugs they can't see the
margin on. The federal price files that show it (ASP, NADAC, the negotiated Medicare
prices) are public and machine-readable, but most small operators never open them.
These tools do the arithmetic against those files.

## Tools

### 1. `asp-payment` — Medicare Part B Drug Payment (ASP-Based)

**Input.** HCPCS code, units, quarter, product type (single-source, biosimilar,
340B-acquired in a hospital outpatient department).
**Compute.**
- Standard: 106% of ASP (42 U.S.C. 1395w-3a(b)(1)), from the quarter's payment-limit
  file.
- Biosimilar: its own ASP plus 6% of the reference product's ASP. A qualifying
  biosimilar (ASP not above the reference's) gets 8% instead, for 5 years from October
  1, 2022 or from its first payment quarter if later ((b)(8)). The window is computed
  per product, not assumed to end in 2027.
- 340B-acquired drugs in a hospital outpatient department: ASP + 6% in 2026. The CY2027
  OPPS proposed rule would pay ASP − 33.4% from January 1, 2027; carried as a
  **proposed** edition, switched on only if finalized.
**Output.** Allowed amount, Medicare's payment after the patient's coinsurance
(`part-b-drug-coinsurance`), and sequestration (`sequestration-adjust`).

### 2. `nadac-margin` — Pharmacy Margin Against NADAC

**Input.** NDC, quantity dispensed, and the reimbursement received (ingredient cost
plus dispensing fee).
**Compute.** NADAC per unit on the date of service × quantity = the national average
acquisition cost. Margin = reimbursement − that cost. The reader can replace NADAC with
their invoice cost.
**Output.** Margin in dollars and percent, the NADAC effective date used, and whether
the reimbursement is below average acquisition cost.
**Batch.** A claims CSV gives margin by drug, by payer and in total. This is how a small
pharmacy finds out which contracts lose money.
**Data.** NADAC via the data.medicaid.gov API (route A, weekly). The builder resolves
each year's new dataset identifier by search ([spec-v1517](spec-v1517.md)).

### 3. `mfp-refund-check` — Medicare Negotiated-Price Refund Check (Pharmacy)

**Input.** NDC, units, date of service, and the pharmacy's acquisition cost or WAC
(reader input).
**Compute.** The maximum fair price per unit on the date of service (the CMS file), and
the refund the pharmacy should receive through the Medicare Transaction Facilitator,
computed on the standard default refund amount basis. **The exact definition of that
amount is to be read in the IPAY 2027 final guidance before build**; the tool doesn't
assume WAC − MFP until it's confirmed.
**Timing.** Plans submit claim data within 7 days, manufacturers instruct payment within
14 days, and banking takes up to 5 business days (CMS dispensing-entity fact sheet,
April 2026). The tool gives the expected latest date and flags a refund that's late.
**Output.** Expected refund, the due-by date, and whether the reimbursement plus refund
covers acquisition cost.

### 4. `medicaid-ura` — Medicaid Unit Rebate Amount

**Input.** AMP, best price, drug category, and the inflation inputs (baseline AMP and
CPI-U values).
**Compute.** 42 U.S.C. 1396r-8(c) as in `340b-ceiling-price`, which reuses this
function. There is no cap after 2023.
**Output.** Basic and additional rebate per unit, and the total URA.

### 5. `pbm-reimbursement-check` — Pharmacy Benefit Manager Reimbursement Check

**Input.** The contract's formula as reader input (for example, AWP − 18% + $1.50, or
WAC + 2%, or a MAC price per unit), the benchmark prices the reader has for the claim,
the quantity, and the acquisition cost.
**Compute.** Expected reimbursement under the contract, compared with the amount
paid, and with acquisition cost.
**Output.** Underpaid or not against the contract, and underwater or not against cost.
**Scope.** Ships no AWP or WAC data (they're licensed). All benchmarks are reader input.

### 6. `therapy-cost-compare` — Annual Therapy Cost Comparison

**Input.** Two or more regimens (for example, a reference biologic and two biosimilars),
each with dose, schedule, units per dose, and a price basis (ASP payment, NADAC, or a
reader-entered price).
**Compute.** Units per year, including loading doses in the first year, cost per
administration, cost for year one and for later years, and waste from `vial-rounding`
where vial sizes are given.
**Output.** A side-by-side table for a P&T committee or a payer, with every price's
source and date.

### 7. `mfp-refund-reconcile` — Negotiated-Price Refund Reconciliation (Upload)

**Input.** The pharmacy's dispensing claims for negotiated drugs (CSV) and the refund
remittances received (CSV, as the pharmacy's system exports them).
**Compute.** Matches each claim to its refund by prescription, fill and date. Computes
the expected refund (tool 3), and flags missing, short and late refunds.
**Output.** A reconciliation table and the total owed. The drugs affected cost hundreds
to thousands of dollars per fill, so a missed refund matters to a small pharmacy.

## Sources

- 42 U.S.C. 1395w-3a (ASP payment, biosimilar add-on); 42 U.S.C. 1396r-8(c) (rebates).
- CMS ASP pricing files; CMS CY2026 OPPS final rule and CY2027 OPPS proposed rule fact
  sheets.
- data.medicaid.gov NADAC dataset and API.
- CMS negotiated-prices file; CMS Medicare Transaction Facilitator dispensing-entity
  fact sheet (April 2026); IPAY 2027 final guidance (to be read at build).

## Tests

- `asp-payment`: a qualifying biosimilar first paid in Q4 2027 still gets 8% in 2031.
- `nadac-margin`: a claim reimbursed one cent below NADAC is flagged.
- `mfp-refund-reconcile`: a refund arriving one day after its expected latest date is
  flagged as late; a duplicate refund is flagged.

## Build status

- **Built 2026-09-26:** `mfp-refund-check`, `medicaid-ura` (group B) and `pbm-reimbursement-check`.
  - The refund definition this spec asked to confirm is in the IPAY 2027 final guidance, section 40.4.1: the
    standard default refund amount is WAC per unit minus MFP per unit on the date of service, times the
    quantity; a manufacturer may pay another amount it reports. The timeline (7 days, 14 days, up to 5
    business days) is from the CMS fact sheet for dispensing entities (April 2026). The MFP per unit is the
    reader's figure from the CMS file (its NDC-9 unit price); the drug's negotiated-price status on the date
    comes from the table `partd-mfp-price-check` uses.
  - `medicaid-ura` holds the rebate computation, and `340b-ceiling-price` now calls it, as this spec says.
  - `pbm-reimbursement-check` ships no AWP, WAC or MAC data.
  - `therapy-cost-compare` takes up to three regimens with the reader's prices and sources; partial-vial waste
    is left to `vial-rounding`.
- **Built 2026-09-30:** `nadac-margin` (single claim), in `lib/nadac-margin.js`.
  - It prices from the bundled NADAC week (`data/nadac`, fetched weekly per [spec-v1621](spec-v1621.md)). A
    row answers only from its effective date through the week's as-of date; any other date is "no
    benchmark", never the current rate. An NDC outside the week, a failed load, or lapsed data asks for
    the invoice cost instead. The manifest's shard list is checked before fetching, so an offline failure
    is never reported as "not in NADAC".
  - NDCs are normalized from 4-4-2, 5-3-2 and 5-4-1 to 11 digits; 10 bare digits are refused, since the
    padded segment cannot be known.
  - The worked example prices from an invoice cost, because a NADAC-priced example would change weekly.
- **Built 2026-09-30:** `asp-payment`, with the new `asp` dataset (`scripts/data/builders/asp.mjs`, the section 508
  CSV of the newest quarterly ZIP, found by link name on the CMS page; 918 codes in 2026 Q4).
  - **Differed from the spec:** the tool prices from the payment limit CMS posts per HCPCS unit, not from a
    recomputed 106% of ASP: the file does not post ASP, and the limit already carries the biosimilar add-on (its
    Notes say "8% of reference add-on applied") and other methods ("lesser of", AMP-based). The coinsurance is
    the file's, so an inflation-adjusted coinsurance is used as posted. The product-type input was dropped for the
    same reason. The 340B hospital outpatient rate is not computed: it is set in each year's OPPS rule, which was
    not read for this build; the result says so.
  - A date outside the quarter on file, or a code the file lists with no limit (radium-223 posts "N/A" and its AWP
    in a note), is not priced; a limit typed from another quarter's file replaces the lookup.
- **Built 2026-10-01:** `nadac-margin`'s batch mode: a pharmacy claims CSV through the upload workbench gives margin
  by payer and by drug (lowest first) and in total, each claim through `nadacOn`; a row's own invoice cost replaces
  NADAC for that row. A payer paid below cost overall is named. The Worker keeps its no-network promise: it names
  the labelers it needs, and the page loads them through `lib/nadac-load.js` and runs it again.
- **Built 2026-10-03:** `mfp-refund-reconcile`. The MTF's remittances are X12 835 files (CMS MTF dispensing-entity
  FAQ, April 2026); the field map is the MTF 835 companion guide (CMS draft; the final is on the MTF help desk,
  behind registration): CLP01 is the prescription reference number, "FILL" and the fill number, CLP03 the standard
  default refund, CLP04 the manufacturer's payment, CLP07 the MTF claim number (REF*F8 names the original on a
  reversal), CAS*PI*307 with RARCs N907-N911 in LQ*HE. Claims come typed or through the upload workbench; the 835
  files are read on the page with `parse835`, which now keeps LQ remark codes and reads reversals (negative
  amounts, CLP02 22: the reader used to refuse them). Each claim is refunded, short (with the remark code's
  meaning, or "no reason code"), late (paid after 21 days plus 5 business days from the date of service, the
  `mfp-refund-check` rule), missing, not yet due, or paid more than once; a reversal cancels the payment it
  names. The as-of date is the latest 835 payment date unless entered, so nothing depends on today's clock. With
  WAC and MFP per unit the 835's own standard default refund is checked too. The receipt names the 835 files by
  SHA-256.
