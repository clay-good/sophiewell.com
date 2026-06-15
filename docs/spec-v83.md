# spec-v83.md — Claim integrity & facility payment: validate the identifiers, balance the remittance, price the institutional claim; +6 tiles

> Status: **ACCEPTED (2026-06-15).** Shipped: `lib/billing-v83.js` (the six
> compute exports `npiValidate` / `mbiValidate` / `icd10Validate` / `eraBalance`
> / `drgPayment` / `apcPayment`), the six `views/group-b.js` renderers, the +6
> Group B catalog rows, the META entries with worked examples (validated by the
> example-correctness e2e sweep), the `billing-v83` ledger family (IPPS base
> rates, the OPPS conversion factor, the MBI grammar/excluded-letter set), the
> consolidated `test/unit/billing-v83.test.js` boundary suite (one file,
> mirroring the v81/v82 precedent rather than six files as §4 lists), and the
> six `docs/audits/v12/` logs. Catalog 360 → **366** — the program's end state,
> **337 → 366 (+29)**. Sixth and final feature spec of the
> [spec-v77](spec-v77.md) billing & coding program. It closes two gaps at once:
> **claim integrity** — the validators that catch a bad NPI/MBI/ICD-10 code or an
> out-of-balance remittance *before* the clearinghouse rejects it — and **facility
> payment** — the institutional (UB-04) side of reimbursement the professional
> [spec-v78](spec-v78.md) engine doesn't touch: IPPS DRG and OPPS APC pricing.
>
> Catalog effect: **360 → 366 (+6).** This is the program's end state: **337 →
> 366 (+29)**. Home: **Group B — Billing & Reimbursement** ([spec-v77](spec-v77.md)
> §3).
>
> Every tile obeys the [spec-v77](spec-v77.md) §2 doctrine. The facility-payment
> tiles **consume** the bundled `data/drg` and `data/apc` relative-weight corpora
> already on disk and take the base rate / conversion factor / wage index as dated
> constants or inputs (doctrine clause 2).

## 1. Thesis

Two families of deterministic work remain unbuilt.

**Claim integrity.** A claim is rejected at the door for a malformed identifier or
an unbalanced remittance — both checkable by pure algorithm before submission:

- An **NPI** carries a Luhn check digit over the code with the `80840` prefix; a
  one-character typo is provably detectable.
- An **MBI** has a fixed CMS character-position format (which positions are
  numeric, alphabetic, alphanumeric, and which letters are excluded); a malformed
  MBI is provably invalid.
- An **ICD-10-CM** code has a fixed structural grammar (category, etiology/site/
  laterality, the 7th-character extension, the placeholder `X`); a code missing a
  required 7th character or laterality is provably incomplete.
- An **835/EOB** must **balance**: billed = paid + patient responsibility + the sum
  of claim adjustments (the CAS group/reason amounts, CO/PR/OA/PI). An off-by-a-
  penny remittance is provably out of balance.

**Facility payment.** The UB-04 side of the house has its own pricing, which the
professional fee schedule doesn't compute:

- **IPPS** pays a DRG = relative weight × the hospital base rate (operating +
  capital), wage-index adjusted, before outlier/IME/DSH add-ons.
- **OPPS** pays an APC = relative weight × the OPPS conversion factor, wage
  adjusted, with status-indicator packaging and multiple-procedure discounting.

Six input→output tools. v83 ships them and the program is complete.

## 2. The six tiles

Each passes [spec-v29](spec-v29.md) §3, inherits the [spec-v59](spec-v59.md)
contract, cites its authority inline with `accessed` + ledger row, and renders the
[spec-v77](spec-v77.md) §2 posture note.

### 2.1 `npi-validate` — NPI Luhn check-digit validate / generate
- **Citation:** 45 CFR §162.406 (National Provider Identifier); the NPI check-
  digit is computed by the **Luhn algorithm (ISO/IEC 7812)** over the 9-digit
  identifier prefixed with the `80840` issuer prefix. CMS NPI standard.
- **citationUrl:** https://www.ecfr.gov/current/title-45/section-162.406
- **Group:** Billing & Reimbursement (`B`). **Audiences:** `billers`, `coders`,
  `credentialing`.
- **Inputs:** a 10-digit NPI to **validate**, or a 9-digit base to **generate** the
  check digit for.
- **Output:** **valid / invalid** with the **recomputed check digit** shown (so a
  transposition is visible), or the generated 10th digit. Catches the single most
  common provider-identifier typo before the claim rejects. Pure algorithm, no
  registry — it verifies the **format/check digit**, not that the NPI is *enrolled*
  (stated explicitly).

### 2.2 `mbi-validate` — Medicare Beneficiary Identifier format validator
- **Citation:** CMS Medicare Beneficiary Identifier (MBI) format specification:
  11 characters in a fixed position grammar (positions that are numeric, alphabetic,
  and alphanumeric), excluding the easily-confused letters **S, L, O, I, B, Z**.
- **citationUrl:** https://www.cms.gov/medicare/new-medicare-card
- **Group:** Billing & Reimbursement (`B`). **Audiences:** `billers`,
  `front-desk`.
- **Inputs:** an MBI string.
- **Output:** **valid / invalid against the CMS position grammar**, with the
  **first offending position and rule** named (e.g., "position 2 must be
  alphabetic; got `4`", or "contains excluded letter `O`"). Catches a
  mis-keyed MBI at registration, before it becomes a coverage-not-found rejection.
  Validates **format**, not active entitlement (stated explicitly).

### 2.3 `icd10-validate` — ICD-10-CM structural & specificity checker
- **Citation:** ICD-10-CM Official Guidelines for Coding and Reporting and the
  code-set conventions: the category/etiology/site/laterality structure, the
  **placeholder `X`**, and the **required 7th character** for certain chapters
  (e.g., injuries, OB). CMS/CDC annual ICD-10-CM files.
- **citationUrl:** https://www.cms.gov/medicare/coding-billing/icd-10-codes
- **Group:** Billing & Reimbursement (`B`). **Audiences:** `coders`, `billers`.
- **Inputs:** an ICD-10-CM code (and, where ambiguous, the chapter context that
  governs whether a 7th character is required).
- **Output:** whether the code is **structurally valid** and **coded to required
  specificity** — flagging a **missing 7th character**, a **misused/absent
  placeholder `X`**, an **unspecified-laterality** code where a lateralized one
  exists, and an invalid character pattern — with the specific rule named. The
  "this code will deny for lack of specificity" check, run before submission. It
  validates **structure and specificity** against the conventions; it does not
  assert the code is the *clinically correct* diagnosis (stated explicitly).
  **Near-neighbor:** reuses the bundled `data/icd10cm` shards for existence checks
  where available; the structural grammar works even for a code absent from the
  bundle (doctrine clause 2).

### 2.4 `era-balance` — 835 / EOB remittance balancing
- **Citation:** ASC X12 835 (Health Care Claim Payment/Advice) balancing
  requirements and the CAS (Claim Adjustment) segment group codes — **CO**
  (contractual obligation), **PR** (patient responsibility), **OA** (other
  adjustment), **PI** (payer-initiated): **billed = paid + sum(CAS amounts)**, and
  patient responsibility = sum(PR). CARC/RARC reason codes (CAQH CORE).
- **citationUrl:** https://x12.org/codes
- **Group:** Billing & Reimbursement (`B`). **Audiences:** `billers`,
  `posting`, `practice-managers`.
- **Inputs:** the billed charge; the paid amount; the claim-adjustment amounts by
  group code (CO/PR/OA/PI), optionally tagged with their CARC codes (resolved
  against the bundled `data/crosswalks/carc` we already ship).
- **Output:** whether the claim **balances** (billed − paid − Σadjustments = 0),
  the **out-of-balance amount** and where it sits if not, and the **patient-
  responsibility total** (ΣPR) the practice should post and bill. The pre-posting
  check that stops an unbalanced remittance from corrupting the ledger.
  **Near-neighbor:** `allowed-amount` (v82) *projects* the split from the contract;
  this *reconciles* the split the payer actually sent.

### 2.5 `drg-payment` — IPPS DRG payment estimate
- **Citation:** 42 CFR Part 412 (IPPS); DRG payment = **relative weight × hospital
  base rate** (operating + capital standardized amounts, wage-index adjusted),
  before outlier, IME, and DSH add-ons. CMS IPPS Final Rule; the DRG relative-weight
  table (bundled `data/drg`).
- **citationUrl:** https://www.cms.gov/medicare/payment/prospective-payment-systems/acute-inpatient-pps
- **Group:** Billing & Reimbursement (`B`). **Audiences:** `facility-billing`,
  `coders`, `practice-managers`.
- **Inputs:** the MS-DRG (its relative weight, GMLOS/AMLOS read from `data/drg`, or
  entered); the hospital's operating + capital base rates and wage index (dated
  constants / inputs); optional length of stay and the post-acute **transfer**
  flag (applies the per-diem transfer reduction); optional outlier/IME/DSH amounts
  as add-on inputs.
- **Output:** the **base DRG payment** (relative weight × wage-adjusted base rate,
  operating + capital), the **transfer-adjusted payment** when the stay is short and
  transferred, and the **total with any entered add-ons**, shown as a derivation.
  The "what will this admission pay" estimate the professional fee schedule can't
  give. Estimates the **operating model**; states that outlier/IME/DSH/new-tech
  precision requires the hospital's own cost-report factors.

### 2.6 `apc-payment` — OPPS APC payment estimate
- **Citation:** 42 CFR Part 419 (OPPS); APC payment = **relative weight × OPPS
  conversion factor**, wage adjusted, with **status-indicator** packaging (e.g.,
  separately payable vs packaged) and the multiple-procedure **discount** (a
  reduction on lower-weighted procedures on the same claim). CMS OPPS Final Rule;
  the APC relative-weight table (bundled `data/apc`).
- **citationUrl:** https://www.cms.gov/medicare/payment/prospective-payment-systems/hospital-outpatient
- **Group:** Billing & Reimbursement (`B`). **Audiences:** `facility-billing`,
  `coders`.
- **Inputs:** the APC(s) (relative weight + status indicator from `data/apc`, or
  entered); the OPPS conversion factor (dated constant, overridable); the wage
  index; for multiple procedures, the discount percentage on the subsequent
  lower-weighted services.
- **Output:** the **per-APC payment** (weight × CF × wage adjustment), the
  **packaging verdict** by status indicator (separately payable vs bundled into the
  primary), and the **multiple-procedure-discounted total** when several
  discountable procedures share the claim, shown as a derivation. The outpatient-
  facility counterpart to `rvu-payment`. **Near-neighbor:** `mppr` (v78) is the
  *professional* multiple-procedure reduction; this is the *OPPS* one.

## 3. Robustness

- **Validators are exact and reversible.** `npi-validate` recomputes the Luhn
  digit and shows it (a transposition is visible, not just "invalid");
  `mbi-validate` and `icd10-validate` name the **first offending position/rule**, so
  the user can fix the character, not just learn it's wrong. Each refuses to opine
  on enrollment/entitlement/clinical-correctness — it validates **format/structure**
  only, stated on the tile. Edge inputs (wrong length, empty, non-alphanumeric)
  return a precise `note`, never a crash or a false "valid."
- **`era-balance` is integer cents and proves the equation.** It shows
  `billed − paid − Σadjustments` to the cent and flags any nonzero residual; ΣPR is
  the postable patient balance. No float drift; the [spec-v59](spec-v59.md) fuzz
  gate applies.
- **Facility pricing reads bundled weights, takes rates as inputs.** `drg-payment`
  and `apc-payment` consume `data/drg`/`data/apc` relative weights and accept a
  hand-entered weight, base rate, CF, and wage index so they work for any DRG/APC or
  hospital not in the bundle (doctrine clause 2). They estimate the **base/operating
  model** and state plainly that outlier/IME/DSH (IPPS) and pass-through/comprehensive-
  APC nuances (OPPS) need the facility's own factors — no false precision.
- **Dated constants ledger-tracked.** The IPPS operating/capital base rates, the
  OPPS conversion factor, and the MBI excluded-letter set / position grammar get
  `pa-staleness-ledger.json` rows (ruleFamily `billing-v83`); `check-pa-staleness`
  guards them.

## 4. Files touched

```
docs/spec-v83.md                 (this file)
app.js                           (+6 UTILITIES rows in Group B)
views/group-b.js                 (renderers for the 4 integrity + 2 facility tiles; validator "offending position" + facility derivation blocks)
lib/billing-v83.js               (new compute exports: npiValidate, mbiValidate, icd10Validate, eraBalance, drgPayment, apcPayment; integer-cents helpers shared with billing-v78/v82)
lib/data.js                      (read data/drg, data/apc relative weights; data/crosswalks/carc for era-balance; data/icd10cm for icd10-validate existence checks)
lib/meta.js                      (+6 META entries: inline citation, citationUrl, accessed; related-tools links to rvu-payment, mppr, allowed-amount)
pa-staleness-ledger.json         (+rows: IPPS base rates, OPPS CF, MBI grammar/excluded letters — ruleFamily billing-v83)
lib/pa/staleness-ledger.js, scripts/check-pa-staleness.mjs   (recognize ruleFamily billing-v83)
test/unit/npi-validate.test.js … apc-payment.test.js  (6 unit tests, ≥3 boundary worked examples each, incl. Luhn transposition, each MBI/ICD-10 rule violation, an out-of-balance 835, a DRG transfer case, an OPPS multi-procedure discount)
test/integration/fuzz-tools.spec.js   (import lib/billing-v83.js)
docs/audits/v12/<each new tile>.md     (spec-v11 audit logs)
docs/scope-mdcalc-parity.md            (catalog 360 → 366; program 337 → 366 complete)
README.md, package.json                (catalog count 360 → 366; spec-progression line → v83; program summary)
CHANGELOG.md                           (Unreleased: v83 entry, +6; program total +29)
scripts/build-tool-pages.mjs           (classify validators as MedicalCalculator/HowTo as appropriate; live-catalog guard already enforces no dead ids — spec-v76)
```

## 5. Acceptance criteria

- All 6 tiles in §2 are live in Group B with a `META[id]` entry, inline cited
  output + `citationUrl` + `accessed`, ≥3 boundary worked examples per unit test, a
  [spec-v11](spec-v11.md) audit log, and pass [spec-v29](spec-v29.md) §3.
- `npi-validate` accepts a known-good NPI, rejects a transposed one, and shows the
  recomputed check digit; `mbi-validate` and `icd10-validate` name the first
  offending position/rule on malformed input and accept well-formed input;
  `era-balance` confirms a balanced 835 and reports the exact residual on an
  unbalanced one plus ΣPR; `drg-payment` reproduces a weight × base-rate example and
  a transfer case; `apc-payment` reproduces a weight × CF example, the status-
  indicator packaging verdict, and a multiple-procedure discount.
- Facility tiles read `data/drg`/`data/apc`; hand-entered weight/rate/CF/wage make
  them work off-bundle (doctrine clause 2 verified). Validators assert
  format/structure only and say so.
- All money is integer cents; every dated constant has a `pa-staleness-ledger.json`
  row (ruleFamily `billing-v83`); `check-pa-staleness` passes.
- `lib/billing-v83.js` is in the fuzz harness with zero non-finite / `Invalid Date`
  leaks; `UTILITIES.length` is **366** and all catalog-truth surfaces
  ([spec-v46](spec-v46.md)) agree; Group B holds the full Billing & Reimbursement
  suite.
- `npm run lint`, `npm run test`, `npm run sbom`, `npm run build`,
  `npm run check-pa-staleness` pass; CHANGELOG records v83 with +6 and the program
  total of **+29 (337 → 366)**.

## 6. Out of scope for v83

- **No live NPI/MBI registry or eligibility lookup** ([spec-v77](spec-v77.md) §8):
  the validators check format/check-digit/structure, not enrollment or entitlement.
- **No full IPPS/OPPS pricer.** `drg-payment`/`apc-payment` estimate the base/
  operating model from relative weights and entered rates; the GROUPER, full
  outlier/IME/DSH/pass-through math, and the hospital's cost-report factors are out
  of scope and stated as such on the tile.
- **No browsable code/identifier directory.** No searchable NPI registry, no MBI
  list, no full ICD-10-CM browser, no DRG/APC catalog beyond the relative-weight
  values used to compute — per the program charter, these are calculators and
  validators, not lookups.
