# spec-v82.md — Patient responsibility & coordination of benefits: what the patient actually owes; +4 tiles

> Status: **PROPOSED (2026-06-13).** Fifth feature spec of the
> [spec-v77](spec-v77.md) billing & coding program. [spec-v78](spec-v78.md)
> computes what the *payer* pays; this spec computes what the *patient* owes —
> Medicare Part A/B cost-share, coordination of benefits with a secondary payer,
> the contractual write-off vs patient balance on any contracted claim, and the
> No Surprises Act cost-share that caps an out-of-network bill. These are the
> numbers on the statement the patient actually reads, and they are pure
> arithmetic that practices routinely get wrong.
>
> Catalog effect: **356 → 360 (+4).** Home: **Group C — Patient Bill & Insurance
> Tools** (the existing patient-facing group, beside `appeal-deadline` and the EOB
> work), per [spec-v77](spec-v77.md) §3.
>
> Every tile obeys the [spec-v77](spec-v77.md) §2 doctrine; money is integer cents
> ([spec-v59](spec-v59.md) safety), dated cost-share constants are ledger-tracked,
> and each renders the "rule's math, not a coverage determination" note.

## 1. Thesis

Patient liability is deterministic once the allowed amount and the benefit design
are known — but it spans several methods practices conflate:

- **Medicare cost-share** is not "20% of everything." Part A inpatient has a
  per-benefit-period deductible, day-61–90 and lifetime-reserve coinsurance, and a
  SNF day-21–100 daily coinsurance; Part B has its own annual deductible then 20%
  of the *allowed* (not the *charge*). Each is a dated dollar amount.
- **Coordination of benefits** is not "the secondary pays the other 80%." It pays
  by a method — lesser-of, come-out-whole, or non-duplication — against *its own*
  allowed, and Medicare Secondary Payer has its own formula.
- **The contractual write-off** is the gap between the charge and the contracted
  allowed; billing the patient that gap (balance billing) is usually prohibited,
  and the patient owes only deductible/coinsurance/copay on the *allowed*.
- **The No Surprises Act** caps the patient's cost-share for protected out-of-
  network services at the **in-network** amount computed off the **QPA**.

Four input→output calculators. v82 ships all four, each citing the controlling
authority and computing in integer cents.

## 2. The four tiles

Each passes [spec-v29](spec-v29.md) §3, inherits the [spec-v59](spec-v59.md)
contract, cites its authority inline with `accessed` + ledger row, and renders the
[spec-v77](spec-v77.md) §2 posture note.

### 2.1 `medicare-cost-share` — Part A & Part B patient liability
- **Citation:** SSA Title XVIII; the annual CMS Medicare cost-sharing amounts —
  Part A inpatient deductible per benefit period, days 61–90 and lifetime-reserve
  coinsurance, SNF days 21–100 daily coinsurance; Part B annual deductible then
  **20%** of the Medicare-approved amount. CMS annual cost-sharing notice.
- **citationUrl:** https://www.cms.gov/medicare/payment
- **Group:** Patient Bill & Insurance Tools (`C`). **Audiences:** `patients`,
  `billers`, `practice-managers`.
- **Inputs:** the benefit (Part B service with its Medicare-approved amount and
  remaining-deductible status; **or** Part A inpatient with length of stay /
  lifetime-reserve election; **or** SNF with the day count); the relevant dated
  amounts (preset current CMS values, overridable for a prior year).
- **Output:** the **patient's liability** broken into **remaining deductible +
  coinsurance** (Part B: deductible then 20% of the allowed; Part A: the day-banded
  deductible/coinsurance over the stay; SNF: the day-21–100 daily amount × eligible
  days), shown as a derivation, with the explicit note that this is **before** any
  Medigap/secondary coverage (which `cob-calc` then applies). The statement number
  a Medicare patient is actually charged. **Near-neighbor:** `sequestration-adjust`
  (v78) reduces the *program* payment, **not** this patient share — cross-noted.

### 2.2 `cob-calc` — coordination of benefits / Medicare Secondary Payer
- **Citation:** 42 CFR Part 411 and CMS Pub. 100-05 (Medicare Secondary Payer
  Manual); the standard COB methods — **lesser-of**, **come-out-whole (benefits-
  less-paid)**, and **non-duplication** — and the MSP calculation (Medicare pays the
  lower of its normal payment or the gap the primary left).
- **citationUrl:** https://www.cms.gov/medicare/coordination-benefits-recovery
- **Group:** Patient Bill & Insurance Tools (`C`). **Audiences:** `billers`,
  `patients`, `practice-managers`.
- **Inputs:** the billed charge; the **primary** payer's allowed and paid amounts
  and the patient cost-share it assigned; the **secondary**'s allowed amount and
  benefit; the COB method (lesser-of / come-out-whole / non-duplication / MSP).
- **Output:** the **secondary payer's payment** under the selected method and the
  **patient's residual** after both payers, shown as a derivation that makes the
  method's logic visible (e.g., come-out-whole pays up to the patient's primary
  cost-share but not above the secondary's allowed). The calculation that decides
  whether a dual-coverage patient owes $0 or a real balance — and the single most
  error-prone arithmetic in a billing office. **Near-neighbor:** `medicare-cost-
  share` (computes the Medicare-primary share this can then coordinate);
  `allowed-amount` (single-payer write-off).

### 2.3 `allowed-amount` — contractual write-off vs patient balance
- **Citation:** standard third-party-payer contract accounting and the
  prohibition on balance-billing a contracted allowable: patient owes only the
  benefit cost-share (deductible/coinsurance/copay) on the **allowed**, and the
  charge-minus-allowed gap is a **contractual adjustment**, not patient debt.
  Anchored to the payer-contract method the user enters.
- **citationUrl:** https://www.cms.gov/medicare/regulations-guidance
- **Group:** Patient Bill & Insurance Tools (`C`). **Audiences:** `billers`,
  `patients`, `practice-managers`.
- **Inputs:** the billed charge; the contracted allowed amount (or the contract's
  **% of Medicare**, computed against a `rvu-payment` allowed); the benefit design
  (deductible remaining, coinsurance %, and/or copay); whether the provider is in-
  network (gates whether the write-off is required).
- **Output:** the **contractual write-off** (charge − allowed), the **patient
  responsibility** (deductible + coinsurance/copay on the allowed), and the **payer
  payment** (allowed − patient responsibility), with a flag when an in-network claim
  would otherwise be **balance-billed** (the gap must be written off, not charged).
  The line-level "where did the money go" reconciliation. **Near-neighbor:**
  `era-balance` (v83) checks a *posted* remittance balances; this *projects* it
  from the contract.

### 2.4 `nsa-cost-share` — No Surprises Act QPA-based patient cost-share
- **Citation:** No Surprises Act (Public Health Service Act §2799A-1/§2799A-2;
  45 CFR Part 149): for protected out-of-network emergency services and certain
  non-emergency services at in-network facilities, the patient's cost-share is
  computed as if **in-network**, based on the **Qualifying Payment Amount (QPA)**,
  and **balance billing is prohibited**.
- **citationUrl:** https://www.cms.gov/nosurprises
- **Group:** Patient Bill & Insurance Tools (`C`). **Audiences:** `patients`,
  `billers`, `practice-managers`.
- **Inputs:** the service category (protected emergency / protected ancillary at an
  in-network facility / non-protected — the gate on whether the NSA cap applies);
  the **QPA**; the patient's in-network benefit (deductible remaining, coinsurance
  %, copay); the provider's billed charge.
- **Output:** whether the service is **NSA-protected**, the **patient cost-share
  capped at the in-network/QPA-based amount**, the **prohibited balance-bill
  amount** the patient may *not* be charged (billed charge − allowed, when
  protected), and a hard "not a protected service — the NSA cap does **not** apply"
  when it doesn't. The calculator that tells a patient the legally maximum they owe
  on a surprise bill. *Computes the cost-share number only — it does **not** revive
  the v29-retired NSA/IDR eligibility infographic ([spec-v63](spec-v63.md) §7).*

## 3. Robustness

- **All money is integer cents, one format at the edge.** Deductible-then-
  coinsurance ordering is encoded once (deductible consumed first, coinsurance on
  the remainder) and tested where the deductible partially covers the allowed — the
  boundary practices miscompute. Zero non-finite leaks from the
  [spec-v59](spec-v59.md) fuzz harness is a merge gate; a charge below the
  deductible, a zero allowed, and a paid-exceeds-allowed input each return a `note`,
  never a negative patient balance.
- **COB methods are explicit and individually tested.** Lesser-of, come-out-whole,
  non-duplication, and MSP are four named code paths, each with a worked example;
  the tool never silently picks a method.
- **The protection/coverage gate is hard, not advisory.** `nsa-cost-share` and
  `allowed-amount` refuse to apply the cap/write-off when the service isn't
  protected / the provider isn't in-network, rather than defaulting to the
  patient-favorable answer — because the wrong default here is a compliance problem
  in both directions.
- **Dated cost-share constants ledger-tracked.** The Part A/B deductibles and
  coinsurance, the SNF daily amount, and the 20% Part B coinsurance get
  `pa-staleness-ledger.json` rows (ruleFamily `billing-v82`) with `lastVerified`;
  `check-pa-staleness` fails the build when CMS's annual update isn't reflected. The
  year-override input lets a user reconcile a prior-year claim without waiting for a
  refresh.

## 4. Files touched

```
docs/spec-v82.md                 (this file)
app.js                           (+4 UTILITIES rows in Group C)
views/group-c.js                 (renderers for the 4 patient-money tiles; deductible→coinsurance + COB-method derivation blocks)
lib/billing-v82.js               (new compute exports: medicareCostShare, cobCalc, allowedAmount, nsaCostShare; integer-cents helpers shared with lib/billing-v78.js)
lib/meta.js                      (+4 META entries: inline citation, citationUrl, accessed; related-tools links to appeal-deadline, rvu-payment, era-balance)
pa-staleness-ledger.json         (+rows: Part A/B deductibles & coinsurance, SNF daily, Part B 20% — ruleFamily billing-v82)
lib/pa/staleness-ledger.js, scripts/check-pa-staleness.mjs   (recognize ruleFamily billing-v82)
test/unit/medicare-cost-share.test.js … nsa-cost-share.test.js  (4 unit tests, ≥3 boundary worked examples each, incl. deductible-partially-covers, each COB method, protected/not-protected NSA gate)
test/integration/fuzz-tools.spec.js   (import lib/billing-v82.js)
docs/audits/v12/<each new tile>.md     (spec-v11 audit logs)
docs/scope-mdcalc-parity.md            (catalog 356 → 360)
README.md, package.json                (catalog count 356 → 360; spec-progression line → v82)
CHANGELOG.md                           (Unreleased: v82 entry, +4)
```

## 5. Acceptance criteria

- All 4 tiles in §2 are live in Group C with a `META[id]` entry, inline cited
  output + `citationUrl` + `accessed`, ≥3 boundary worked examples per unit test, a
  [spec-v11](spec-v11.md) audit log, and pass [spec-v29](spec-v29.md) §3.
- `medicare-cost-share` reproduces the Part B deductible-then-20% example and a
  Part A day-banded stay; `cob-calc` returns the correct secondary payment and
  patient residual for each of lesser-of / come-out-whole / non-duplication / MSP;
  `allowed-amount` returns write-off + patient responsibility + payer payment and
  flags a would-be balance-bill in-network; `nsa-cost-share` caps a protected
  service at the QPA-based in-network amount and refuses the cap on a non-protected
  one.
- All money is integer cents; deductible-before-coinsurance ordering is tested at
  the partial-deductible boundary; every dated constant has a
  `pa-staleness-ledger.json` row (ruleFamily `billing-v82`); `check-pa-staleness`
  passes.
- `lib/billing-v82.js` is in the fuzz harness with zero non-finite leaks;
  `UTILITIES.length` is **360** and catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, `npm run build`,
  `npm run check-pa-staleness` pass; CHANGELOG records v82 with +4.

## 6. Out of scope for v82

- **No NSA/IDR eligibility infographic or dispute-process tree** ([spec-v63](spec-v63.md)
  §7, [spec-v77](spec-v77.md) §8): `nsa-cost-share` computes the patient cost-share
  number only.
- **No eligibility / benefit-verification transaction.** Deductible-remaining and
  benefit design are entered by the user; v82 ships no 270/271 lookup and no payer
  benefit directory.
- **No tax, financial-assistance, or charity-care scoring.** The tiles compute the
  contractual/statutory patient responsibility; downstream discounting is out of
  scope.
