# spec-v79.md — Claim edits & modifier logic: will this line deny, and which modifier unlocks it; +5 tiles

> Status: **IMPLEMENTED (2026-06-15).** Second feature spec of the
> [spec-v77](spec-v77.md) billing & coding program. Adds **5 deterministic
> edit/modifier tools** that answer the denial questions a coder fights every day:
> are these two codes an NCCI bundle, can a modifier unbundle them, are the units
> over the MUE, is this visit inside a global package, which X-modifier fits, and
> in what order do the modifiers go. The complement to [spec-v78](spec-v78.md):
> v78 prices the line, v79 decides whether the line survives.
>
> **Implementation notes (deviations from §4, all within doctrine):** (1) The five
> unit tests ship as a **single `test/unit/billing-v79.test.js`** (19 tests, ≥3
> boundary examples per tile), mirroring the v78 `billing-v78.test.js` precedent
> rather than five files — same coverage, one import surface. (2) The
> [spec-v59](spec-v59.md) fuzz harness lives at `test/unit/fuzz-tools.test.js`
> (not the `test/integration/fuzz-tools.spec.js` path §4 names, which does not
> exist — same correction v78 documented); **both `lib/billing-v79.js` and
> `lib/billing-v78.js` are now added to it** (every export throw-safe and string-
> leak-free across the object-aware matrix; 378 harness tests pass), closing the
> v78 acceptance bullet that the deviation had left open. (3) `modifier-x-selector`
> takes an explicit top-level **`distinctService`** boolean in addition to the
> four scenario flags, which is what cleanly separates the "59 fallback" path
> (a distinct service that fits no X-subset) from the "hard refusal" path (no
> distinct-service basis at all) the §2.3 output requires. (4) The five tiles are
> added to the **billing-and-coding topic page** (`scripts/build-topic-pages.mjs`)
> and the v78 Group B related-tools cluster, beyond the §4 file list.
>
> Catalog effect: **342 → 347 (+5).** Home: **Group B — Billing & Reimbursement**
> ([spec-v77](spec-v77.md) §3).
>
> Every tile obeys the [spec-v77](spec-v77.md) §2 doctrine. Per doctrine clause 2,
> **no NCCI PTP table and no MUE table are bundled** — these tiles take the
> published edit indicator / MUE value as **input** and compute the decision, the
> [`timely-filing`](spec-v63.md) posture. They are decision engines, not the
> quarterly CMS edit file.

## 1. Thesis

Claim denials are not random; they are the deterministic output of a small set of
CMS edit rules. The coder's daily questions each have a single correct answer
given a few inputs:

- *Procedure-to-procedure (PTP):* code pair → is it an edit, which is the
  Column 1 (payable) code, and does the **modifier indicator (0/1/9)** permit a
  modifier to break the bundle?
- *Medically Unlikely Edits (MUE):* code + units vs the MUE value, adjudicated by
  the **MAI (1 = line edit, 2 = per-date-of-service absolute, 3 = per-DOS, clinical
  review)** — does it cut to the limit, split lines, or require documentation?
- *Modifier 59 / X{EPSU}:* given the clinical scenario (separate encounter /
  site / practitioner / non-overlapping service), which of `XE`, `XS`, `XP`, `XU`
  is correct, and is the blunt `59` even acceptable?
- *Global surgery:* a post-op visit's date vs the surgery's global period
  (000/010/090/XXX) → inside the package or separately billable, and which modifier
  (24/25/57/58/78/79) is required?
- *Modifier order:* modifiers on a line are not interchangeable — **pricing**
  modifiers must precede **informational** ones or the line mis-prices.

Each is a clean input→decision computation. v79 ships all five, each citing the
exact CMS authority and refusing to guess where an input is missing.

## 2. The five tiles

Each passes the [spec-v29](spec-v29.md) §3 one-line test, inherits the
[spec-v59](spec-v59.md) safety contract, ships its citation inline with an
`accessed` + ledger row, and renders the [spec-v77](spec-v77.md) §2 posture note.

### 2.1 `ncci-ptp` — NCCI procedure-to-procedure edit & modifier-override checker
- **Citation:** CMS National Correct Coding Initiative (NCCI) Policy Manual,
  Chapter I (general correct-coding); the PTP edit pairs and their
  **modifier indicator** (0 = no modifier permitted; 1 = a permitted NCCI-
  associated modifier may bypass; 9 = edit deleted/not active). Pub. 100-04
  Ch. 23.
- **citationUrl:** https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits
- **Group:** Billing & Reimbursement (`B`). **Audiences:** `coders`, `billers`,
  `compliance`.
- **Inputs:** the two codes; which is reported as the comprehensive vs component
  (or "unknown — explain the ordering rule"); the pair's **modifier indicator**
  (entered from the user's NCCI lookup — not shipped) ; and, if a bypass is being
  considered, the proposed modifier.
- **Output:** the **Column 1 / Column 2 determination** (which code is payable,
  which is bundled), whether a modifier **can** unbundle the pair under the entered
  indicator (0 → "cannot bill the component separately, period"; 1 → "permitted
  only with an appropriate, documented NCCI-associated modifier"; 9 → "edit not
  active"), and whether the **proposed modifier is an NCCI-associated modifier**
  (the 59/X{EPSU}, anatomic, and global modifiers CMS recognizes). Refuses to bless
  a bypass on an indicator-0 pair. **Near-neighbor:** `modifier-x-selector` (which
  X-modifier); `mue-check` (units, not pairing).

### 2.2 `mue-check` — Medically Unlikely Edits units adjudication
- **Citation:** CMS MUE program; the **MUE Adjudication Indicator (MAI)**:
  1 = claim-line edit (units over the value on a line deny, may bypass with a
  modifier-justified second line); 2 = date-of-service edit, **absolute** (per
  anatomic/policy reasons units can never exceed the value); 3 = date-of-service
  edit, units over the value are denied but reviewable with documentation.
- **citationUrl:** https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits/medicare-ncci-medically-unlikely-edits
- **Group:** Billing & Reimbursement (`B`). **Audiences:** `coders`, `billers`,
  `compliance`.
- **Inputs:** the code; the units billed; the **MUE value** and **MAI** (entered
  from the user's MUE lookup — not shipped); whether the units are reported on one
  line or split across lines/dates.
- **Output:** the **pass/deny decision** and *why*: under MAI 1 it explains the
  per-line cut and whether splitting lines with a documented modifier can rescue
  the excess; under MAI 2 it states the excess is **absolutely** non-payable and
  must not be appealed as a units error; under MAI 3 it flags the excess as
  deniable-but-reviewable and prompts for the documentation. Computes the
  **payable units** and the **units at risk**. The tool that stops a coder from
  appealing an MAI-2 edit that will never pay.

### 2.3 `modifier-x-selector` — 59 vs XE / XS / XP / XU decision
- **Citation:** CMS Pub. 100-04 Ch. 23 and the NCCI Policy Manual on the
  **distinct procedural service** modifiers: `XE` (separate **E**ncounter), `XS`
  (separate **S**tructure/anatomic site), `XP` (separate **P**ractitioner), `XU`
  (**U**nusual, non-overlapping service), and `59` (use only when no X-modifier
  describes the situation). CMS MLN *Proper Use of Modifiers 59 & X{EPSU}*.
- **citationUrl:** https://www.cms.gov/files/document/proper-use-modifiers-59-xepsu.pdf
- **Group:** Billing & Reimbursement (`B`). **Audiences:** `coders`, `billers`.
- **Inputs:** a short decision tree on the clinical scenario — were the services a
  **separate encounter**, on a **separate anatomic site/structure**, by a
  **separate practitioner**, or a **distinct non-overlapping service** at the same
  encounter?
- **Output:** the **single most specific X-modifier** the scenario supports
  (XE/XS/XP/XU), or `59` only when none of the four applies, with the CMS preference
  for the specific X-modifier over the blunt 59 stated explicitly, and a hard "no
  distinct-service basis present — a distinct-procedure modifier is **not**
  appropriate here" when the scenario supports none. Feeds the proposed modifier
  back into `ncci-ptp`.

### 2.4 `global-period` — Global surgery package date math & required modifier
- **Citation:** CMS Pub. 100-04 Ch. 12 §40 (global surgery package); the MPFS
  **`GLOB DAYS`** indicator (000 = 0-day; 010 = minor, 10-day; 090 = major, 90-day;
  XXX = concept doesn't apply; YYY/ZZZ/MMM = carrier-priced/related/maternity). CMS
  MLN *Global Surgery Booklet*. Pre-op modifier 57 (major) / 25 (minor) and post-op
  24/58/78/79.
- **citationUrl:** https://www.cms.gov/outreach-and-education/medicare-learning-network-mln/mlnproducts/downloads/globallsurgery-icn907166.pdf
- **Group:** Billing & Reimbursement (`B`). **Audiences:** `coders`, `billers`,
  `surgical-billing`.
- **Inputs:** the surgery date; the procedure's global-days indicator (looked up
  from `data/mpfs`, or entered); the **subsequent encounter's date**; and the
  encounter's nature (unrelated E/M; staged/related procedure; return to OR for a
  complication; unrelated procedure; the pre-op decision-for-surgery visit).
- **Output:** whether the subsequent encounter falls **inside the global package**
  (computed from surgery date + global days, calendar math via
  [`lib/deadline.js`](spec-v63.md)), and if so the **modifier that unlocks separate
  payment** for its nature (24 = unrelated E/M in the global; 58 = staged/related;
  78 = return to OR, complication; 79 = unrelated procedure; 57/25 = the
  decision-for-surgery visit just *before* the global starts), or "outside the
  global period — bill normally." The visit-bundled-into-surgery question, answered
  with a date and an indicator. **Near-neighbor:** `rvu-payment` (the major-surgery
  fee already includes the 90-day package — this tells you when a visit is *extra*).

### 2.5 `modifier-order` — Pricing vs informational modifier sequencing
- **Citation:** CMS Pub. 100-04 Ch. 12 / 23 modifier-reporting guidance and
  payer claim-editing convention: **pricing** (payment-affecting) modifiers are
  reported **before** **informational/statistical** modifiers, and modifier 51 /
  the functional/therapy modifiers follow their own ordering — wrong order
  mis-prices or rejects the line.
- **citationUrl:** https://www.cms.gov/regulations-and-guidance/guidance/manuals/downloads/clm104c12.pdf
- **Group:** Billing & Reimbursement (`B`). **Audiences:** `coders`, `billers`.
- **Inputs:** the up-to-four modifiers a coder wants on a line (entered, or picked
  from the bundled `data/hcpcs-modifiers` / `data/crosswalks/modifier-codes` we
  already ship).
- **Output:** the modifiers **re-sequenced into the correct claim order** (pricing
  first, ranked, then informational), each tagged **pricing vs informational**, with
  a flag on any pair that **conflicts** (e.g., two anatomically contradictory
  modifiers, or a pricing modifier the line can't carry twice). The "why did this
  clean-looking claim under-pay" fix that is invisible until you check the order.

## 3. Robustness

- **The edit data is the user's, by design.** `ncci-ptp` and `mue-check` ship
  **no** PTP/MUE file (doctrine clause 2 — those are large quarterly CMS downloads).
  They take the indicator/value as input and compute the *decision*. An optional
  clearly-labeled "illustrative example" seed may prefill the fields; it is never
  presented as the live edit file, so the tool can never be silently stale.
- **Indicators gate, they never guess.** Modifier indicator 0, MAI 2, global
  indicator XXX, and an unsupported X-modifier scenario each produce a hard,
  specific "cannot / not applicable" — never a permissive default that would
  green-light an unbillable claim.
- **Global date math reuses [`lib/deadline.js`](spec-v63.md).** UTC-midnight,
  calendar days, the day-0 convention stated and tested; no `Invalid Date`, no
  timezone drift. Surgery-date-in-the-future and subsequent-before-surgery are
  caught with a `note`, not a wrong window.
- **Decision constants are ledger-tracked.** The modifier-indicator semantics, the
  MAI semantics, the global-days definitions, and the 59/X{EPSU} hierarchy are
  dated constants with `pa-staleness-ledger.json` rows (ruleFamily `billing-v79`);
  `check-pa-staleness` guards them.
- All five compute functions join the [spec-v59](spec-v59.md) fuzz harness on
  import; zero non-finite / `Invalid Date` leaks is a merge gate.

## 4. Files touched

```
docs/spec-v79.md                 (this file)
app.js                           (+5 UTILITIES rows in Group B)
views/group-b.js                 (renderers for the 5 edit/modifier tiles; decision-tree + re-sequenced-modifier output)
lib/billing-v79.js               (new compute exports: ncciPtp, mueCheck, modifierXSelector, globalPeriod, modifierOrder)
lib/deadline.js                  (reused by global-period; no behavior change — regression-pinned)
lib/data.js                      (read MPFS GLOB DAYS; reuse data/hcpcs-modifiers + data/crosswalks for modifier-order)
lib/meta.js                      (+5 META entries: inline citation, citationUrl, accessed; related-tools seeds)
pa-staleness-ledger.json         (+rows: modifier-indicator/MAI/global-days/X{EPSU} semantics — ruleFamily billing-v79)
lib/pa/staleness-ledger.js, scripts/check-pa-staleness.mjs   (recognize ruleFamily billing-v79)
test/unit/ncci-ptp.test.js … modifier-order.test.js (5 unit tests, ≥3 boundary examples each, incl. indicator-0 gate, MAI-2 absolute, in/out of global boundary day, pricing-before-informational reorder)
test/integration/fuzz-tools.spec.js   (import lib/billing-v79.js)
docs/audits/v12/<each new tile>.md     (spec-v11 audit logs)
docs/scope-mdcalc-parity.md            (catalog 342 → 347)
README.md, package.json                (catalog count 342 → 347; spec-progression line → v79)
CHANGELOG.md                           (Unreleased: v79 entry, +5)
```

## 5. Acceptance criteria

- All 5 tiles in §2 are live in Group B with a `META[id]` entry, inline cited
  output + `citationUrl` + `accessed`, ≥3 boundary worked examples per unit test, a
  [spec-v11](spec-v11.md) audit log, and pass [spec-v29](spec-v29.md) §3.
- `ncci-ptp` returns the correct bypass verdict for indicators 0/1/9 and rejects a
  modifier on an indicator-0 pair; `mue-check` cuts/splits/flags correctly for
  MAI 1/2/3 and reports payable vs at-risk units; `modifier-x-selector` returns the
  most-specific X-modifier (or the no-basis refusal); `global-period` classifies a
  visit on the boundary day correctly for 000/010/090/XXX and names the right
  24/25/57/58/78/79 modifier; `modifier-order` re-sequences pricing-before-
  informational and flags a conflicting pair.
- No PTP or MUE file ships; entering an indicator/value makes the tools work for
  any pair/code (doctrine clause 2 verified). Any seeded example is labeled
  illustrative.
- Every decision constant has a `pa-staleness-ledger.json` row (ruleFamily
  `billing-v79`); `check-pa-staleness` passes.
- `lib/billing-v79.js` is in the fuzz harness with zero non-finite / `Invalid Date`
  leaks; `UTILITIES.length` is **347** and catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, `npm run build`,
  `npm run check-pa-staleness` pass; CHANGELOG records v79 with +5.

## 6. Out of scope for v79

- **No bundled NCCI/MUE edit files** ([spec-v77](spec-v77.md) §5/§8): these are
  decision engines over a user-supplied indicator/value, not the quarterly CMS
  table.
- **No medical-necessity / LCD-NCD adjudication.** The tools say whether a code
  pair is an *edit* and whether a modifier *can* bypass it; they do not decide
  whether the modifier is *documented* or the service was *covered* — that stays
  with the coder and the record.
- **No payer-specific edit variants.** v79 computes the CMS NCCI/MUE/global rules;
  commercial-payer edit overlays are entered by the user as the indicator/value,
  not shipped as a payer directory.
