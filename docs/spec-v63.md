# spec-v63.md — Deepen the operations tools: a regulatory-deadline engine, denial→next-step routing, generator linting, inline rule provenance; +5 ops calculators

> Status: proposed (2026-06-09). v63 is the operations-side
> counterpart to [spec-v62](spec-v62.md): it deepens the
> billing / coding / regulatory / patient-administrative tiles the
> same way v62 deepens the bedside tiles, and adds the ops
> calculators that gap analysis shows are missing. It has two
> parts.
>
> **Part A** is a zero-tile *depth* pass. The ops tiles today tell
> you *what the rule is*; they do not (1) **compute the clock** the
> rule sets, (2) tell you the **next step** when a claim is denied,
> (3) check **your document against the rule's required elements**,
> (4) carry the **specific governing citation inline with a
> freshness signal**, or (5) **chain into the workflow** the ops
> user actually runs. Part A adds those five, each mirroring a v62
> capability.
>
> **Part B** adds **5** deterministic, cited ops calculators in the
> confirmed gaps — Medicare appeal-level deadlines, claim
> timely-filing deadlines, the 2021 E/M Medical-Decision-Making
> level (the half of the 2021 E/M rules `em-time` does not cover),
> the prior-authorization decision-turnaround clock, and the 60-day
> overpayment report-and-return clock.
>
> Catalog effect at v63 close: **328 + 5 = 333 tiles.** There is no
> Part C: the v62 render-tree audit confirmed the only two residual
> static reference tables were both *clinical* (`anticoag-reversal`,
> `peds-dose`); every live ops tile already consumes input and is
> calculator- or generator-shaped, so none needs converting.
>
> Every prior spec (v4 through v62) remains in force. v63 adds no
> runtime network call and no AI; every deadline is deterministic
> date arithmetic, every rule is anchored to a citable authority
> (CFR section, CMS manual/transmittal, AMA CPT guideline) under the
> [spec-v60](spec-v60.md) citation contract and the
> [spec-v52](spec-v52.md)/[`pa-maintenance.md`](pa-maintenance.md)
> staleness discipline, and every input inherits the
> [spec-v59](spec-v59.md) safety contract. The multi-audience scope
> of [spec-v10](spec-v10.md) / [scope-mdcalc-parity](scope-mdcalc-parity.md)
> is preserved and, for the first time since [spec-v29](spec-v29.md),
> *extended on the operations side* — strictly within the §3
> calculator/linter shapes that v29 and v52 admit, and without
> reviving any retired infographic (see §6).

## 1. Thesis

The operations surface is real, cited, and — in one place — deep:
the Prior-Auth Packet Linter (`pa-lint`, [spec-v52](spec-v52.md)) is
~19,000 lines of rule engine, payer logic, redaction, and a
maintained staleness ledger. The rest of the ops catalog
(`em-time`, `ndc-convert`, `appeal-letter`, `hipaa-roa`,
`hipaa-auth`, `breach-clock`, `roi`, `specialty-visit`, `prep`,
`wallet-card`) is a set of correct-but-shallow generators and
selectors. The shallowness is the same shape v62 found on the
clinical side — the tools describe a rule but do not do the four
things an ops user does with it:

1. **They state a deadline; they don't compute it.** `hipaa-roa`'s
   own helper text says covered entities "must respond within 30
   days" — but the tile does not take the request date and return
   the response-due date. The *only* computed regulatory deadline
   in the entire catalog is `breach-clock`'s HIPAA 60-day clock
   (`lib/regulatory.js`). Appeal-filing deadlines, claim
   timely-filing limits, PA decision-turnaround windows, and the
   60-day overpayment clock — the deadlines that cost real money
   when missed — are computed nowhere. Worse: **no business-day or
   federal-holiday math exists in the codebase**, so the deadlines
   that the regulations define in *business days* (No Surprises
   Act, several appeal steps) cannot be computed correctly even
   ad hoc.
2. **They don't route from a denial.** A denied claim arrives with
   a reason; the ops user needs to know *is this appealable, at
   what level, by what date, with what tile*. `appeal-letter`
   generates a letter but is blind to the denial reason, the
   appeal level, and the filing deadline; nothing connects the
   denial to the deadline to the letter.
3. **They generate documents but don't validate them.** v52
   established the **document linter** as a sanctioned §3 tile
   shape, and built a deep one for PA packets. The other
   generators (`appeal-letter`, `hipaa-roa`, `hipaa-auth`, the
   breach notice implied by `breach-clock`) emit a document but
   never check it against the rule's **required elements** (45 CFR
   164.508(c) authorization core elements; 164.524 access-request
   elements; 164.404(c) breach-notice content). The linter pattern
   exists; it is applied to one tile of several.
4. **Their provenance is uneven and their freshness invisible.**
   `lib/regulatory.js` is the model: every output line carries its
   45 CFR subsection inline. Most ops tiles cite at the tile level,
   not the line level, and none surfaces the staleness-ledger
   signal the PA toolchain already maintains — so a user cannot
   tell whether the rule behind a number was verified this quarter
   or two years ago.

v63 closes all four, plus the workflow-chaining gap, and adds the
five missing ops calculators.

## 2. Part A — ops depth pass (zero new tile)

Part A changes **no existing output**. It adds a shared engine,
metadata, validation, and render wiring, each inheriting the
[spec-v59](spec-v59.md) safety contract (every interpolated value
through `fmt()`; bad/empty/impossible input → a visible note, never
a silent or wrong date). Each row maps to its v62 sibling.

| # | Capability (v62 analog) | What / why for the ops user | Files |
|---|---|---|---|
| OA1 | **Regulatory-deadline engine** (mirrors v62 A1 trend/clock) — new `lib/deadline.js`, generalizing `lib/regulatory.js` | A deterministic, timezone-safe clock that, given an **anchor date** + a named **regulatory window**, returns the **deadline date, days elapsed, days remaining, and a past-due flag** — in **calendar days *or* federal business days**, with the **federal-holiday set (5 U.S.C. §6103)** and weekend roll-forward. Ships the holiday table as data with its own staleness-ledger row. Powers `breach-clock` (unchanged result) and every Part B deadline tile from one audited code path. This is the missing primitive: ops is deadlines, and the catalog can compute exactly one. | `lib/deadline.js` (new), `lib/regulatory.js` (re-pointed onto it), `lib/pa/date.js` (business-day helper shared) |
| OA2 | **Denial → next-step routing** (mirrors v62 A2 action) | Add a denial-reason **input** to the appeal cluster that drives a computed next step: plain-language meaning → **is it appealable** → **which level + deadline** (via OA1) → **which tile to open next**, each line citing the governing 42 CFR §405 subpart / CMS manual section. This is an input-driven decision (denial reason → computed routing), **not** a browsable CARC/RARC index (retired by v29 §3) — no code list is shipped or searchable. | `lib/coding-v5.js` (denial→action map, data), `views/group-c.js`, `app.js` `renderMetaBlock` |
| OA3 | **Generator completeness linting** (mirrors v62 A3 reverse-solve/"what's missing") — extends the v52 linter shape | Give each document generator a "completeness check: what's missing to satisfy the rule," reusing the `pa-lint` finding/report pattern at small scale: `hipaa-auth` against the **45 CFR 164.508(c)** core elements, `hipaa-roa` against **164.524** request elements, `appeal-letter` against the elements a valid appeal must contain (claim/member id, the denial reason addressed, the coverage basis cited, the filing deadline, signature/date), and the breach notice (`breach-clock`) against **164.404(c)** content. Each missing element is a labeled finding with its CFR anchor — turning "document generator" into "rule-validated document generator." | `lib/regulatory.js` (element checklists, data), `views/group-c.js`, `group-h.js` |
| OA4 | **Inline rule provenance + freshness** (mirrors v62 A5 substituted-derivation + v60 currency) | Make `lib/regulatory.js`'s line-level-citation model the catalog norm: every ops output line carries its **specific** governing citation (CFR subsection, CMS transmittal/manual section, AMA CPT guideline), and every ops tile surfaces the **staleness-ledger freshness signal** the PA toolchain already maintains. Extend `pa-staleness-ledger.json` to cover the **non-PA** ops rules (appeal deadlines, timely-filing limits, E/M guidelines, overpayment rule, the federal-holiday table) so the [`pa-maintenance.md`](pa-maintenance.md) / `check-pa-staleness` CI gate guards them too. | `lib/meta.js` (line citations), `pa-staleness-ledger.json`, `lib/pa/staleness-ledger.js`, `scripts/check-pa-staleness.mjs` |
| OA5 | **Workflow chaining + clean structured output** (mirrors v62 related-tools + chart-ready copy) | Seed the **ops related-tool cluster** (denial → `appeal-deadline` → `appeal-letter` → `roi`; PA request → `pa-turnaround` → `pa-lint`; breach → `breach-clock` → notice-content lint) using the v61 A2 `META[].related` mechanism, and give every generator a clean **paste-ready / printable** output via the existing `formatCopyAll` ([spec-v61](spec-v61.md) A3) and `renderPrintable` ([spec-v61](spec-v61.md) A6) paths, with the "No data was sent or stored" footer. | `lib/meta.js` (`related` seeds), `lib/clipboard.js`, `lib/print.js`, the ops view modules |

Part A adds a shared engine, data, and render wiring only. No new
network call, no AI, no change to any current output. The new
deadline engine is pure date arithmetic over UTC-midnight dates
(the `lib/pa/date.js` convention, incl. the `SOPHIEWELL_NOW` pinning
for byte-stable golden tests).

## 3. Part B — the 5 new ops calculators

Each passes the [spec-v29](spec-v29.md) §3 one-line test (input →
computed output), inherits the [spec-v59](spec-v59.md) safety
contract, ships its primary citation inline with a
[spec-v60](spec-v60.md) `accessed` + ledger row, and computes its
deadline through the OA1 engine. None duplicates an existing tile or
revives a v29-retired infographic (§6); near-neighbors are named.

### 3.1 `appeal-deadline` — Medicare claim appeal-level deadline calculator
- **Citation:** 42 CFR Part 405, Subpart I (§§405.942 redetermination
  120 days; 405.962 QIC reconsideration 180 days; 405.1014 OMHA/ALJ
  hearing 60 days; 405.1102 Council review 60 days; federal district
  court 60 days). CMS Medicare Claims Processing Manual, Ch. 29.
- **citationUrl:** https://www.ecfr.gov/current/title-42/part-405/subpart-I
- **Group:** Patient Bill & Insurance Tools (`C`). **Audiences:**
  `billers`, `patients`. 
- **Inputs:** the appeal level just completed (or the initial
  determination), the decision/notice date, and — for the ALJ and
  federal-court steps — the amount in controversy.
- **Output:** the **next level, its filing deadline (date + days
  remaining via OA1)**, and the **amount-in-controversy gate** for
  the levels that have one (annually indexed; carried as a dated,
  ledger-tracked constant). Drives OA2 routing and pre-fills
  `appeal-letter`. **Near-neighbor:** `appeal-letter` (writes the
  letter; does not compute the clock) — complementary.

### 3.2 `timely-filing` — Claim timely-filing deadline by payer
- **Citation:** 42 CFR §424.44 (Medicare: one calendar year after the
  date of service; ACA §6404). State Medicaid and commercial limits
  entered by the user as a parameter (no payer list is shipped or
  browsable — the user supplies their plan's limit).
- **citationUrl:** https://www.ecfr.gov/current/title-42/section-424.44
- **Group:** Patient Bill & Insurance Tools (`C`). **Audiences:**
  `billers`.
- **Inputs:** date of service, payer type (Medicare preset = 365 days;
  "other" = user-entered limit in days/months), optional calendar-vs-
  business-day basis.
- **Output:** the **filing deadline date and days remaining** (OA1),
  with the Medicare one-year basis cited and the explicit note that
  Medicaid/commercial limits vary and must be confirmed against the
  user's contract. Calculator-shaped; ships no payer directory.

### 3.3 `em-mdm` — 2021 E/M level by Medical Decision Making
- **Citation:** AMA CPT Evaluation and Management (E/M) Guidelines,
  2021 office/outpatient revision (extended to other E/M settings,
  2023): level set by **2 of 3** of number/complexity of problems,
  amount/complexity of data reviewed, and risk of complications.
- **citationUrl:** https://www.ama-assn.org/practice-management/cpt/cpt-evaluation-and-management
- **Group:** Code Lookup → calculator survivor (`A`). **Audiences:**
  `billers`, `clinicians`.
- **Inputs:** the three MDM elements graded against the AMA grid
  (problems addressed; data reviewed; risk).
- **Output:** the **MDM-based E/M level (2–5)** with the limiting
  element shown (the "2 of 3" driver), mirroring `em-time`'s output
  shape. Completes the 2021 E/M rules: `em-time` covers the
  **time-based** path, `em-mdm` the **MDM** path — the two ways a
  visit level is set. **Near-neighbor:** `em-time` (time path) —
  explicitly the other half; both retained and cross-linked (OA5).

### 3.4 `pa-turnaround` — Prior-authorization decision-deadline clock
- **Citation:** CMS Interoperability and Prior Authorization Final
  Rule (CMS-0057-F, 2024): for impacted payers (MA, Medicaid/CHIP
  FFS & managed care, QHPs on the FFEs), **standard PA decisions
  within 7 calendar days and expedited within 72 hours** (effective
  2026); commercial/ERISA windows entered by the user.
- **citationUrl:** https://www.federalregister.gov/documents/2024/02/08/2024-00895/
- **Group:** Patient Bill & Insurance Tools (`C`). **Audiences:**
  `billers`, `clinicians`.
- **Inputs:** PA request submission date/time, request type (standard
  vs expedited), program (preset CMS-0057-F windows; or user-entered
  for commercial).
- **Output:** the **decision-due date/time and time remaining** (OA1),
  flagging an over-window determination. Drives the prior-auth
  follow-up the requesting office tracks. **Near-neighbor:** `pa-lint`
  (audits packet completeness; spec-v52) and `prior-auth` (checklist)
  — neither computes the payer's decision clock; this does.

### 3.5 `overpayment-60day` — 60-day overpayment report-and-return clock
- **Citation:** ACA §6402(a) (42 U.S.C. §1320a-7k(d)); 42 CFR
  §401.305 (Medicare A/B overpayments; report and return within
  **60 days of identification**). Companion to `breach-clock` as the
  catalog's other federal 60-day clock.
- **citationUrl:** https://www.ecfr.gov/current/title-42/section-401.305
- **Group:** Patient Bill & Insurance Tools (`C`). **Audiences:**
  `billers`.
- **Inputs:** the identification date (and an optional
  investigation-period note, since the rule allows reasonable
  diligence before the clock starts).
- **Output:** the **report-and-return deadline (date + days
  remaining)** via OA1, with the §401.305 "identification" and
  reasonable-diligence caveats cited. Calculator-shaped; states the
  rule's deadline only, makes no judgment that an overpayment occurred
  (the `breach-clock` posture).

## 4. Per-tile / per-capability robustness

- All deadline math goes through `lib/deadline.js`, which operates on
  UTC-midnight dates (no local-timezone drift) and rejects an invalid,
  empty, or future-where-impossible anchor date with a `fmt()`/note
  fallback — never a wrong or `Invalid Date` output. Business-day mode
  rolls weekends and the 5 U.S.C. §6103 federal holidays forward
  deterministically; the holiday table is dated and ledger-tracked.
- The federal-holiday table, the appeal-level day counts, the timely-
  filing one-year basis, the CMS-0057-F windows, the E/M guideline
  edition, and the amount-in-controversy thresholds are **dated
  constants with `pa-staleness-ledger.json` rows**; the
  `check-pa-staleness` CI gate ([spec-v52](spec-v52.md) §8.3) fails
  when any goes unverified past the policy window.
- OA2 denial routing and OA3 completeness linting are **input-driven
  decisions and validations**, not browsable indexes; they ship no
  code directory and add nothing searchable (so they do not reopen the
  v29 §3 code-reference retirement).
- Every Part B tile renders the explicit "this surfaces the regulatory
  deadline / level only; confirm against your plan contract and the
  current rule" note — the `breach-clock`/`regulatory.js` posture: it
  computes the date, it does not give legal advice or decide
  eligibility.
- The new `lib/deadline.js` and the 5 compute functions are added to
  the [spec-v59](spec-v59.md) fuzz harness on import; zero non-finite
  or `Invalid Date` leaks is a merge gate.

## 5. Files touched

```
docs/spec-v63.md                          (this file)
app.js                                     (+5 UTILITIES rows; OA2 denial-routing + OA3 completeness findings + OA5 related/print/copy render in renderMetaBlock)
lib/deadline.js                            (new: calendar + federal-business-day deadline engine; federal-holiday table; pure, UTC-midnight)
lib/regulatory.js                          (re-pointed onto lib/deadline.js; +OA3 required-element checklists for 164.508(c)/164.524/164.404(c); breach result unchanged)
lib/coding-v5.js                           (OA2 denial-reason -> next-step routing map, data only)
lib/<ops compute module>                   (new compute exports: appeal-deadline, timely-filing, em-mdm, pa-turnaround, overpayment-60day)
lib/meta.js                               (+5 META entries w/ inline line-level citation, citationUrl, accessed; OA4 line citations; OA5 `related` ops cluster seeds)
lib/clipboard.js, lib/print.js             (consumed by the ops generators for clean paste-ready/printable output — OA5; no behavior change)
pa-staleness-ledger.json                   (+rows: federal-holiday table, appeal-level deadlines, timely-filing basis, CMS-0057-F windows, E/M edition, AIC thresholds, overpayment rule)
lib/pa/staleness-ledger.js, scripts/check-pa-staleness.mjs   (recognize the new non-PA ops source families)
views/group-a.js, group-c.js, group-h.js   (Part B renderers; OA2/OA3/OA4/OA5 rollout on the ops tiles)
test/unit/<each new tile>.test.js          (5 new unit tests, >=3 boundary worked examples incl. invalid-date and business-day-rollover cases)
test/unit/deadline.test.js                 (new: calendar vs business-day, holiday rollover, past-due, invalid-input fallback)
test/integration/fuzz-tools.spec.js        (import the new ops compute module)
docs/audits/v12/<each new tile>.md         (spec-v11 audit logs)
docs/scope-mdcalc-parity.md                (catalog 328 -> 333; note the ops-side §3-shaped extension and the v29 boundary it respects)
docs/pa-maintenance.md                     (note the ledger now covers non-PA ops rule families)
CHANGELOG.md                               (Unreleased: v63 entry, +5 and the Part A ops-depth capabilities)
README.md, package.json                    (catalog count 328 -> 333)
```

## 6. Acceptance criteria

v63 is fully shipped when:

**Part A**
- `lib/deadline.js` exists, is pure and UTC-midnight, supports
  calendar **and** federal-business-day modes with the 5 U.S.C. §6103
  holiday set, and rejects bad input with a `fmt()`/note fallback;
  `deadline.test.js` covers calendar, business-day rollover, holiday,
  past-due, and invalid-date cases. `breach-clock`'s output is
  byte-identical to today (regression-pinned).
- OA2 denial routing renders an input-driven next-step (level +
  deadline + tile), each line cited, shipping no browsable code list.
- OA3 completeness findings render for `hipaa-auth` (164.508(c)),
  `hipaa-roa` (164.524), `appeal-letter`, and the breach notice
  (164.404(c)); a test asserts each finding carries a CFR anchor.
- OA4: every ops output line carries its specific citation, and every
  ops tile surfaces the staleness-ledger freshness signal; the new
  non-PA rule families are in `pa-staleness-ledger.json` and guarded by
  `check-pa-staleness`.
- OA5: the ops `related` cluster renders and resolves to real tiles
  (the v61 related-tools test extends to it); generators offer the
  clean `formatCopyAll`/`renderPrintable` output with the no-data
  footer.

**Part B**
- All 5 tiles in §3 are present: each has a `META[id]` entry, an inline
  cited output with a `citationUrl`, >=3 boundary worked examples in
  its unit test (incl. invalid-date and business-day-rollover where
  applicable), a [spec-v11](spec-v11.md) audit log, and computes its
  deadline through `lib/deadline.js`; each passes [spec-v29](spec-v29.md)
  §3.
- Every dated constant (holidays, deadlines, windows, thresholds, E/M
  edition) has a `pa-staleness-ledger.json` row and an `accessed` date.

**Whole spec**
- Every new compute function uses `lib/num.js`/`lib/pa/date.js`
  conventions, is covered by the [spec-v59](spec-v59.md) fuzz harness
  with zero non-finite / `Invalid Date` leaks.
- `UTILITIES.length` is 333 and all catalog-truth surfaces
  ([spec-v46](spec-v46.md)) agree.
- `npm run lint`, `npm run test`, `npm run sbom`, `npm run build`, and
  `npm run check-pa-staleness` all pass.
- The CHANGELOG records v63 with the +5 delta and the Part A ops-depth
  capabilities.

## 7. Out of scope for v63

- **No revival of v29-retired infographics.** COBRA timeline, Medicare
  enrollment, ACA SEP, birthday rule, ABN explainer, MSN/EOB/insurance-
  card decoders, the **NSA / IDR eligibility tree**, and the CMS-1500 /
  UB-04 field decoders stay retired. v63 adds only §3-shaped
  *calculators* (input dates/elements → computed deadline/level) and
  §52-shaped *linters*; it ships no browsable code, payer, or form
  directory. A No-Surprises-Act open-negotiation / IDR **business-day
  timeline calculator** is a plausible future tile but is **deferred**:
  it sits close enough to the retired IDR eligibility tree that it
  warrants an explicit [spec-v29](spec-v29.md) amendment before
  building, not a quiet add here.
- **No legal advice or eligibility adjudication.** Every tile computes
  a regulatory date or code-set level and cites the rule; it does not
  decide whether a breach/overpayment occurred, whether an appeal will
  succeed, or whether a service is covered. (`regulatory.js` posture.)
- **No runtime fetch of CFR/CMS/AMA sources.** No-network is a hard
  commitment ([spec-v50](spec-v50.md) §3.1); currency is enforced at
  build time by the staleness ledger and CI, per
  [`pa-maintenance.md`](pa-maintenance.md).
- **No deepening of the clinical tiles** — owned by
  [spec-v62](spec-v62.md); v63 touches only the ops surface and the
  shared `deadline`/`staleness`/`clipboard`/`print` infrastructure.
- **State-by-state Medicaid/commercial deadline directories** —
  deferred. `timely-filing` and `pa-turnaround` take the non-Medicare
  limit as a user-supplied parameter rather than shipping a payer
  directory (which would reopen the v29 code/payer-index retirement).
```
