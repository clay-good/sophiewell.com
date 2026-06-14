# spec-v77.md — Billing & Coding Suite: program charter, design doctrine, and the new "Billing & Reimbursement" group

> Status: **ACCEPTED (2026-06-13).** Charter realized: [spec-v78](spec-v78.md)
> shipped the first feature spec, creating Group B "Billing & Reimbursement"
> (`views/group-b.js`, `lib/billing-v78.js`) and taking the catalog 337 -> 342.
> The doctrine in §2 is the cited contract for the remaining feature specs
> ([v79](spec-v79.md)-[v83](spec-v83.md), still PROPOSED). Charter spec — **zero
> tiles of its own.**
> v77 is the umbrella for a six-spec program ([spec-v78](spec-v78.md) through
> [spec-v83](spec-v83.md)) that builds a world-class, US-standard medical
> **billing & coding** tool suite on top of the deterministic-calculator
> contract this catalog already enforces. It adds **no tile** by itself; it
> defines the doctrine every suite tile obeys, the new home group, the data
> strategy, and the catalog accounting so the six feature specs can be reviewed
> one at a time.
>
> Catalog effect at v77 close: **337 tiles, unchanged.** The program as a whole
> ([v78–v83](spec-v83.md)) takes the catalog **337 → 366 (+29)**.
>
> Every prior spec (v4 through v76) remains in force. No runtime network call,
> no AI, no ETL — the [spec-v29](spec-v29.md) §3 one-line test and the
> [spec-v59](spec-v59.md) output-safety contract govern every tile added here.

## 1. Why this program exists

The catalog is strong on the **clinician at the bedside** and competent on
**operations clocks** ([spec-v63](spec-v63.md): appeal/timely-filing/PA/
overpayment deadlines, the 2021 E/M selectors, the NDC 10↔11 converter). What it
does **not** yet have is the thing a working **revenue-cycle** professional
reaches for fifty times a day: the math that decides **what a claim will actually
pay, why it will deny, and what the patient will owe** — computed, not looked up.

A coder can Google "what is modifier 25." They cannot Google the answer to:

- *"This surgeon did a 090-global procedure on May 2 and saw the patient again on
  June 1 for an unrelated problem — is that visit inside the global package, and
  if not, which modifier unlocks payment?"*
- *"Four surgical lines on one claim — after the multiple-procedure reduction and
  the bilateral line at indicator 1, what does Medicare allow in this locality?"*
- *"This J-code vial is 100 mg, the dose was 70 mg — how many billing units, and
  how many JW units of waste, and is JZ required because there's none?"*
- *"Primary paid $X on an allowed of $Y; what's the secondary's obligation and the
  patient's residual?"*

Those are **deterministic computations** over a handful of inputs and a few dated
constants. They are exactly the shape this catalog is built for, and they are the
highest-leverage, least-Googleable tools a biller or coder can carry on a phone.
This program builds them.

### Design pivot, stated plainly

This is an **expansion of surface, not a pivot of mission**. The
[nurse-first intent](spec-v62.md) governs what we *deepen*; it has never meant
removing the healthcare-operations surface. Billing and coding stay first-class
(see the project memory's nurse-first note). v77 deliberately **invests** in that
surface because the computational billing tools are underbuilt relative to their
real-world value, and because every one of them passes the same determinism bar
as a creatinine-clearance calculator.

## 2. The suite doctrine (binding on every v78–v83 tile)

Every tile added by this program MUST satisfy all of the following. A feature spec
that cannot meet a clause for a given tile must either redesign the tile or drop
it — not relax the doctrine.

1. **One-line test ([spec-v29](spec-v29.md) §3).** Inputs in, a deterministic
   number/decision out. No AI, no network, no server. Works fully offline through
   the service worker like every other tile.

2. **Input-or-bundled-data, never a browsable index.** Where a computation needs a
   payer- or quarter-specific value that is large, fast-moving, or licensed (an
   NCCI edit pair, an MUE value, a GPCI triplet, a conversion factor), the tile
   accepts that value **as an input** and computes from it — the
   [`timely-filing`](spec-v63.md) posture ("the user supplies their plan's
   limit"). A bundled lookup is an **optional convenience layer** for the
   public-domain CMS values we already ship or can ship cheaply (RVUs, global
   periods, DRG/APC relative weights, POS, revenue/CARC/RARC crosswalks), never
   the thing that makes the tool work. This keeps the bundle light, keeps the
   tool honest when the data is stale, and keeps us out of the [spec-v29](spec-v29.md)
   §3 "code-reference dump" territory the catalog already retired.

3. **Dated constants are ledger-tracked.** Any number that CMS revises on a
   calendar (the conversion factor, the Part A/B deductibles and coinsurance, the
   sequestration percentage, the amount-in-controversy gates, the assistant/co-
   surgeon percentages, the IPPS/OPPS base rates) is a **dated constant with a
   row in [`pa-staleness-ledger.json`](../pa-staleness-ledger.json)** and an
   `accessed` date inline ([spec-v60](spec-v60.md)/[spec-v63](spec-v63.md) OA4).
   `scripts/check-pa-staleness.mjs` guards its currency in CI. A new ledger
   ruleFamily `billing-v78`…`billing-v83` carries these per spec.

4. **Output-safety contract ([spec-v59](spec-v59.md)).** No tile may emit `NaN`,
   `Infinity`, `Invalid Date`, or a silently-wrong number. Every compute function
   joins the fuzz harness on import; zero non-finite leaks is a merge gate. Money
   is computed in integer cents and formatted once at the edge.

5. **"This is the rule's math, not a payment guarantee or coding advice."** Every
   tile renders the [`breach-clock`/`regulatory.js`](spec-v63.md) posture note:
   it surfaces the computation under the cited authority and the user's inputs; it
   does not adjudicate the claim, certify medical necessity, or replace the
   payer's contract. Coding tiles add: *confirm code selection against the current
   CPT®/HCPCS code set and your documentation.*

6. **Primary US sources only ([spec-v48](spec-v48.md)/[spec-v61](spec-v61.md)
   citation rule).** CFR, CMS manuals (Pub. 100-04 Claims Processing, 100-05 MSP,
   100-08 Program Integrity), CMS MLN booklets, the AMA CPT E/M guidelines, ASC
   X12, and the ICD-10-CM Official Guidelines. Each tile ships an inline
   `Citation` + `citationUrl` and a [spec-v11](spec-v11.md) audit log naming the
   exact section/column each number comes from. No secondary commentary.
   *CPT is a registered trademark of the AMA; the suite computes with codes the
   user supplies and ships no proprietary CPT descriptor file.*

7. **Mobile-first, single-thumb.** Every tile fits the [spec-v72](spec-v72.md)
   44px touch-target and no-horizontal-scroll contract. Inputs are numeric where
   possible (so the numeric keypad opens), money fields are `inputmode="decimal"`,
   and the show-your-work derivation ([spec-v48](spec-v48.md) `<dl>` block) reads
   top-to-bottom on a phone with no table that scrolls sideways. A biller standing
   at a scanner can run any of these one-handed.

## 3. The new home: Group B — "Billing & Reimbursement"

The catalog's view modules use single-letter groups (`views/group-a.js`,
`group-c.js`, …). Letters **B** and **D** are currently unused. This program
claims **Group B = "Billing & Reimbursement"** as the deliberate home for the
computational coding/payment/edit tiles (v78–v81, v83 facility + integrity),
served by a new `views/group-b.js`. Patient-facing money tools (v82) stay in the
existing **Group C — "Patient Bill & Insurance Tools"**, beside `appeal-deadline`
and the EOB/cost work, because their audience is the patient, not the back office.

Introducing a group is a one-time charter act recorded here so the six feature
specs need not re-litigate placement: each says "Group B" or "Group C" and moves
on. The home/topic-hub surface gains one group card ("Billing & Reimbursement");
no existing tile changes group.

## 4. The roster (what each feature spec ships)

| Spec | Theme | Tiles | Δ | Running total |
|---|---|---|---|---|
| **[v78](spec-v78.md)** | MPFS reimbursement engine | `rvu-payment`, `mppr`, `bilateral-pay`, `multi-surgeon-pay`, `sequestration-adjust` | +5 | 342 |
| **[v79](spec-v79.md)** | Claim edits & modifier logic | `ncci-ptp`, `mue-check`, `modifier-x-selector`, `global-period`, `modifier-order` | +5 | 347 |
| **[v80](spec-v80.md)** | E/M & time-based coding (2023 overhaul, completed) | `em-mdm-2023`, `critical-care-time`, `split-shared`, `prolonged-services`, `therapy-units`, `anesthesia-units` | +6 | 353 |
| **[v81](spec-v81.md)** | Drug & infusion billing | `ndc-hcpcs-units`, `drug-wastage`, `infusion-hierarchy` | +3 | 356 |
| **[v82](spec-v82.md)** | Patient responsibility & COB | `medicare-cost-share`, `cob-calc`, `allowed-amount`, `nsa-cost-share` | +4 | 360 |
| **[v83](spec-v83.md)** | Claim integrity & facility payment | `npi-validate`, `mbi-validate`, `icd10-validate`, `era-balance`, `drg-payment`, `apc-payment` | +6 | 366 |

**Program total: +29 tiles, 337 → 366.** Each spec is independently shippable and
independently reviewable; they may land in any order, and the program is valuable
even if only the first one or two ship. Each feature spec re-states its own
running catalog count in its acceptance criteria; the count above is the intended
end state if all six land.

### Deliberate non-duplication with what exists

The program **extends**, never shadows, the [spec-v63](spec-v63.md) ops cluster
and the existing coding tiles. Named near-neighbors:

- `em-mdm-2023` (v80) **extends** `em-mdm` (office-only, 99202–99215) to inpatient/
  observation/ED/nursing-facility/home settings; the office tile stays and the two
  cross-link.
- `ndc-hcpcs-units` (v81) is a **billing-unit** computation; the existing
  `ndc-convert` is a **format** converter (10↔11 digit). Different jobs; both stay.
- The v78 reimbursement tiles **consume** the bundled `data/mpfs`, `data/apc`,
  `data/drg`, `data/hcpcs-modifiers`, and `data/pos-codes` corpora already on disk;
  they add the policy-indicator and GPCI/CF inputs those datasets don't carry.
- `nsa-cost-share` (v82) computes the patient's **cost-share number** under the No
  Surprises Act; it does **not** revive the v29-retired NSA/IDR *eligibility
  infographic* ([spec-v63](spec-v63.md) §7). Calculator, not browsable tree.

## 5. Data strategy (the bundle stays light)

Per doctrine clause 2, the program adds at most these public-domain CMS datasets,
all annual-or-slower refresh (the [spec-v5](spec-v5.md) §2 no-ETL rule):

- **`data/gpci`** (new, v78) — Geographic Practice Cost Index triplets (work, PE,
  MP) by Medicare locality. Small (~110 localities × 3). User may override with a
  hand-entered triplet, so the tool works for any locality even if the bundle lags.
- **`data/mpfs` schema extension** (v78/v79) — add the reimbursement-policy
  indicator columns the engine needs and CMS already publishes in the same PFS
  Relative Value file: multiple-procedure (`MULT PROC`), bilateral (`BILAT SURG`),
  assistant-at-surgery (`ASST SURG`), co-surgeon (`CO SURG`), team-surgeon
  (`TEAM SURG`). These are small enums (0–9) per existing code row.
- **Conversion factors** (v78 PFS CF, v83 OPPS CF) and **base rates** (v83 IPPS
  operating/capital) — single dated scalars, ledger-tracked, **not** datasets.
- **No NCCI PTP table and no MUE table are bundled** (v79). They are large
  quarterly CMS files; the tiles take the edit indicator / MUE value as input
  (doctrine clause 2). An optional thin sample may seed examples, clearly labeled
  "illustrative, not the live edit file."

Everything else (DRG/APC relative weights, POS, revenue/CARC/RARC crosswalks,
HCPCS modifiers, ICD-10-CM, NDC) **already ships** and is reused as-is.

## 6. Files touched (charter only)

```
docs/spec-v77.md                 (this file)
docs/spec-v78.md … spec-v83.md   (the six feature specs)
```

The charter writes **no code**. It introduces Group B as a documented decision;
the actual `views/group-b.js`, the home/topic-hub group card, and the catalog
rows are created by the first feature spec that lands (v78), which references this
charter for the group rationale. README/CHANGELOG/`scope-mdcalc-parity.md`
catalog-count edits happen **per feature spec as it ships**, not here — at v77
close the catalog is still 337 and nothing is built.

## 7. Acceptance criteria

v77 is "accepted" as a charter when:

- The doctrine in §2 is the cited contract in every v78–v83 spec (each links back
  to "[spec-v77](spec-v77.md) §2").
- The roster in §4 and the data strategy in §5 are the agreed program shape, or
  are amended here before a feature spec implements against them.
- Group B "Billing & Reimbursement" is reserved (§3); no other spec claims letter
  B for a different purpose.
- No code, no tile, no catalog-count change ships under v77; `UTILITIES.length`
  stays **337** and all catalog-truth surfaces ([spec-v46](spec-v46.md)) are
  untouched.

## 8. Out of scope for the whole program (v77–v83)

- **No browsable code/payer/form directories.** The v29-retired CMS-1500/UB-04
  field decoders, the EOB/MSN/insurance-card decoders, the payer-policy lists, and
  the NSA/IDR eligibility infographic stay retired ([spec-v63](spec-v63.md) §7).
  The suite ships **calculators and validators**, never lookup tables dressed as
  tools.
- **No claim submission, no clearinghouse, no EHR/PMS integration, no eligibility
  (270/271) or claim-status (276/277) transactions.** Every tile is a local
  computation; none touches a network or a real claim.
- **No proprietary CPT®/AMA descriptor corpus.** The suite computes with codes the
  user enters and the public-domain values CMS publishes; it ships no licensed
  full-text CPT file.
- **No coding/medical-necessity adjudication.** The tools compute the rule's math
  (payment, edit indicator, deadline, units); they do not decide whether a service
  was medically necessary, correctly documented, or actually payable. That
  judgment, and the payer's contract, remain the user's.
